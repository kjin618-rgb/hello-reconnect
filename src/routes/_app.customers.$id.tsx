import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, RefreshCw, Save, Sparkles, Eye, EyeOff, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { daysSince, expectedRecovery, formatDate, formatKRW, maskPhone, riskLabel, riskOf } from "@/lib/customer-utils";
import { generateMessage, type GenerateResult } from "@/lib/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/$id")({
  head: () => ({ meta: [{ title: "고객 상세 — 리봇" }] }),
  component: CustomerDetail,
  notFoundComponent: () => (
    <div className="text-center py-12">
      <p className="text-sm text-muted-foreground">해당 고객을 찾을 수 없어요.</p>
      <Button asChild variant="outline" className="mt-3"><Link to="/customers">고객 목록으로</Link></Button>
    </div>
  ),
});

const TONES = ["정중한", "다정한", "동네 사장님 말투", "짧고 담백한"];
const COUPONS = ["아메리카노 무료", "디저트 할인", "재방문 10% 할인", "직접 입력"];

function CustomerDetail() {
  const { id } = Route.useParams();
  const { customers, addMessage, settings } = useStore();
  const customer = useMemo(() => customers.find((c) => c.id === id), [customers, id]);
  if (!customer) throw notFound();

  const [showFullPhone, setShowFullPhone] = useState(false);
  const [tone, setTone] = useState(settings.defaultTone || "다정한");
  const [coupon, setCoupon] = useState(settings.defaultCoupon || "아메리카노 무료");
  const [customCoupon, setCustomCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const days = daysSince(customer.lastVisit);
  const r = riskOf(customer);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateMessage({ customer, tone, coupon, customCoupon, settings });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}을(를) 복사했어요.`);
  };

  const save = () => {
    if (!result) return;
    addMessage({
      id: `m${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      tone,
      coupon: coupon === "직접 입력" ? customCoupon || "직접 입력" : coupon,
      greeting: result.greeting,
      couponText: result.couponText,
      socialPost: result.socialPost,
      createdAt: new Date().toISOString(),
      status: "created",
    });
    toast.success("발송 준비함에 저장했어요.");
  };

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /> 이탈 고객 목록</Link>
        </Button>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              {customer.name}
              <span className={`text-[11px] font-medium rounded-md border px-1.5 py-0.5 ${
                r === "high" ? "bg-destructive/15 text-destructive border-destructive/30"
                : r === "warn" ? "bg-warn/25 text-warn-foreground border-warn/40"
                : "bg-success/15 text-success border-success/30"
              }`}>위험도 {riskLabel(r)}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">마지막 방문 후 {days}일이 지났어요.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">고객 정보</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="연락처">
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{showFullPhone ? customer.phone : maskPhone(customer.phone)}</span>
                  <button onClick={() => setShowFullPhone((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    {showFullPhone ? <><EyeOff className="h-3 w-3" /> 가리기</> : <><Eye className="h-3 w-3" /> 전체 보기</>}
                  </button>
                </div>
              </Row>
              <Row label="마지막 방문일">{formatDate(customer.lastVisit)}</Row>
              <Row label="선호 메뉴">{customer.favoriteMenu}</Row>
              <Row label="총 방문 횟수">{customer.visitCount}회</Row>
              <Row label="총 구매 금액">{formatKRW(customer.totalSpend)}</Row>
              <Row label="평균 객단가">{formatKRW(Math.round(customer.totalSpend / Math.max(customer.visitCount, 1)))}</Row>
              <Row label="예상 회복 매출">{formatKRW(expectedRecovery(customer))}</Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">AI 분석 요약</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>· {customer.name}님은 평균 {Math.round(customer.visitCount > 0 ? 30 / (customer.visitCount / 6) : 30)}일 간격으로 방문하던 단골이에요.</p>
              <p>· 가장 자주 구매하신 <span className="text-foreground font-medium">{customer.favoriteMenu}</span>을(를) 메시지에 언급하면 응답률이 올라가요.</p>
              <p>· 위험도가 <span className="text-foreground font-medium">{riskLabel(r)}</span>이므로, {r === "high" ? "오늘 안에 안부 메시지를 보내는 걸 추천드려요." : r === "warn" ? "이번 주 안에 가볍게 안부를 전해 보세요." : "여유롭게 다음 캠페인에 포함하세요."}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">AI 메시지 생성</CardTitle>
            <Badge variant="secondary" className="text-[10px]">MVP · 규칙 기반</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">말투</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">쿠폰 유형</Label>
                <Select value={coupon} onValueChange={setCoupon}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUPONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {coupon === "직접 입력" && (
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">직접 입력 쿠폰</Label>
                  <Input value={customCoupon} onChange={(e) => setCustomCoupon(e.target.value)} placeholder="예: 시그니처 케이크 1조각 무료" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={onGenerate} disabled={loading} className="flex-1">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {result ? "다시 생성" : "메시지 생성"}
              </Button>
              {result && (
                <Button variant="outline" onClick={save}><Save className="h-4 w-4" /> 저장</Button>
              )}
            </div>

            {result && (
              <div className="space-y-3 pt-1">
                <ResultBlock title="카카오톡 · 문자용 안부 메시지" text={result.greeting} onCopy={() => copy(result.greeting, "안부 메시지")} />
                <ResultBlock title="쿠폰 문안" text={result.couponText} onCopy={() => copy(result.couponText, "쿠폰 문안")} />
                <ResultBlock title="인스타그램 · 네이버 플레이스 게시글 초안" text={result.socialPost} onCopy={() => copy(result.socialPost, "게시글")} />
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Check className="h-3 w-3 mt-0.5 shrink-0" />
                  복사 후 카카오톡·문자 앱에서 직접 발송해 주세요. MVP 단계에서는 자동 발송 기능이 제공되지 않아요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 border-b last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

function ResultBlock({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <div className="border rounded-md">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <span className="text-xs font-medium">{title}</span>
        <Button size="sm" variant="ghost" onClick={onCopy} className="h-7"><Copy className="h-3.5 w-3.5" /> 복사</Button>
      </div>
      <Textarea value={text} readOnly className="border-0 rounded-none min-h-24 resize-none bg-transparent" />
    </div>
  );
}

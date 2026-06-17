import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, ArrowRight, TrendingDown, AlertTriangle, MessageSquareText, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { daysSince, expectedRecovery, formatKRW, isAtRisk, maskPhone, riskLabel, riskOf } from "@/lib/customer-utils";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "대시보드 — 리봇 Rebot" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { customers, messages } = useStore();

  const stats = useMemo(() => {
    const atRisk = customers.filter(isAtRisk);
    const high = atRisk.filter((c) => riskOf(c) === "high");
    const recovery = atRisk.reduce((sum, c) => sum + expectedRecovery(c), 0);
    const thisMonth = new Date().getMonth();
    const monthMessages = messages.filter((m) => new Date(m.createdAt).getMonth() === thisMonth);
    return { atRiskCount: atRisk.length, highCount: high.length, monthMessages: monthMessages.length, recovery, preview: atRisk.slice(0, 5) };
  }, [customers, messages]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">오늘의 단골 현황</h1>
          <p className="text-sm text-muted-foreground mt-1">
            하루 3분, 떠나간 단골을 다시 부르는 가장 따뜻한 방법.
          </p>
        </div>
        <Button asChild>
          <Link to="/upload"><Upload className="h-4 w-4" /> 고객 데이터 업로드</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={TrendingDown} label="이탈 위험 고객" value={`${stats.atRiskCount}명`} tone="primary" hint="30일 이상 미방문" />
        <KpiCard icon={AlertTriangle} label="고위험 고객" value={`${stats.highCount}명`} tone="warn" hint="40일 이상 미방문" />
        <KpiCard icon={MessageSquareText} label="이번 달 생성 메시지" value={`${stats.monthMessages}건`} hint="AI 안부 메시지" />
        <KpiCard icon={Coins} label="예상 회복 매출" value={formatKRW(stats.recovery)} hint="복귀 시 추정치" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">이탈 위험 고객 미리보기</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers">전체 보기 <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.preview.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                아직 이탈 위험 고객이 없어요. 데이터를 업로드해 확인해 보세요.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-y bg-muted/40">
                    <th className="px-4 py-2 font-medium">고객</th>
                    <th className="px-2 py-2 font-medium">연락처</th>
                    <th className="px-2 py-2 font-medium">미방문</th>
                    <th className="px-2 py-2 font-medium">선호 메뉴</th>
                    <th className="px-2 py-2 font-medium">위험도</th>
                    <th className="px-2 py-2 font-medium text-right pr-4">예상 회복</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.preview.map((c) => {
                    const r = riskOf(c);
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link to="/customers/$id" params={{ id: c.id }} className="font-medium hover:underline">
                            {c.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">방문 {c.visitCount}회</div>
                        </td>
                        <td className="px-2 py-3 text-muted-foreground tabular-nums">{maskPhone(c.phone)}</td>
                        <td className="px-2 py-3 tabular-nums">{daysSince(c.lastVisit)}일</td>
                        <td className="px-2 py-3 text-muted-foreground">{c.favoriteMenu}</td>
                        <td className="px-2 py-3"><RiskBadge risk={r} /></td>
                        <td className="px-2 py-3 text-right pr-4 tabular-nums">{formatKRW(expectedRecovery(c))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">AI 추천 액션</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Action title="40일 이상 미방문 단골부터" body={`고위험 고객 ${stats.highCount}명에게 안부 메시지를 먼저 보내보세요. 가장 회복률이 높아요.`} />
            <Action title="선호 메뉴를 이름처럼" body="고객별 선호 메뉴를 메시지에 한 줄만 넣어도 응답률이 크게 올라가요." />
            <Action title="평일 오전 10–11시" body="동네 카페 고객 데이터 기준으로 가장 잘 열리는 시간대예요." />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">최근 생성 메시지</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/outbox">발송 준비함 <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">아직 생성된 메시지가 없어요.</p>
            ) : (
              messages.slice(0, 4).map((m) => (
                <div key={m.id} className="text-sm border rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{m.customerName}</span>
                    <Badge variant="secondary" className="text-[10px]">{m.tone}</Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{m.greeting}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">업로드 가이드</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>1. POS나 엑셀에서 고객 명단을 CSV로 내보내세요.</p>
            <p>2. 고객명·연락처·마지막 방문일·구매 메뉴·방문 횟수·구매 금액 컬럼이 있어야 해요.</p>
            <p>3. 업로드 후 컬럼을 한 번만 매핑하면, 다음부터는 더 빠르게 분석돼요.</p>
            <Button asChild variant="outline" size="sm" className="mt-1">
              <Link to="/upload">샘플 파일로 시작하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint, tone }: { icon: typeof Upload; label: string; value: string; hint?: string; tone?: "primary" | "warn" }) {
  const accent =
    tone === "primary" ? "bg-primary/10 text-primary" :
    tone === "warn" ? "bg-warn/20 text-warn-foreground" :
    "bg-muted text-muted-foreground";
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${accent}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-bold mt-0.5 tabular-nums">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: "high" | "warn" | "low" }) {
  const cls = risk === "high"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : risk === "warn"
    ? "bg-warn/25 text-warn-foreground border-warn/40"
    : "bg-success/15 text-success border-success/30";
  return <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{riskLabel(risk)}</span>;
}

function Action({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-primary pl-3">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground text-xs mt-0.5">{body}</div>
    </div>
  );
}

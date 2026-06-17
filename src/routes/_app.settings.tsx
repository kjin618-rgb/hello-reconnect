import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "설정 — 리봇" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings } = useStore();
  const [form, setForm] = useState(settings);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground mt-1">매장 정보와 기본 메시지 옵션을 관리해요.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">매장 정보</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="매장명">
            <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </Field>
          <Field label="업종">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["카페", "베이커리 카페", "디저트샵", "베이커리", "브런치 카페"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="대표 메뉴">
            <Input value={form.signatureMenu} onChange={(e) => setForm({ ...form, signatureMenu: e.target.value })} placeholder="쉼표로 구분해 주세요" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">기본 메시지 옵션</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="기본 말투">
            <Select value={form.defaultTone} onValueChange={(v) => setForm({ ...form, defaultTone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["정중한", "다정한", "동네 사장님 말투", "짧고 담백한"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="기본 쿠폰 혜택">
            <Select value={form.defaultCoupon} onValueChange={(v) => setForm({ ...form, defaultCoupon: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["아메리카노 무료", "디저트 할인", "재방문 10% 할인"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="개인정보 안내 문구">
            <Textarea value={form.privacyNote} onChange={(e) => setForm({ ...form, privacyNote: e.target.value })} rows={3} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => { setSettings(form); toast.success("설정을 저장했어요."); }}>변경사항 저장</Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        실제 서비스 출시 시에는 개인정보 처리방침과 수집·이용 동의 절차가 필요합니다. MVP 단계에서는 안내 문구만 표시돼요.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

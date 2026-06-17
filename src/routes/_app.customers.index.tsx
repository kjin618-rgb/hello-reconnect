import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { daysSince, expectedRecovery, formatDate, formatKRW, isAtRisk, maskPhone, riskLabel, riskOf, type Risk } from "@/lib/customer-utils";
import { Search, MessageSquarePlus } from "lucide-react";

export const Route = createFileRoute("/_app/customers/")({
  head: () => ({ meta: [{ title: "이탈 위험 고객 — 리봇" }] }),
  component: CustomersPage,
});

const filters: { key: "all" | Risk; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "high", label: "높음" },
  { key: "warn", label: "주의" },
  { key: "low", label: "낮음" },
];

function CustomersPage() {
  const { customers } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Risk>("all");

  const list = useMemo(() => {
    return customers
      .filter(isAtRisk)
      .filter((c) => filter === "all" || riskOf(c) === filter)
      .filter((c) => c.name.includes(q) || c.favoriteMenu.includes(q))
      .sort((a, b) => daysSince(b.lastVisit) - daysSince(a.lastVisit));
  }, [customers, q, filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">이탈 위험 고객</h1>
          <p className="text-sm text-muted-foreground mt-1">30일 이상 방문하지 않은 단골을 정리했어요.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="고객명 또는 메뉴 검색" className="pl-8 h-9 w-64" />
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              filter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">조건에 맞는 고객이 없어요.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b bg-muted/40">
                  <th className="px-4 py-2.5 font-medium">고객</th>
                  <th className="px-2 py-2.5 font-medium">연락처</th>
                  <th className="px-2 py-2.5 font-medium">마지막 방문</th>
                  <th className="px-2 py-2.5 font-medium">미방문</th>
                  <th className="px-2 py-2.5 font-medium">선호 메뉴</th>
                  <th className="px-2 py-2.5 font-medium">방문</th>
                  <th className="px-2 py-2.5 font-medium">위험도</th>
                  <th className="px-2 py-2.5 font-medium text-right">예상 회복</th>
                  <th className="px-2 py-2.5 font-medium text-right pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const r = riskOf(c);
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link to="/customers/$id" params={{ id: c.id }} className="font-medium hover:underline">{c.name}</Link>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground tabular-nums">{maskPhone(c.phone)}</td>
                      <td className="px-2 py-3 text-muted-foreground tabular-nums">{formatDate(c.lastVisit)}</td>
                      <td className="px-2 py-3 tabular-nums">{daysSince(c.lastVisit)}일</td>
                      <td className="px-2 py-3 text-muted-foreground">{c.favoriteMenu}</td>
                      <td className="px-2 py-3 tabular-nums">{c.visitCount}회</td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                          r === "high" ? "bg-destructive/15 text-destructive border-destructive/30"
                          : r === "warn" ? "bg-warn/25 text-warn-foreground border-warn/40"
                          : "bg-success/15 text-success border-success/30"
                        }`}>{riskLabel(r)}</span>
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums">{formatKRW(expectedRecovery(c))}</td>
                      <td className="px-2 py-3 text-right pr-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/customers/$id" params={{ id: c.id }}>
                            <MessageSquarePlus className="h-3.5 w-3.5" /> 메시지
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

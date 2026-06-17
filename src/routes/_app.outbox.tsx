import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Inbox } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/outbox")({
  head: () => ({ meta: [{ title: "메시지 준비함 — 리봇" }] }),
  component: OutboxPage,
});

const statusLabel = { created: "생성됨", copied: "복사됨", sent: "발송 완료" } as const;
const statusColor = {
  created: "bg-muted text-muted-foreground",
  copied: "bg-warn/25 text-warn-foreground",
  sent: "bg-success/15 text-success",
} as const;

function OutboxPage() {
  const { messages, updateMessage } = useStore();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">메시지 준비함</h1>
        <p className="text-sm text-muted-foreground mt-1">생성된 메시지를 복사해 직접 발송하신 후 체크해 주세요.</p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">아직 저장된 메시지가 없어요.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/customers">이탈 고객 보러가기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.customerName}</span>
                    <Badge variant="secondary" className="text-[10px]">{m.tone}</Badge>
                    <Badge variant="outline" className="text-[10px]">{m.coupon}</Badge>
                    <span className={`text-[10px] rounded-md px-1.5 py-0.5 font-medium ${statusColor[m.status]}`}>
                      {statusLabel[m.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm" variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(m.greeting);
                        updateMessage(m.id, { status: "copied" });
                        toast.success("메시지를 복사했어요.");
                      }}
                    ><Copy className="h-3.5 w-3.5" /> 복사</Button>
                    <Button
                      size="sm"
                      variant={m.status === "sent" ? "secondary" : "default"}
                      onClick={() => updateMessage(m.id, { status: m.status === "sent" ? "copied" : "sent" })}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {m.status === "sent" ? "발송 취소" : "발송 완료"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap border-l-2 border-primary/40 pl-3 text-foreground/90">
                  {m.greeting}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Upload, Users, Inbox, Settings, Coffee } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/customer-utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const navItems: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "대시보드", icon: LayoutDashboard, exact: true },
  { to: "/upload", label: "고객 업로드", icon: Upload },
  { to: "/customers", label: "이탈 고객", icon: Users },
  { to: "/outbox", label: "메시지 준비함", icon: Inbox },
  { to: "/settings", label: "설정", icon: Settings },
];

function AppLayout() {
  const { settings, lastUpload } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Coffee className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">리봇</div>
            <div className="text-[11px] text-muted-foreground">단골 관리 도구</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 text-[11px] text-muted-foreground border-t border-sidebar-border">
          현재 브라우저에서만 사용되는 샘플 MVP입니다. 실제 서비스에서는 개인정보 처리방침이 필요합니다.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card/60 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-base font-bold">{settings.storeName}</span>
            <span className="text-xs text-muted-foreground">{settings.category}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            최근 분석일: {lastUpload ? formatDate(lastUpload) : "아직 업로드 없음"}
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

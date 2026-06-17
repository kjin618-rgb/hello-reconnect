import type { Customer } from "./sample-data";

export function daysSince(iso: string): number {
  const last = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

export type Risk = "high" | "warn" | "low";

export function riskOf(c: Customer): Risk {
  const d = daysSince(c.lastVisit);
  if (d >= 40) return "high";
  if (d >= 30) return "warn";
  return "low";
}

export function isAtRisk(c: Customer): boolean {
  return daysSince(c.lastVisit) >= 30;
}

export function expectedRecovery(c: Customer): number {
  // 평균 객단가 * 0.4 (복귀 확률 기반 단순 추정)
  const avg = c.visitCount > 0 ? c.totalSpend / c.visitCount : 0;
  return Math.round(avg * 0.4);
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  const parts = cleaned.split("-");
  if (parts.length === 3) return `${parts[0]}-****-${parts[2]}`;
  if (cleaned.length >= 8) return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`;
  return phone;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatKRW(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

export const riskLabel = (r: Risk) =>
  r === "high" ? "높음" : r === "warn" ? "주의" : "낮음";

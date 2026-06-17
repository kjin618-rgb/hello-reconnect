import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileDown, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { sampleCsv, type Customer } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({ meta: [{ title: "고객 데이터 업로드 — 리봇" }] }),
  component: UploadPage,
});

const REQUIRED = [
  { key: "name", label: "고객명", hints: ["고객명", "이름", "name"] },
  { key: "phone", label: "연락처", hints: ["연락처", "전화", "phone", "tel"] },
  { key: "lastVisit", label: "마지막 방문일", hints: ["방문일", "마지막", "last", "visit"] },
  { key: "favoriteMenu", label: "최근 구매 메뉴", hints: ["메뉴", "구매", "menu"] },
  { key: "visitCount", label: "총 방문 횟수", hints: ["방문 횟수", "횟수", "count"] },
  { key: "totalSpend", label: "총 구매 금액", hints: ["금액", "매출", "spend", "amount"] },
] as const;

type RowObj = Record<string, string>;

function autoGuess(headers: string[], hints: readonly string[]): string {
  for (const h of headers) {
    const lo = h.toLowerCase();
    if (hints.some((hint) => lo.includes(hint.toLowerCase()))) return h;
  }
  return "";
}

function UploadPage() {
  const navigate = useNavigate();
  const { setCustomers, markUploaded } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RowObj[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");

  const handleFile = (file: File) => {
    Papa.parse<RowObj>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const h = res.meta.fields ?? [];
        setHeaders(h);
        setRows(res.data);
        setFileName(file.name);
        const guess: Record<string, string> = {};
        for (const r of REQUIRED) guess[r.key] = autoGuess(h, r.hints);
        setMapping(guess);
      },
      error: () => toast.error("파일을 읽지 못했어요. CSV 형식을 확인해 주세요."),
    });
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rebot-샘플데이터.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const useSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    handleFile(new File([blob], "rebot-샘플데이터.csv", { type: "text/csv" }));
  };

  const confirmImport = () => {
    if (REQUIRED.some((r) => !mapping[r.key])) {
      toast.error("모든 필수 컬럼을 매핑해 주세요.");
      return;
    }
    try {
      const parsed: Customer[] = rows.map((row, i) => ({
        id: `u${Date.now()}-${i}`,
        name: row[mapping.name] ?? "",
        phone: row[mapping.phone] ?? "",
        lastVisit: new Date(row[mapping.lastVisit] ?? Date.now()).toISOString(),
        favoriteMenu: row[mapping.favoriteMenu] ?? "",
        visitCount: Number(row[mapping.visitCount] ?? 0) || 0,
        totalSpend: Number(String(row[mapping.totalSpend] ?? 0).replace(/[^0-9.-]/g, "")) || 0,
      })).filter((c) => c.name);
      if (parsed.length === 0) {
        toast.error("불러올 고객 데이터가 없어요.");
        return;
      }
      setCustomers(parsed);
      markUploaded();
      toast.success(`${parsed.length}명의 고객 데이터를 분석했어요.`);
      navigate({ to: "/customers" });
    } catch {
      toast.error("데이터 변환 중 오류가 발생했어요.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">고객 데이터 업로드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          POS나 엑셀에서 내보낸 CSV 파일을 올려 주세요. 처음이라면 샘플 데이터로 먼저 둘러보셔도 좋아요.
        </p>
      </div>

      {headers.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed rounded-lg py-12 px-6 text-center hover:bg-muted/40 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium">CSV 파일을 끌어다 놓거나 선택하세요</p>
              <p className="text-xs text-muted-foreground mt-1">엑셀(.xlsx)은 CSV로 저장 후 업로드해 주세요.</p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button onClick={() => fileInput.current?.click()}>
                  <FileSpreadsheet className="h-4 w-4" /> 파일 선택
                </Button>
                <Button variant="outline" onClick={useSample}>샘플 데이터로 체험</Button>
                <Button variant="ghost" onClick={downloadSample}>
                  <FileDown className="h-4 w-4" /> 샘플 다운로드
                </Button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              업로드된 데이터는 현재 브라우저 안에서만 처리됩니다. 외부 서버로 전송되지 않아요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">컬럼 매핑</CardTitle>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{fileName}</span> · {rows.length}행 인식됨
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REQUIRED.map((r) => (
                <div key={r.key} className="space-y-1.5">
                  <Label className="text-xs">{r.label} <span className="text-destructive">*</span></Label>
                  <Select value={mapping[r.key] || undefined} onValueChange={(v) => setMapping((m) => ({ ...m, [r.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder="컬럼 선택" /></SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/40 border-b">미리보기 (상위 3행)</div>
              <table className="w-full text-xs">
                <thead><tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left font-medium border-b">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {headers.map((h) => <td key={h} className="px-3 py-2 text-muted-foreground">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={() => { setHeaders([]); setRows([]); setFileName(""); }}>다시 선택</Button>
              <Button onClick={confirmImport}><CheckCircle2 className="h-4 w-4" /> 분석 시작</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

# 리봇 Rebot MVP

단골 고객 이탈을 감지하고, AI 안부 메시지로 재방문을 유도하는 소상공인용 고객 관리 도구입니다.

## 주요 기능

- **대시보드** — 이탈 위험 고객 수, 고위험 고객 수, 이번 달 메시지 수, 예상 회복 매출 KPI
- **고객 데이터 업로드** — CSV 및 엑셀(.xlsx, .xls) 파일 업로드, 컬럼 매핑, 샘플 데이터 체험
- **고객 목록** — 이탈 위험도(고위험·주의·안전) 기반 필터 및 개별 고객 상세 조회
- **AI 메시지 생성** — 고객 정보 기반 개인화 안부 메시지 자동 생성
- **발신함** — 생성된 메시지 관리 및 발송 준비

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | TanStack Start (SSR) + React 19 |
| 라우터 | TanStack Router (파일 기반) |
| 빌드 | Vite 8 + Nitro |
| 패키지 매니저 | Bun |
| UI | shadcn/ui + Tailwind CSS v4 |
| 상태 관리 | Zustand (useStore) |
| 파일 파싱 | PapaParse (CSV), SheetJS xlsx (엑셀) |
| 배포 | Vercel (GitHub 연동) |

## 화면 구성

```
/           대시보드 — KPI 및 이탈 위험 고객 미리보기
/upload     고객 데이터 업로드 — CSV/엑셀 업로드 및 컬럼 매핑
/customers  고객 목록
/customers/:id  고객 상세
/outbox     발신함
/settings   설정
```

## 로컬 개발

```bash
bun install
bun run dev
```

## 배포 (Vercel)

GitHub 저장소와 Vercel을 연동 후 아래 환경변수를 설정합니다.

| 변수 | 값 | 설명 |
|------|----|------|
| `NITRO_PRESET` | `vercel` | Nitro를 Vercel 서버리스 포맷으로 빌드 |

- **Framework Preset**: Other
- **Build Command**: `bun run build`
- `vercel.json`의 `buildCommand`로 자동 설정됨

## 주요 작업 이력

### 엑셀 파일 업로드 지원
- `xlsx` 패키지 추가로 `.xlsx`/`.xls` 직접 업로드 지원
- `applyParsedData()` 공통 함수로 CSV·엑셀 파싱 후 상태 설정 로직 통합
- 파일 선택 `accept` 확장: `.csv,text/csv,.xlsx,.xls`
- 업로드 안내 문구에서 "엑셀은 CSV로 저장 후 업로드" 제한 문구 제거
- 개인정보가 toast·console·에러 메시지에 노출되지 않도록 처리

### 분석 완료 후 대시보드 이동
- 분석 시작 후 `/customers` 대신 `/`(대시보드)로 이동
- 업로드된 고객 데이터 기준 KPI·이탈 위험 고객 미리보기 즉시 확인 가능

### Vercel 배포 설정
- `vercel.json` 추가: 빌드 명령어 명시
- `vite.config.ts`에 `nitro: true` 추가: Lovable 컨텍스트 밖에서도 nitro 플러그인 강제 활성화
- `NITRO_PRESET=vercel` 환경변수로 `.vercel/output/` 포맷 빌드

## 개인정보 처리

업로드된 고객 데이터는 **브라우저 내에서만 처리**되며 외부 서버로 전송되지 않습니다.

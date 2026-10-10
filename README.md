# 📚 스마트 도서관 좌석 예약 시스템 (Library Seat Booking)

> **Google Apps Script(GAS) & Google Sheets 실시간 3중 시트 연동 반응형 도서관 좌석 예약 웹 애플리케이션**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🚀 Vercel 배포 가이드 (빠른 1분 배포)

이 프로젝트는 Vite + React 기반으로 제작되어 GitHub에 푸시한 후 Vercel에 연결하면 바로 자동 빌드 및 배포됩니다.

### 1단계: GitHub에 저장소 푸시
```bash
git init
git add .
git commit -m "feat: 도서관 좌석 예약 시스템 초기 커밋"
git branch -M main
git remote add origin https://github.com/사용자이름/저장소이름.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. **"Add New..."** → **"Project"** 클릭 후 해당 GitHub 저장소를 선택(**Import**)합니다.
3. **Build & Development Settings** 확인:
   - **Framework Preset**: `Vite` (자동 감지)
   - **Build Command**: `npm run build` (또는 `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. (선택 사항) **Environment Variables** 설정:
   - `VITE_GAS_API_URL`: 사용자의 Google Apps Script 웹앱 배포 URL (미입력 시 기본 엔드포인트 자동 적용)
5. **"Deploy"** 버튼 클릭 시 약 1분 이내에 배포가 완료되며 고유 도메인이 생성됩니다!

---

## 📊 구글 스프레드시트 3중 시트 구조

스프레드시트에 다음 3개의 시트가 생성되어 있어야 합니다.

### 1. `시트1` (좌석 관리)
| A열 (seat_id) | B열 (room_name) | C열 (seat_number) | D열 (status) |
| :--- | :--- | :--- | :--- |
| S001 | 제1열람실 | 1 | 사용가능 |
| S002 | 제1열람실 | 2 | 사용가능 |
| S003 | 제2열람실 (노트북존) | 1 | 사용가능 |

* 예약 발생 시 D열이 **`사용중`**으로 자동 변경되며, 예약 취소/반납 시 **`사용가능`**으로 즉시 복원됩니다.

### 2. `시트2` (예약 현황)
| A열 (id) | B열 (user_name) | C열 (user_phone) | D열 (seat_id) | E열 (start_time) | F열 (end_time) | G열 (status) | H열 (created_at) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| RES-001 | 홍길동 | 010-1234-5678 | S001 | 09:00 | 13:00 | active | 2026-10-10 09:00:00 |

### 3. `시트3` (이용 이력 및 반납 로그)
| A열 (log_id) | B열 (reservation_id) | C열 (user_name) | D열 (user_phone) | E열 (seat_id) | F열 (action_type) | G열 (timestamp) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| LOG-001 | RES-001 | 홍길동 | 010-1234-5678 | S001 | 좌석예약 | 2026-10-10 09:00:00 |
| LOG-002 | RES-001 | 홍길동 | 010-1234-5678 | S001 | 좌석반납(취소) | 2026-10-10 12:30:00 |

---

## 🛠️ Google Apps Script (`Code.gs`) 설정 방법

1. 스프레드시트 메뉴에서 **확장 프로그램** > **Apps Script**를 클릭합니다.
2. 에디터에 프로젝트 내 `GAS 백엔드 코드` 모달에 안내된 `Code.gs` 내용을 붙여넣고 저장합니다.
3. 우측 상단 **배포** > **새 배포** 클릭:
   - **유형**: 웹 앱 (Web App)
   - **설명**: `v1`
   - **다음 사용자 권한으로 실행**: `나(Me)`
   - **액세스 권한이 있는 사용자**: **`모든 사용자(Anyone)`** 👈 **필수!**
4. 발급된 웹 앱 URL(`/exec`)을 웹앱의 설정창 또는 Vercel 환경 변수 `VITE_GAS_API_URL`에 등록합니다.

---

## 💻 로컬 개발 환경 실행

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 시작 (http://localhost:3000)
npm run dev

# 3. 배포 빌드 검증
npm run build
```

---

## 📁 주요 프로젝트 구조

```
├── public/
│   └── standalone.html        # 단독 실행 가능한 단일 HTML 파일
├── src/
│   ├── components/            # UI 컴포넌트 모음
│   │   ├── Header.tsx         # 상단 네비게이션 헤더
│   │   ├── SeatMap.tsx        # 좌석 배치도 및 통계 현황
│   │   ├── ReservationModal.tsx # 좌석 예약 신청 모달
│   │   ├── TicketModal.tsx    # 모바일 승차권/티켓 발급 모달
│   │   ├── MyReservations.tsx # 내 예약 확인 및 반납/취소
│   │   ├── ApiSettingsModal.tsx # GAS API URL 설정 모달
│   │   └── GasScriptModal.tsx # Code.gs 소스코드 안내 모달
│   ├── services/
│   │   └── api.ts             # Google Apps Script Fetch 통신 및 로컬 캐시 레이어
│   ├── types.ts               # 데이터 타입 인터페이스
│   ├── App.tsx                # 메인 애플리케이션
│   ├── main.tsx               # 진입점
│   └── index.css              # Tailwind CSS 스타일
├── vercel.json                # Vercel 배포 및 라우팅 설정 파일
├── package.json
├── vite.config.ts
└── README.md
```

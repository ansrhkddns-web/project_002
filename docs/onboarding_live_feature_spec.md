# Time-Based Emotional Onboarding & Live Core Feature Spec

## 0. 문서 정보
- **문서 ID**: SPEC_LIVE_ONBOARDING_APP_001
- **버전**: v1.0
- **기준 언어**: KR (EN 병기)
- **대상**: 기획, 디자인(Stitch UI), 클라이언트 개발, QA
- **목적**: 온보딩/핵심 기능/운영 기능을 동일 기준으로 구현 가능한 수준으로 정리

---

## 1. 제품 목표 및 범위
### 1.1 핵심 목표
1. 앱 첫 실행 시 감성 중심 온보딩으로 제품 맥락을 전달한다.
2. 온보딩 완료 후 사용자를 자연스럽게 카메라 플로우로 연결한다.
3. 하루 1장 기록 + 어제 실루엣 + 타임라인 + 영상 생성의 코어 루프를 안정적으로 제공한다.
4. Live 기준으로 Google Login(복원 목적)과 2종 광고(Interstitial/Rewarded)를 운영 가능 상태로 제공한다.

### 1.2 구현 범위 (Release Scope)
- 온보딩 4페이지 고정 플로우
- 앱 진입 분기(온보딩 완료 여부)
- 권한/오류/로딩 공통 상태
- 앨범/하루기록/카메라/타임라인/영상생성/리마인드/설정
- Google 로그인 게이트(게스트 허용)
- 광고 2종 + 쿨다운/예외 처리
- 분석 이벤트 최소셋 + QA 시나리오

### 1.3 비범위 (Out of Scope, v1)
- 서버 기반 협업 기능
- 복잡한 소셜 기능(댓글/좋아요/공유 피드)
- 고급 편집(필터/프리셋 보정)

---

## 2. 온보딩 기능 명세 (ONBOARDING_FLOW_001)
### 2.1 기본 사양
- 페이지 수: 4 (고정)
- 이동: 좌우 스와이프
- 인디케이터: 하단 dot
- CTA: 1, 4페이지만 노출
- 언어: KR 기본 + EN 병기
- 종료 액션: 완료 플래그 저장 후 카메라 최초 진입 화면 이동

### 2.2 공통 UI 요소
- 페이지별 배경 이미지
- 타이틀 KR/EN
- 본문 KR/EN
- dot indicator
- CTA(조건부)

### 2.3 공통 상태
- `STATE_READY`: 정상 렌더
- `STATE_LOADING`: 이미지/카피 로딩 중
- `STATE_ERROR`: 로딩 실패 시 fallback 카피/배경색 처리

### 2.4 페이지 상세
#### PAGE 1 — `ONB_PAGE_001`
- 목적: 앱 세계관/기록 방식 소개
- CTA: 노출
- CTA 동작: `ONB_PAGE_002` 이동

**Copy Resource**
```json
{
  "title_kr": "하루를 남기는 방식",
  "title_en": "A way to mark a day",
  "body_kr": [
    "하루는 지나가지만",
    "그날의 모습은 남길 수 있습니다",
    "",
    "이 앱은",
    "순간을 모으기보다",
    "시간을 이어갑니다"
  ],
  "body_en": [
    "Days pass",
    "But how you were that day",
    "can stay"
  ],
  "cta_kr": "여정 시작하기 →",
  "cta_en": "Start Journey →"
}
```

#### PAGE 2 — `ONB_PAGE_002`
- 목적: 어제와 오늘의 연결감 전달
- CTA: 없음
- 동작: 스와이프만 허용

**Copy Resource**
```json
{
  "title_kr": "어제에서 오늘로",
  "title_en": "From yesterday to today",
  "body_kr": [
    "어제의 당신이",
    "오늘의 당신을 부릅니다",
    "",
    "조금 더 가까이",
    "조금 더 비슷하게",
    "",
    "하루는 그렇게",
    "서로를 닮아갑니다"
  ],
  "body_en": [
    "Yesterday calls to today",
    "Not exactly the same",
    "Just close enough to feel time"
  ]
}
```

#### PAGE 3 — `ONB_PAGE_003`
- 목적: 기록 대상이 아이의 다양한 일상임을 전달
- CTA: 없음
- 동작: 스와이프만 허용

**Copy Resource**
```json
{
  "title_kr": "매일 다른 자리에서",
  "title_en": "In different places, every day",
  "body_kr": [
    "집에서도",
    "친구 곁에서도",
    "땀을 흘린 뒤에도",
    "",
    "아이는",
    "각자의 하루 속에서",
    "조금씩 자랍니다"
  ],
  "body_en": [
    "At home",
    "With friends",
    "After moving, playing, growing",
    "",
    "Life changes",
    "And so do they"
  ]
}
```

#### PAGE 4 — `ONB_PAGE_004`
- 목적: 지속 사용 보상(변화의 누적) 제시
- CTA: 노출
- CTA 동작: 온보딩 완료 처리 + 카메라 진입

**Copy Resource**
```json
{
  "title_kr": "나중에 알게 되는 것들",
  "title_en": "What you’ll see later",
  "body_kr": [
    "하루하루는",
    "크게 달라 보이지 않지만",
    "",
    "시간이 지나",
    "다시 보면",
    "분명한 변화가 있습니다"
  ],
  "body_en": [
    "Not much changes in a day",
    "But everything changes",
    "when days come together"
  ],
  "cta_kr": "여정 시작하기 →",
  "cta_en": "Start Journey →"
}
```

### 2.5 저장/분기
- Key: `onboardingCompleted`
- Value: `true | false`
- 저장소: Local Storage(오프라인 우선), 계정 연동 시 서버 프로필 동기화 가능
- 규칙:
  - false/미존재 → 온보딩 진입
  - true → 홈/카메라 진입

---

## 3. 앱 전반 아키텍처 명세
### 3.1 전역 상태
- `AUTH_STATE = guest | googleLinked | signedOut`
- `PAY_STATE = none | subscribed | expired | grace`
- `NETWORK_STATE = online | offline`
- `SYNC_STATE = idle | syncing | failed`
- `APP_BOOT_STATE = loading | ready | error`

### 3.2 앱 진입 라우팅
1. 앱 시작 → 초기화(스토리지/권한/구독/네트워크)
2. `onboardingCompleted` 확인
3. 분기:
   - false → 온보딩
   - true → 홈(기본 탭) 또는 카메라 직진입 정책 적용
4. 복원/동기화 중이면 별도 로딩 상태 표시

### 3.3 공통 UI 상태
- 전역 로딩 오버레이
- 토스트/스낵바
- 공통 에러 모달(재시도/설정 이동)

### 3.4 네비게이션/백스택 정책
- 온보딩 진행 중 OS back 입력 시 이전 페이지로 이동
- 온보딩 1페이지에서 back 입력 시 앱 종료(플랫폼 기본 정책 준수)
- 온보딩 완료 후 카메라 진입 시 back 입력은 홈 허브(또는 마지막 탭)로 복귀
- 딥링크 진입 시 공통 규칙:
  - `onboardingCompleted=false`면 온보딩 우선
  - 완료 이후 딥링크 타겟 화면으로 리다이렉트

---

## 4. 도메인별 기능 명세
## 4.1 권한 & 프라이버시
- 필수: 카메라, 사진 저장/접근
- 선택: 알림
- 거부 UX:
  - 기능 제한 이유 명시
  - 설정 이동 CTA
  - 무한 재요청 금지 (세션당 재요청 횟수 제한)
- 정책 UI:
  - 약관/개인정보 링크
  - 데이터 삭제 요청 메뉴

## 4.2 앨범 시스템
### 모델
- `albumId`, `title`, `startDate`, `createdAt`
- `streakCount`, `totalDays`, `missedDays`(계산)
- `coverImage`, `goalPreset`
- `status = active | archived | deleted`

### 기능
- 생성/선택/삭제(또는 아카이브)
- 최초 진입 기본 앨범 자동 생성 옵션
- 마지막 선택 앨범 유지
- 앨범 전환 시 카메라/타임라인 컨텍스트 즉시 갱신

## 4.3 하루 기록(Daily Entry)
### 규칙
- 하루 1장
- 오늘 재촬영 = 덮어쓰기(경고 모달 옵션)
- 과거 날짜 촬영 불가

### 날짜 정책
- 저장 키: `YYYY-MM-DD` (로컬 타임존 기준)
- 기본 타임존: Asia/Seoul
- 자정 경계 대응: 앱 활성 상태에서도 날짜 변경 감지 후 상태 재평가

### 저장소
- 로컬 DB(SQLite/Realm/기타)
- 사진 파일 경로 + 메타 분리 저장
- 월 단위 조회 성능 고려(인덱싱)

### Daily Entry 최소 스키마
- `entryId`
- `albumId`
- `dateKey` (`YYYY-MM-DD`)
- `imageUri`
- `createdAt`
- `updatedAt`
- `timezone` (예: `Asia/Seoul`)
- Unique 제약: `(albumId, dateKey)`

## 4.4 카메라
- 프리뷰 + 촬영 + 리뷰 + 저장
- 전/후면 전환
- 에러 처리:
  - 권한 없음
  - 초기화 실패
  - 저장 실패(I/O, 권한, 용량)

### 어제 사진 실루엣
- 어제 사진 자동 로드
- ON/OFF 토글
- 투명도 슬라이더 즉시 반영
- Day1 폴백(어제 사진 없음 안내)

## 4.5 타임라인/갤러리
- 월 단위 캘린더(권장) 또는 리스트
- 상태 표시: 촬영됨/빈날/오늘
- Day Detail: 확대 보기 + 이전/다음
- 빈날 선택 시: 빈 상태 카드 + 오늘 촬영 CTA

## 4.6 영상 생성(타임랩스)
- 기간: 7/30/100/365/전체
- 파이프라인: 이미지 시퀀스 → 렌더 → 결과 미리보기
- 상태: 진행률 표시, 실패 처리, (옵션) 취소
- 결과: 저장(갤러리), 공유(후순위 가능)
- 실패 케이스: 사진 부족, 렌더 실패, 저장 실패

## 4.7 리마인드
- 알림 시간 설정
- 당일 미촬영 시 발송
- 인앱 배너: 미촬영이면 상단 노출, 탭 시 카메라 이동

## 4.8 설정/유틸
- 언어(KR/EN)
- 실루엣 기본 투명도
- 리마인드 시간
- 데이터 관리(내보내기/삭제)

---

## 4.9 수용 기준(Definition of Done)
### 온보딩
- 4페이지 모두 KR/EN 카피 렌더 및 dot 인디케이터 정상 동작
- CTA는 1,4페이지에서만 노출
- 4페이지 CTA 후 `onboardingCompleted=true` 저장 확인

### 촬영/저장
- 권한 허용 상태에서 촬영→리뷰→저장까지 3초 이내 완료(권장 기준)
- 같은 날짜 재촬영 시 덮어쓰기 경고(옵션) 이후 1건만 유지
- Day1에 실루엣 비노출 및 대체 UI 노출

### 광고/게이팅
- 금지 구간에서 광고 호출 0건
- rewarded 성공 콜백 없이는 게이트 기능 실행 불가
- 광고 실패 폴백이 앱 크래시 없이 동작

### 복원/계정
- 게스트 상태에서도 핵심 촬영 기능 사용 가능
- 로그인 연결 후 복원 트리거 시 계정 상태 `googleLinked` 반영

---

## 5. Google Login & Ads Monetization (Live)
## 5.1 Google Login
### 목적
- 게스트 사용 허용
- 결제/구독 복원, 기기 변경 복원 시 계정 연결 유도

### 로그인 유도 트리거
- 구독 시도
- restore 요청
- 클라우드 백업/복원 진입

### 계정 연동 정책
- `onboardingCompleted`는 로컬 저장을 기준으로 즉시 반영
- 로그인 사용자는 서버 프로필과 동기화 가능(충돌 시 최신 수정 시간 우선)
- 로그아웃 시 로컬 데이터 유지 여부를 설정에서 명시하고 사용자에게 사전 고지

### Stitch 화면
- `SCN_AUTH_GATE_001`
  - 카피: “계정 연결하면 기기 변경 시에도 복원됩니다” KR/EN
  - 버튼: `Google로 계속`, `나중에`

## 5.2 Ads 타입
- `AD_INTERSTITIAL`: 닫기 가능한 전면 광고
- `AD_REWARDED`: 완료 콜백 기반 보상 광고

### 공통 정책
- `AD_COOLDOWN_SECONDS` 적용 (권장 60~180초)
- 세션 내 연속 노출 상한
- 촬영 집중구간 광고 금지

## 5.3 광고 트리거
### Interstitial (권장)
- 타임라인 → 앨범 리스트
- 앨범 리스트 → 앨범 상세
- 설정 진입(저빈도)

### 금지 구간
- 카메라 진입 순간
- 촬영 직후
- 저장 확정 전후

### Rewarded (게이팅)
- 영상 생성 실행
- 고해상도 저장(무료)
- 장기 기간 영상 해금(30/100/365)
- 다중 앨범 생성(무료)
- 클라우드 백업 1회 실행(무료)

## 5.4 리워드 게이트 상태머신
- `GATE_STATE = idle | adLoading | adShowing | rewarded | failed | canceled`
- 규칙:
  - `rewarded` 수신 시 기능 실행
  - `failed/canceled` 시 실행 불가 + 안내 + 재시도 옵션

### RewardPass 권장 정책
- 리워드 완료 시 `rewardPass +1`
- 특정 기능 실행 시 pass 소비하여 광고 생략

## 5.5 광고 예외/폴백
- 미노출: premium, 네트워크 불가, 온보딩 직후 첫 촬영, 집중 구간
- 실패 처리:
  - interstitial 실패: 이동 그대로 진행
  - rewarded 실패: 기능 차단(정책상 1일 1회 무료 예외 가능)

### 광고 빈도 상한(권장 기본값)
- Interstitial: 세션당 최대 3회
- Rewarded 게이트 모달: 기능당 1회 시도 후 사용자 재요청 시에만 재노출
- 온보딩 완료 후 첫 촬영 세션에서는 모든 광고 비활성

---

## 6. 분석 이벤트 최소셋
- 온보딩: 시작/페이지도달/완료/이탈
- 촬영: 시도/성공/실패사유
- 실루엣: 사용 여부/투명도 변경
- 영상: 생성 시작/완료/실패
- 광고: 요청/노출/클릭/완료/실패
- 로그인 게이트: 노출/연결성공/취소
- 리텐션: D1/D3/D7/D30

---

## 7. QA 시나리오 (필수)
1. 온보딩 4페이지 스와이프/CTA 노출 조건
2. `onboardingCompleted` true/false 분기
3. 권한 거부 후 설정 이동 복귀
4. 자정 경계(앱 활성 상태) 날짜 전환
5. Day1(어제 사진 없음) 실루엣 폴백
6. 오늘 재촬영 덮어쓰기 정책
7. 저장공간 부족 저장 실패
8. 광고 쿨다운/금지 구간 동작
9. rewarded 실패/취소 시 기능 차단
10. 게스트→Google 연결 후 복원 플로우
11. 딥링크 진입 시 온보딩 선행 분기
12. 세션 내 광고 상한 도달 후 미노출 처리
13. `(albumId, dateKey)` 중복 저장 방지 검증

---

## 8. 구현 우선순위 (권장)
### P0 (MVP)
- 온보딩 4페이지
- 앱 진입 분기
- 카메라 촬영/저장
- 하루 1장 정책
- 타임라인 기본 보기

### P1
- 실루엣 오버레이 + 투명도
- 리마인드
- 영상 생성(기본 길이)
- 설정(언어/투명도)

### P2 (Live 운영)
- Google Login 게이트
- 광고 2종 + 정책
- 구독/복원
- 분석 이벤트 확장

---

## 9. Stitch UI 제작용 화면 목록
- `SCN_ONBOARDING_001~004`
- `SCN_CAMERA_HOME_001`
- `SCN_CAMERA_REVIEW_001`
- `SCN_TIMELINE_MONTH_001`
- `SCN_DAY_DETAIL_001`
- `SCN_TIMELAPSE_CREATE_001`
- `SCN_TIMELAPSE_RESULT_001`
- `SCN_SETTINGS_001`
- `SCN_PERMISSION_GATE_001`
- `SCN_AUTH_GATE_001`
- `SCN_AD_REWARD_GATE_001`
- `SCN_COMMON_ERROR_001`

---

## 10. 오픈 이슈 (결정 필요)
1. 온보딩 완료 후 첫 진입 화면을 `카메라 직진입`으로 고정할지, `홈 허브`를 둘지 최종 결정 필요
2. rewarded 실패 시 완전 차단 vs 일일 무료 1회 예외 정책 확정 필요
3. 로그아웃 시 로컬 미디어 유지/삭제 기본값 정책 확정 필요
4. 광고 X 버튼 노출 타이밍(즉시/지연) 플랫폼 정책 범위 내 확정 필요

# TimeFlow UI Prototype

온보딩/홈/카메라/타임라인/앨범/설정을 포함한 프론트엔드 프로토타입입니다.

이 저장소는 이제 **Android WebView 앱 빌드가 가능한 구조**를 포함합니다.
- 웹 소스: 루트 (`index.html`, `app.js`, `styles.css` ...)
- Android 프로젝트: `android/`
- Android 에셋 동기화 스크립트: `scripts/android-sync-assets.sh`

## 로컬 실행 (웹)
### 1) 일반 UI 확인(정적)
```bash
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173
```

### 2) 서명 검증 + 접근 제어 포함 실행(권장)
```bash
node server.js
# 브라우저에서 http://localhost:4173
# /api/sdk-keys 호출 시 Authorization: Bearer loopic-ops-dev-token 필요
```

브라우저 콘솔에서 토큰 주입(프로토타입용):
```js
localStorage.setItem('sdkKeyAccessToken', 'loopic-ops-dev-token');
location.reload();
```

### 3) 전체 오류 체크/버그 스모크 테스트
```bash
./scripts/bug-smoke-test.sh
```

## Android 빌드

### 사전 준비
- Android Studio (SDK/Platform Tools 설치)
- JDK 17
- `gradle` 명령 사용 가능 환경

### 1) 웹 에셋 동기화
```bash
npm run android:sync
# 또는 ./scripts/android-sync-assets.sh
```

### 2) 디버그 APK 빌드
```bash
npm run android:debug
# 내부적으로: cd android && gradle assembleDebug
```

빌드 결과물(기본 경로):
- `android/app/build/outputs/apk/debug/app-debug.apk`

### 3) 기기 설치(USB 디버깅)
```bash
npm run android:install
# 내부적으로: cd android && gradle installDebug
```

### 4) Android Studio로 열기
- Android Studio > Open > `android/` 선택
- 에뮬레이터/실기기에서 Run

## 구현 포인트
- 온보딩 4페이지 + 완료 플래그(localStorage)
- 하단 탭 내비게이션
- 하루 기록 저장(앨범+날짜 키)
- 실루엣 투명도 저장
- 리워드/인터스티셜 모달 동작 샘플
- 설정(언어/리마인드/Google 연결 상태)
- SDK 키 번들 JWS(RS256) 검증 및 서명 키(kid) 추적
- `/api/sdk-keys` Bearer 인증 + Origin 허용목록 + 간단 rate-limit 적용

## 운영 대시보드 모니터링 규칙
- 만료 임박 경보: ads/billing/render `expiresAt`가 14일 이내면 `warning`, 이미 만료면 `critical`로 표기.
- 서명 검증 실패율(1h): 최근 1시간 `sdkKeyMonitoring` 시도 기준 실패율 5% 이상 `warn`, 20% 이상 `bad`.

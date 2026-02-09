# 현재 상태 체크리스트 (Done / Not Done)

이 문서는 **지금 시점에서 실제로 된 것 / 아직 안 된 것**을 빠르게 확인하기 위한 운영 문서입니다.

## ✅ Done (완료)
- [x] 웹 프로토타입 핵심 화면/플로우 구현 (onboarding/home/camera/timeline/export/paywall)
- [x] SDK 키 번들 JWS(RS256) 검증 로직 적용 (`app.js`, `ops-dashboard.html`)
- [x] `/api/sdk-keys` 접근 제어 (Bearer + Origin allowlist + rate-limit + direct 파일 접근 차단)
- [x] Ops Dashboard 경보 규칙 연계
  - [x] 만료 임박(14일) 경보
  - [x] 서명 검증 실패율(1h)
- [x] 스모크 테스트 스크립트 제공 (`./scripts/bug-smoke-test.sh`)
- [x] Android 앱 구조(네이티브 WebView 호스트) 추가 (`android/`)
- [x] 웹 에셋 → Android assets 동기화 스크립트 제공 (`./scripts/android-sync-assets.sh`)

## ⚠️ Partially Done (부분 완료)
- [ ] Android 빌드 자동화 검증
  - [x] Android Gradle 프로젝트 파일 구성 완료
  - [x] `npm run android:sync` 동작 확인
  - [ ] 이 실행 환경에서 `assembleDebug` 성공 검증
    - 사유: 저장소/플러그인 해석 제한으로 AGP 아티팩트 resolve 실패 가능

## ❌ Not Done (미완료)
- [ ] Android 실기기 통합 QA (카메라 권한/촬영/오디오/WebView 정책)
- [ ] 외부 알림 채널 연동 (Slack/메일/PagerDuty)
- [ ] 운영 백엔드 기반 대시보드 집계 전환 (현재 localStorage 기반)
- [ ] Play 배포용 서명/릴리즈 파이프라인 (AAB 서명, CI 배포)

## 바로 확인 명령어
```bash
# 웹/보안 스모크
./scripts/bug-smoke-test.sh

# Android 에셋 동기화
npm run android:sync

# Android 디버그 빌드(로컬 Android Studio/정상 네트워크 환경 권장)
npm run android:debug
```

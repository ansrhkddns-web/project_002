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
    - 최근 확인(2026-02-08): `npm run android:debug` 실행 시 `Unsupported class file major version 69`로 실패 (Gradle/JDK 호환 이슈)

## ❌ Not Done (미완료)
- [ ] Android 실기기 통합 QA (카메라 권한/촬영/오디오/WebView 동작)
  - [x] 실기기 QA 체크리스트 문서/자동화 스크립트 추가 (`docs/android_device_qa_checklist.md`, `scripts/android-device-qa.sh`)
  - [x] CI 에뮬레이터 QA 워크플로 추가 (`.github/workflows/android-device-qa.yml`)
  - [x] Firebase Test Lab 기반 클라우드 실기기 QA 워크플로 추가 (`.github/workflows/android-real-device-qa.yml`)
  - [ ] 실제 디바이스에서 Pass 판정 기록 (`artifacts/qa_reports/android_device_qa_last_run.md`)
- [ ] 외부 알림 채널 연동 (Slack/메일/PagerDuty)
  - [x] webhook 기반 서버 알림 훅 추가 (`ALERT_WEBHOOK_URL`)
  - [x] 채널별 라우팅 환경변수 추가 (`ALERT_SLACK_WEBHOOK_URL`, `ALERT_PAGERDUTY_ROUTING_KEY`, `ALERT_EMAIL_WEBHOOK_URL`)
  - [ ] 실제 Slack/메일/PagerDuty 운영 라우팅 연결
  - [x] 로컬 alert dispatch 스모크 스크립트 추가 (`scripts/alert-channel-smoke.sh`)
- [x] 운영 백엔드 기반 대시보드 집계 API 추가 (`/api/analytics-events`, `/api/analytics-summary`)
- [ ] Play 배포용 서명/릴리즈 파이프라인 (AAB 서명, CI 배포)
  - [x] GitHub Actions release workflow 초안 추가 (`.github/workflows/android-release.yml`)
  - [x] Play Console 업로드 자동화(서비스 계정) 연결 워크플로 단계 추가 (`Upload to Google Play` optional step)
  - [ ] 운영 시크릿 주입 후 실제 업로드 검증
  - [x] 업로드 검증 리포트 자동 생성 스크립트/아티팩트 추가 (`scripts/play-upload-verification-report.sh`, `artifacts/qa_reports/play_upload_verification_last_run.md`)

## 바로 확인 명령어
```bash
# 웹/보안 스모크
./scripts/bug-smoke-test.sh

# Android 에셋 동기화
npm run android:sync

# Android 디버그 빌드(로컬 Android Studio/정상 네트워크 환경 권장)
npm run android:debug
```

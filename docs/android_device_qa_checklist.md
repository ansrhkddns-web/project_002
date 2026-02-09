# Android 실기기 통합 QA 체크리스트

목표: `TimeFlow` Android WebView 앱에서 **카메라 권한/촬영/오디오/WebView 정책**이 실제 기기에서 정상 동작하는지 검증.

## 0) 사전 준비
- 빌드 산출물 준비: `android/app/build/outputs/apk/debug/app-debug.apk`
- USB 디버깅 활성화 기기 연결
- `adb devices`에서 기기 인식 확인
- 필요 시 앱 제거 후 재설치

## 1) 설치/기동
- [ ] `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] `adb shell am start -n com.timeflow.app/.MainActivity`
- [ ] 앱 첫 실행 시 크래시 없이 홈 화면 표시

## 2) 권한/카메라/오디오
- [ ] 카메라 권한 허용 팝업 표시 및 허용 처리
- [ ] 카메라 프리뷰 정상 표시
- [ ] 촬영 액션 수행 시 파일 저장 또는 다운로드 fallback 정상 동작
- [ ] 마이크 권한(오디오) 요청/허용 후 관련 기능 오류 없음

## 3) WebView 정책/네트워크
- [ ] JS/DOM Storage 정상 동작(localStorage 상태 유지)
- [ ] `ops-dashboard.html` 접근 가능
- [ ] `/api/sdk-keys` 인증 토큰 있을 때 정상 응답(앱 기능 에러 없음)
- [ ] 오프라인 전환 시 사용자 알림/제한 동작 확인

## 4) 결제/광고/렌더 핵심 플로우
- [ ] 무료 경로: ad gate 진입/완료 플로우
- [ ] 유료 경로: paywall 진입/복원 버튼 동작
- [ ] export 진입/진행 UI 업데이트/완료 처리

## 5) 운영 로그 점검
- [ ] logcat에서 `crash`, `FATAL EXCEPTION`, `WebView` 치명 오류 미발생
- [ ] JS 런타임 오류(uncaught) 치명 건수 0

## 6) 결과 기록 템플릿
- 테스트 일시:
- 기기 모델 / Android 버전:
- 앱 버전(버전코드):
- 결과: Pass / Fail
- 실패 항목:
- 로그/스크린샷 경로:

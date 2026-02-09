# Implementation Progress (Current)

## ✅ 완료된 작업
- 온보딩 4페이지(스와이프/CTA/완료 플래그 저장)
- 홈 대시보드(통계/루프 카드)
- 카메라 프로토타입 + 일자 저장 규칙(로컬)
- 타임라인 월 뷰
- Export 화면(범위/속도/해상도/워터마크 옵션)
- 무료/유료 분기(무료 광고 게이트, 유료 즉시 생성)
- Paywall 화면 + 잠금 기능에서 업셀 진입
- 결제/복원 처리 상태(billingState) 및 잠금 액션 연계
- Export 생성 상태머신(진행률/취소)
- Export 결과 카드 + 히스토리(미리보기/저장/공유 액션)
- 광고/결제 SDK 준비형 서비스 계층(AdsService/BillingService) 도입
- 광고 게이트 중복 실행 방지 및 취소 콜백 정리
- 정책 문서 URL 상수(Privacy/Terms) 연결 준비
- 실제 카메라(WebRTC) 촬영 + 파일 저장(File System Access/다운로드 fallback) 연결
- 카메라 캡처 UI 시네마틱 오버레이/컨트롤로 디자인 개선
- BillingService 실제 결제/복원 SDK 연결(PaymentRequest + 네이티브 SDK 브리지)
- 실제 영상 렌더링 파이프라인(RenderService: SDK FFmpeg 브리지 + MediaRecorder fallback) 연결
- 에러/오프라인/저장공간 부족 케이스 상세 처리(offline listener, storage guard, 에러 매핑)
- 분석 이벤트 수집(D1/D3/D7, 결제 퍼널, 광고 퍼널) 연결
- AdsService 실제 광고 SDK 콜백 연결(외부 ads_config.json 키 로딩)
- 정책 문서 URL 별도 관리 페이지 연결(legal-links.html)
- SDK/분석 운영 모니터링 대시보드 연결(ops-dashboard.html)
- SDK 키 번들 자동 로테이션/자동 리프레시(sdk_keys.json + KeyRotationService)
- 실운영 키 배포 파이프라인(CDN/Secrets Manager) 연동(sdk_keys.json delivery sources)
- 서비스 운영 체크리스트 문서화(service_readiness_checklist.md)
- UX 통일 업그레이드 준비 문서화(ux_consistency_upgrade_plan.md)
- 키 번들 JWS(RS256) 검증 로직 추가(app.js/ops-dashboard)
- 서버측 접근 제어 고도화(server.js: Bearer + Origin allowlist + rate-limit + direct access 차단)
- 운영 대시보드 경보 규칙 연계(만료 임박 + 서명 검증 실패율 1h)
- Android 빌드 가능 구조 추가(android WebView 프로젝트 + assets sync 스크립트)
- 서버 분석 집계 API/운영 대시보드 백엔드 연동(/api/analytics-events, /api/analytics-summary)
- Android 실기기 QA 체크리스트/자동화 스크립트 추가(android-device-qa.sh + 문서)

## 🔄 남은 작업
- (현재 기준 핵심 기능 작업 완료, 운영 고도화 단계)

## ▶ 다음 순차 작업 제안
1) Android 실기기 통합 테스트(카메라/권한/WebView 동작)
2) 외부 알림 채널 연동(슬랙/메일/PagerDuty) 및 임계치 운영 튜닝

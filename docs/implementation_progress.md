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

## 🔄 남은 작업
1. AdsService를 실제 광고 SDK 콜백으로 교체
2. 실제 영상 렌더링 파이프라인(FFmpeg 등) 연결
3. 에러/오프라인/저장공간 부족 케이스 상세 처리
4. 분석 이벤트 수집(D1/D3/D7, 결제 퍼널, 광고 퍼널)
5. 정책 문서 URL(Privacy/Terms) 실제 운영 링크 입력

## ▶ 다음 순차 작업 제안
1) AdsService 실제 SDK 연결 → 2) 영상 렌더링 엔진 연결 → 3) 에러/오프라인 케이스 보강

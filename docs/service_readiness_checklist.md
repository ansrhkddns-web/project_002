# Service Readiness Checklist

## 1) 기능/운영 안정화 (즉시)
- [ ] **Secrets Proxy 실서버 연동**: `/api/sdk-keys`를 실제 Secrets Manager 백엔드와 연결.
- [ ] **키 번들 서명 검증(JWS)**: 클라이언트에서 `sdk_keys.json` 무결성 확인.
- [ ] **키 만료 알림**: `expiresAt` 임박 시 운영 알림(슬랙/메일).
- [ ] **광고 SDK 실키 검증**: Android/iOS 실제 ad unit으로 reward callback 검증.
- [ ] **결제 복원 실계정 검증**: sandbox 환경에서 purchase/restore end-to-end 확인.

## 2) 품질 게이트 (배포 전)
- [ ] **E2E 시나리오 자동화**
  - onboarding → camera save → export render
  - free(ad gate) / paid(paywall) 분기
  - 정책 링크 페이지 이동
- [ ] **오프라인/저장공간 부족 회귀 테스트** 자동화.
- [ ] **분석 이벤트 스키마 검증**: 이벤트 이름/필수 필드 누락 감지.

## 3) 관측성/운영
- [ ] **대시보드 백엔드 연동**: localStorage 기반에서 서버 집계 기반으로 확장.
- [ ] **경보 규칙**
  - `purchase_failed` 비율 급등
  - `ad_failed` 급등
  - `sdk_key_bundle_load_failed` 발생
- [ ] **릴리즈 체계**: key bundle 버전 롤백 절차 문서화.

## 4) 보안/정책
- [ ] 토큰(`sdkKeyAccessToken`) 저장 정책 재검토(가능하면 메모리/HttpOnly 전환).
- [ ] 정책 문서 페이지(`legal-links.html`)의 실제 운영 도메인 점검 및 법무 승인.

# UX Consistency Upgrade Plan

## 목표
카메라/Paywall/운영 페이지가 동일한 브랜드 톤(컬러/라운드/그림자/타이포)을 공유하도록 정리.

## 공통 규칙
1. **색상**: `--bg`, `--card`, `--primary`, `--text`, `--muted` 토큰만 사용.
2. **모서리**: 카드 16px, 주요 컨테이너 20~28px로 계층화.
3. **버튼**: primary / secondary 스타일을 모든 보조 페이지에도 동일 적용.
4. **상태 배지**: ok/warn/bad 컬러 체계 통일.
5. **간격**: 8px 그리드(8/16/24/32).

## 적용 순서
1) `styles.css`에 **auxiliary page theme** 추가 (legal/ops 공통).
2) `legal-links.html`, `ops-dashboard.html` 인라인 스타일 제거 및 공통 클래스 전환.
3) Export/Paywall 텍스트 크기 체계 정렬(heading/body/caption).
4) 접근성(contrast, focus ring, keyboard tab order) 점검.

## 완료 기준
- 동일한 버튼/배지/카드 스타일이 최소 3개 화면에서 공통 사용.
- 인라인 스타일 비율 70% 이상 제거.
- 모바일(430px)과 데스크탑(1200px)에서 레이아웃 깨짐 없음.

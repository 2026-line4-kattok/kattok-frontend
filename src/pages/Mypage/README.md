# 마이페이지

## 화면별 파일

- `Mypage.jsx`: 대시보드 (기존 디자인 유지)
- `MypageRecord.jsx`: 결제 기록, 수정 바텀시트, 삭제 확인창
- `MypageLogic.jsx`: 카똑 계산 방식 안내
- `MypageAccount.jsx`: 계정과 로그아웃 확인창
- `DeleteAccount.jsx`: 회원 탈퇴
- `Policy.jsx`: 약관 및 정책 메뉴
- `PolicyService.jsx`: 서비스 이용약관
- `PolicyPrivacy.jsx`: 개인정보 처리방침

`PolicyArticle.jsx`는 두 약관 화면의 공통 문단·목록 표시를 담당합니다.
라우터는 기존처럼 폴더의 `index.js`를 통해 진입합니다.

화면과 스타일은 src/pages/Mypage 안에 있습니다.
router.jsx에는 MyPage import와 /mypage 경로만 추가했으며 기존 경로는 모두 유지했습니다.
Toast, BottomNav 등 기존 컴포넌트와 다른 페이지는 수정하지 않았습니다.

## 화면 열기

개발 서버의 /mypage 주소 또는 하단 내비게이션의 My 버튼으로 열 수 있습니다.
별도의 미리보기 파일은 사용하지 않습니다.

## 구현 범위

- 마이 대시보드, 카드별 절약 현황, BottomNav 재사용
- 월별 결제 기록, 미결제 확인, 결제 카드 수정, 삭제 확인
- 수정/삭제 후 Toast 재사용 (4초 노출)
- 계산 안내, 계정, 로그아웃 확인, 회원 탈퇴 확인
- 약관/개인정보 처리방침 화면
- 모달의 Escape 닫기, 키보드 포커스 이동 및 복원

계정/결제 정보는 예시입니다. 변경은 현재 페이지의 메모리에서만 반영되며 새로고침하면 초기화됩니다.
월초 기록에는 전월 31일 기록도 함께 표시합니다.
실제 계정 변경과 서버 저장은 미연결입니다. 회원 탈퇴는 삭제 대신 미연결 안내를 보여줍니다.
약관/개인정보 문구는 화면용 초안으로 서비스 공개 전 확정된 원문으로 교체해야 합니다.
기존 카드 이미지 원본은 변경하지 않습니다.

## 검증

```powershell
npx.cmd eslint src/router/router.jsx src/pages/Mypage
npm.cmd run build
```

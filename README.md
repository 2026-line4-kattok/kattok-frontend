# Kattok Frontend

Kattok 서비스의 프론트엔드 저장소입니다.

## 기술 스택

| 구분            | 라이브러리                  | 버전 | 용도                            |
| --------------- | --------------------------- | ---- | ------------------------------- |
| 코어            | React                       | 19   | UI 구성                         |
| 라우팅          | React Router                | 7    | 페이지 라우팅                   |
| 서버 상태       | TanStack Query              | 5    | API 데이터 조회 및 캐싱         |
| 클라이언트 상태 | Zustand                     | 5    | 전역 상태 관리                  |
| HTTP 통신       | Axios                       | 1    | API 요청                        |
| 스타일링        | Tailwind CSS                | 4    | 유틸리티 기반 스타일링          |
| 스타일링        | clsx, tailwind-merge        | -    | 클래스 조건부 적용 및 충돌 정리 |
| 아이콘          | lucide-react                | 1    | 아이콘 컴포넌트                 |
| 빌드            | Vite                        | 8    | 개발 서버 및 빌드               |
| 코드 품질       | ESLint                      | 10   | 코드 검사                       |
| 코드 품질       | Prettier                    | 3    | 코드 포맷팅                     |
| 코드 품질       | prettier-plugin-tailwindcss | -    | Tailwind 클래스 자동 정렬       |

언어는 JavaScript(JSX)를 사용합니다.

## 시작하기

Node.js `20.19` 이상 또는 `22.12` 이상이 필요합니다.

```bash
git clone https://github.com/2026-line4-kattok/kattok-frontend.git
cd kattok-frontend
npm install
cp .env.example .env
npm run dev
```

### 환경 변수

| 이름                | 설명                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | API 서버 주소입니다. 비워 두면 `/api`로 요청하며, 개발 서버에서는 `http://localhost:8080`으로 프록시됩니다. |

`.env` 파일은 Git에 올리지 않습니다. 환경 변수가 추가되면 `.env.example`도 함께 수정해 주세요.

### 스크립트

| 명령어            | 설명                 |
| ----------------- | -------------------- |
| `npm run dev`     | 개발 서버 실행       |
| `npm run build`   | 프로덕션 빌드        |
| `npm run preview` | 빌드 결과 미리보기   |
| `npm run lint`    | ESLint 검사          |
| `npm run format`  | Prettier 포맷팅 적용 |

## 폴더 구조

```text
├── public/                정적 파일
├── src/
│   ├── api/               Axios 인스턴스 및 API 요청 함수
│   ├── assets/            이미지 등 리소스
│   ├── components/
│   │   ├── common/        공통 컴포넌트
│   │   └── layout/        레이아웃 컴포넌트
│   ├── hooks/             커스텀 훅
│   ├── pages/             페이지 컴포넌트 (페이지별 폴더)
│   ├── router/            라우트 설정
│   ├── stores/            Zustand 스토어
│   ├── utils/             유틸 함수
│   ├── App.jsx            RouterProvider 연결
│   ├── index.css          Tailwind CSS 진입점
│   └── main.jsx           앱 진입점, QueryClientProvider 연결
├── .env.example           환경 변수 예시
├── .prettierrc            Prettier 설정
├── eslint.config.js       ESLint 설정
├── jsconfig.json          에디터 경로 별칭 설정
└── vite.config.js         Vite 설정, 경로 별칭 및 API 프록시
```

## 개발 참고

- `src` 하위 파일은 `@/` 경로로 불러옵니다. 예: `import HomePage from '@/pages/Home/HomePage'`
- 새 페이지는 `src/pages/페이지명/페이지명Page.jsx`로 만들고 `src/router/router.jsx`에 등록합니다.
- API 요청은 `src/api/axiosInstance.js`의 `api`를 사용합니다. 응답 인터셉터가 `res.data`를 반환하므로 `.data` 없이 바로 값을 사용합니다.
- 조건부 클래스나 외부에서 받은 클래스를 합칠 때는 `src/utils/cn.js`의 `cn`을 사용합니다.
- 커밋 전에 `npm run lint`와 `npm run format`을 실행해 주세요.

## GitHub 전략

### 기본

- origin: https://github.com/2026-line4-kattok/kattok-frontend.git
- 최종 브랜치: `main` (배포 브랜치)
- 개발 브랜치: `develop`
- 매번 작업 전 `develop`을 pull 받아 충돌을 방지합니다.

```bash
git remote add origin https://github.com/2026-line4-kattok/kattok-frontend.git
```

### 이슈 전략

작업 시작 전에 Issue를 생성합니다.

- Assignees에 본인을 지정합니다.
- Issue 템플릿에 맞게 작성합니다.

### 브랜치 전략

작업 시작 전 기본 루틴은 다음과 같습니다.

```bash
git checkout develop
git pull origin develop
```

브랜치 형식은 다음과 같습니다. Issue 번호를 포함하고, 기능명은 영어 소문자로 작성합니다.

```text
타입/#이슈번호-기능명

ex) feat/#123-main-page
```

| 타입       | 설명          |
| ---------- | ------------- |
| `feat`     | 새로운 기능   |
| `fix`      | 버그 수정     |
| `style`    | CSS / UI 수정 |
| `refactor` | 코드 리팩토링 |
| `docs`     | 문서 수정     |
| `test`     | 테스트        |
| `chore`    | 설정 및 기타  |

```bash
git checkout -b feat/#123-main-page
```

### 커밋 전략

타입은 브랜치 전략과 동일합니다.

```text
타입: 작업내용

ex) feat: 메인 페이지 프로필 구현
```

### 작업 후

```bash
git push origin feat/#123-main-page
```

PR 방향은 다음과 같습니다.

```text
base: develop
compare: feat/#123-main-page
```

- PR 템플릿에 맞게 작성합니다.
- Assignees에 본인을 등록합니다.
- Reviewer를 서로 등록하고, Approve 후 각자 머지합니다.

import { createBrowserRouter } from 'react-router-dom';
import CardPage from '@/pages/Card/CardPage';
import HomePage from '@/pages/Home/HomePage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import Login from '@/pages/Onboarding/Login';
import Onboarding from '@/pages/Onboarding/Onboarding';
import Signup from '@/pages/Onboarding/Signup';
import CardChangePage from '@/pages/Home/PaymentDetail/CardChangePage';
import PaymentDetailPage from '@/pages/Home/PaymentDetail/PaymentDetailPage';
import PendingCardSelectPage from '@/pages/Home/PendingPayment/PendingCardSelectPage';
import AmountInputPage from '@/pages/Search/AmountInputPage';
import SearchPage from '@/pages/Search/SearchPage';
import MyPage from '@/pages/Mypage';
import RequireAuth from './RequireAuth';

export const router = createBrowserRouter([
  // 로그인 전 화면: 누구나 들어올 수 있습니다.
  // (회원가입 중에는 토큰이 저장된 상태로 온보딩에 돌아가기도 하므로 막지 않습니다.)
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },

  // 앱 화면: 로그인하지 않았으면 /onboarding으로 보냅니다.
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/payment/amount', element: <AmountInputPage /> },
      { path: '/payment/:paymentId', element: <PaymentDetailPage /> },
      { path: '/payment/:paymentId/card', element: <CardChangePage /> },
      // HOME-15. 홈 결제 확인 카드에서 실제 결제한 카드 고르기 (5-1)
      {
        path: '/pending/:recommendationId/card',
        element: <PendingCardSelectPage />,
      },
      { path: '/card', element: <CardPage /> },
      { path: '/mypage', element: <MyPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);

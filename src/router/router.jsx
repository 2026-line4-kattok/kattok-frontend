import { createBrowserRouter } from 'react-router-dom';
import CardPage from '@/pages/Card/CardPage';
import HomePage from '@/pages/Home/HomePage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import Login from '@/pages/Onboarding/Login';
import Onboarding from '@/pages/Onboarding/Onboarding';
import Signup from '@/pages/Onboarding/Signup';
import CardChangePage from '@/pages/Home/PaymentDetail/CardChangePage';
import PaymentDetailPage from '@/pages/Home/PaymentDetail/PaymentDetailPage';
import AmountInputPage from '@/pages/Search/AmountInputPage';
import SearchPage from '@/pages/Search/SearchPage';
import MyPage from '@/pages/Mypage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/payment/:paymentId', element: <PaymentDetailPage /> },
  { path: '/payment/:paymentId/card', element: <CardChangePage /> },
  { path: '/card', element: <CardPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/payment/amount', element: <AmountInputPage /> },
  { path: '*', element: <NotFoundPage /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/mypage', element: <MyPage /> },
]);

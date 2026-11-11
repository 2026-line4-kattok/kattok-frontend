import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/Home/HomePage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import Login from '@/pages/Onboarding/Login';
import Onboarding from '@/pages/Onboarding/Onboarding';
import Signup from '@/pages/Onboarding/Signup';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
]);

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { hasActiveSession } from '@/pages/Onboarding/authSession';

// 로그인하지 않았으면 앱 화면 대신 온보딩부터 시작합니다.
export default function RequireAuth() {
  const location = useLocation();
  if (!hasActiveSession()) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

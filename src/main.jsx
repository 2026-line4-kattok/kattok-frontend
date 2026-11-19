import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import { setUnauthorizedHandler } from './api/axiosInstance';
import { clearAuthSession } from './pages/Onboarding/authSession';
import { router } from './router/router';

const queryClient = new QueryClient();

setUnauthorizedHandler(() => {
  clearAuthSession();
  void queryClient.cancelQueries();
  queryClient.clear();
  return router.navigate('/login', {
    replace: true,
    state: { message: '로그인이 만료됐어요. 다시 로그인해주세요.' },
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

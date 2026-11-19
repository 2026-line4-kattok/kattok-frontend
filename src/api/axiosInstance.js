import axios from 'axios';

let unauthorizedHandler;
let handlingUnauthorized = false;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    console.error('[API Error]', err.response?.status, err.message);
    const path = (err.config?.url ?? '').split(/[?#]/)[0];
    const isLoginRequest = err.config?.method?.toLowerCase() === 'post'
      && /\/auth\/login\/?$/.test(path);
    const authorization = err.config?.headers?.get?.('Authorization')
      ?? err.config?.headers?.Authorization;
    const requestToken = authorization?.replace(/^Bearer\s+/i, '') ?? null;
    // 이전 로그인 세션의 늦은 응답으로 새 세션을 지우지 않습니다.
    const sameSession = requestToken === localStorage.getItem('accessToken');
    if (err.response?.status === 401 && !isLoginRequest && sameSession
      && unauthorizedHandler && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        await unauthorizedHandler();
      } finally {
        handlingUnauthorized = false;
      }
    }
    return Promise.reject(err);
  },
);

export default api;

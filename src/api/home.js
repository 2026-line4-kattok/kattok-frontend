import api from './axiosInstance';

// 4-1. 홈 요약 (결제 확인 카드 · 전체 대기 수 · 이번 달 챙긴 혜택)
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getHome = () => api.get('/v1/home');

import api from './axiosInstance';

// 4-2. 최근 결제한 곳 (최대 3개, 최근 추천 시각 내림차순)
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getRecentMerchants = () => api.get('/v1/merchants/recent');

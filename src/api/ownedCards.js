import api from './axiosInstance';

// 3-1. 보유 카드 목록
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getOwnedCards = () => api.get('/v1/owned-cards');

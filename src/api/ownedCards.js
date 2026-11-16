import api from './axiosInstance';

// 3-1. 보유 카드 목록
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getOwnedCards = () => api.get('/v1/owned-cards');

// 3-2. 보유 카드 상세 (이번 달, 한국 시간 기준)
export const getOwnedCardDetail = (id) => api.get(`/v1/owned-cards/${id}`);

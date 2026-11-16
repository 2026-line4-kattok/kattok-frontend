import api from './axiosInstance';

// 3-1. 보유 카드 목록
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getOwnedCards = () => api.get('/v1/owned-cards');

// 3-2. 보유 카드 상세 (이번 달, 한국 시간 기준)
export const getOwnedCardDetail = (id) => api.get(`/v1/owned-cards/${id}`);

// 3-3. 카드 상태 조회 (저장된 실적·남은 한도)
// month(YYYY-MM)를 생략하면 이번 달(한국 시간), date(YYYY-MM-DD)는 일 한도 조회 날짜입니다.
export const getOwnedCardState = (id, { month, date } = {}) =>
  api.get(`/v1/owned-cards/${id}/state`, { params: { month, date } });

// 3-4. 카드 상태 수정 (실적만, 한도만, 둘 다 한 번에)
// body: { month, performance?: { status, tierId? }, caps?: [{ capGroupId, remainingLimitAmount?, remainingCount?, periodStart? }] }
export const updateOwnedCardState = (id, body) =>
  api.put(`/v1/owned-cards/${id}/state`, body);

// 3-5. 카드 삭제 (204 No Content, 이미 삭제한 카드도 204)
// 409 LAST_OWNED_CARD: 등록 카드가 1장뿐이라 삭제할 수 없음
export const deleteOwnedCard = (id) => api.delete(`/v1/owned-cards/${id}`);

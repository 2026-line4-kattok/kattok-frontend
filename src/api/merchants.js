import api from './axiosInstance';

// 4-2. 최근 결제한 곳 (최대 3개, 최근 추천 시각 내림차순)
// baseURL에 '/api'가 포함되어 있으므로 '/v1/...'부터 적습니다.
export const getRecentMerchants = () => api.get('/v1/merchants/recent');

// 4-3. 업종 목록 ({ id, name } 배열, 배열 순서대로 칩 표시)
export const getMerchantCategories = () => api.get('/v1/merchant-categories');

// 4-4. 결제처 검색 (이름·별칭 부분 일치, 지원 우선 → 이름 → ID 정렬)
// 빈 검색어는 서버도 []를 반환하므로 호출하지 않습니다.
export const searchMerchants = (keyword) =>
  api.get('/v1/merchants', { params: { keyword } });

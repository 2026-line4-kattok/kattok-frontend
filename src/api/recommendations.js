import api from './axiosInstance';

// 4-7. 결제 확인 대기 기록 생성 (204 No Content)
// 결제 완료가 아니라, 홈의 결제 확인 카드에 띄울 대기 기록을 만듭니다.
// 같은 추천으로 여러 번 호출해도 대기 기록은 1건입니다.
// 404 RECOMMENDATION_NOT_FOUND · 409 NO_RECOMMENDED_CARD
export const confirmRecommendation = (id) =>
  api.post(`/v1/recommendations/${id}/confirm`);

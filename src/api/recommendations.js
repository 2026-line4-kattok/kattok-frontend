import api from './axiosInstance';

// 4-7. 결제 확인 대기 기록 생성 (204 No Content)
// 결제 완료가 아니라, 홈의 결제 확인 카드에 띄울 대기 기록을 만듭니다.
// 같은 추천으로 여러 번 호출해도 대기 기록은 1건입니다.
// 추천 카드가 아닌 다른 등록 카드를 골랐으면 body { userCardId }를 보내야 chosenCard가 채워집니다.
// 404 RECOMMENDATION_NOT_FOUND · 409 NO_RECOMMENDED_CARD
export const confirmRecommendation = (id, userCardId) =>
  api.post(
    `/v1/recommendations/${id}/confirm`,
    userCardId != null ? { userCardId } : undefined,
  );

// 5-1. 결제 확인 선택지 조회 (현재 기록 + 다른 카드 선택지 cardOptions)
// 404 RECOMMENDATION_NOT_FOUND · 409 PAYMENT_NOT_REQUESTED(대기 기록 없음)
export const getPaymentOptions = (id) =>
  api.get(`/v1/recommendations/${id}/payment`);

// 5-2. 결제 확인 응답 저장
// body: { result: 'PAID_RECOMMENDED' | 'PAID_OTHER' | 'PAID_UNREGISTERED' | 'NOT_PAID', userCardId? }
// userCardId는 PAID_OTHER일 때만 보냅니다.
export const savePaymentResult = (id, body) =>
  api.put(`/v1/recommendations/${id}/payment`, body);

// 4-5. 추천 생성 (201 Created)
// body: { merchantId | categoryId (둘 중 하나만), amount (1 ~ 10,000,000) }
// 400 INVALID_INPUT · 400 MERCHANT_NOT_SUPPORTED · 404 MERCHANT_NOT_FOUND
// 404 CATEGORY_NOT_FOUND · 409 NO_OWNED_CARDS
export const createRecommendation = (body) =>
  api.post('/v1/recommendations', body);

// 4-6. 추천 결과 조회 (4-5와 같은 형식, 당시 결과를 다시 계산하지 않음)
// 404 RECOMMENDATION_NOT_FOUND
export const getRecommendation = (id) => api.get(`/v1/recommendations/${id}`);

import { useQuery } from '@tanstack/react-query';
import { getPaymentOptions } from '@/api/recommendations';

export const paymentOptionsQueryKey = (id) => [
  'recommendations',
  id,
  'payment',
];

const getErrorCode = (error) => error?.response?.data?.code;

// 없는 추천이거나 다른 사용자의 추천
export const isRecommendationNotFoundError = (error) =>
  getErrorCode(error) === 'RECOMMENDATION_NOT_FOUND' ||
  error?.response?.status === 404;

// 결제 확인 대기 기록이 없는 추천 (4-7을 호출하지 않음)
export const isPaymentNotRequestedError = (error) =>
  getErrorCode(error) === 'PAYMENT_NOT_REQUESTED' ||
  error?.response?.status === 409;

const toPaymentOptionsView = (data) => ({
  id: data.recommendationId,
  result: data.result,
  place: data.merchant?.name ?? data.category?.name ?? '',
  category: data.category?.name ?? '',
  amount: data.amount ?? 0,
  // 추천 카드 (삭제됐으면 새로 고를 수 없습니다)
  recommendedCard: data.recommendedCard && {
    id: data.recommendedCard.userCardId,
    name: data.recommendedCard.productName,
    expectedBenefit: data.recommendedCard.expectedBenefit ?? null,
    deleted: data.recommendedCard.deleted ?? false,
  },
  // 지금 기록된 사용 카드 (확인 전이면 null)
  userCardId: data.userCard?.userCardId ?? null,
  // 추천 카드를 뺀 현재 등록 카드. expectedBenefit null = 계산 안 됨
  cardOptions: (data.cardOptions ?? []).map((option) => ({
    id: option.userCardId,
    name: option.productName,
    issuerName: option.issuerName,
    expectedBenefit: option.expectedBenefit ?? null,
  })),
});

// HOME-15(다른 카드 선택)를 열 때 지금 기록과 카드별 예상 혜택을 받아옵니다.
export default function usePaymentOptions(recommendationId) {
  return useQuery({
    queryKey: paymentOptionsQueryKey(recommendationId),
    queryFn: () => getPaymentOptions(recommendationId),
    enabled: recommendationId != null,
    select: toPaymentOptionsView,
    // 401·404·409는 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) =>
      ![401, 404, 409].includes(error?.response?.status) && count < 2,
  });
}

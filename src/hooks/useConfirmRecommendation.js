import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmRecommendation } from '@/api/recommendations';
import { HOME_QUERY_KEY } from '@/hooks/useHome';

const getErrorCode = (error) => error?.response?.data?.code;

// 없는 추천이거나 다른 사용자의 추천
export const isRecommendationNotFoundError = (error) =>
  getErrorCode(error) === 'RECOMMENDATION_NOT_FOUND' ||
  error?.response?.status === 404;

// 추천 카드가 없는 결과(NO_BENEFIT·NOT_CALCULABLE)라 대기 기록을 만들지 않음
export const isNoRecommendedCardError = (error) =>
  getErrorCode(error) === 'NO_RECOMMENDED_CARD' ||
  error?.response?.status === 409;

// [○○로 결제할게요] → 결제 확인 대기 기록을 만들고, 홈의 결제 확인 카드를 갱신합니다.
export default function useConfirmRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    // { recommendationId, userCardId? } — userCardId는 추천 카드가 아닌 등록 카드를 골랐을 때만
    mutationFn: ({ recommendationId, userCardId }) =>
      confirmRecommendation(recommendationId, userCardId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
  });
}

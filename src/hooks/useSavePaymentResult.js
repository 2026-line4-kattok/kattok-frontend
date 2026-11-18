import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePaymentResult } from '@/api/recommendations';
import { HOME_QUERY_KEY } from '@/hooks/useHome';
import { OWNED_CARDS_QUERY_KEY } from '@/hooks/useOwnedCards';
import { paymentOptionsQueryKey } from '@/hooks/usePaymentOptions';
import { RECENT_MERCHANTS_QUERY_KEY } from '@/hooks/useRecentMerchants';

export const PAYMENT_RESULT = {
  PAID_RECOMMENDED: 'PAID_RECOMMENDED',
  PAID_OTHER: 'PAID_OTHER',
  PAID_UNREGISTERED: 'PAID_UNREGISTERED',
  NOT_PAID: 'NOT_PAID',
};

// 결제 확인 저장 (5-2). { recommendationId, result, userCardId? }
// 저장 후 홈(대기 건·합계), 최근 결제한 곳, 내 카드(남은 한도)를 다시 받아옵니다.
export default function useSavePaymentResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recommendationId, result, userCardId }) =>
      savePaymentResult(recommendationId, {
        result,
        ...(result === PAYMENT_RESULT.PAID_OTHER && { userCardId }),
      }),
    onSuccess: (_, { recommendationId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: RECENT_MERCHANTS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({ queryKey: OWNED_CARDS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: paymentOptionsQueryKey(recommendationId),
        }),
      ]),
  });
}

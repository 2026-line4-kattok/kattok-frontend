import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOwnedCardState } from '@/api/ownedCards';
import { OWNED_CARDS_QUERY_KEY } from '@/hooks/useOwnedCards';
import { ownedCardStateQueryKey } from '@/hooks/useOwnedCardState';

// 카드 실적·남은 한도를 저장하고, 내 카드 목록·상세·상태를 다시 받아옵니다.
export default function useUpdateOwnedCardState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateOwnedCardState(id, body),
    onSuccess: (state, { id }) => {
      // 응답은 3-3 상태 조회와 같은 형식이라 바로 캐시에 넣어 다음에 시트를 열 때 씁니다.
      queryClient.setQueryData(ownedCardStateQueryKey(id), state);
      return queryClient.invalidateQueries({ queryKey: OWNED_CARDS_QUERY_KEY });
    },
  });
}

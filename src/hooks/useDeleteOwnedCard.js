import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOwnedCard } from '@/api/ownedCards';
import { OWNED_CARDS_QUERY_KEY } from '@/hooks/useOwnedCards';

// 마지막 카드라 삭제할 수 없을 때(409 LAST_OWNED_CARD)
export const isLastOwnedCardError = (error) =>
  error?.response?.status === 409 ||
  error?.response?.data?.code === 'LAST_OWNED_CARD';

// 보유 카드를 삭제하고 목록에서 뺍니다.
export default function useDeleteOwnedCard() {
  const queryClient = useQueryClient();

  const removeFromCache = (id) => {
    queryClient.setQueryData(OWNED_CARDS_QUERY_KEY, (prev) =>
      prev?.filter((card) => card.id !== id),
    );
    // 삭제한 카드의 상세·상태는 404가 되므로 캐시에서 지웁니다.
    queryClient.removeQueries({ queryKey: [...OWNED_CARDS_QUERY_KEY, id] });
  };

  return useMutation({
    mutationFn: (id) => deleteOwnedCard(id),
    onSuccess: (_, id) => {
      removeFromCache(id);
      return queryClient.invalidateQueries({
        queryKey: OWNED_CARDS_QUERY_KEY,
        exact: true,
      });
    },
    onError: (error, id) => {
      // 404: 이미 없는 카드이므로 목록에서 빼고 서버 목록을 다시 받습니다.
      if (error?.response?.status === 404) removeFromCache(id);
      // 409: 서버 기준 카드가 1장뿐이므로 목록을 다시 맞춥니다.
      queryClient.invalidateQueries({
        queryKey: OWNED_CARDS_QUERY_KEY,
        exact: true,
      });
    },
  });
}

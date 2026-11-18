import { useQuery } from '@tanstack/react-query';
import { getOwnedCardDetail } from '@/api/ownedCards';
import { toOwnedCardDetailView } from '@/pages/Card/ownedCardMapper';
import { OWNED_CARDS_QUERY_KEY } from '@/hooks/useOwnedCards';

// 목록 키 아래에 두어 invalidateQueries(OWNED_CARDS_QUERY_KEY) 한 번으로 상세도 함께 갱신됩니다.
export const ownedCardDetailQueryKey = (id) => [...OWNED_CARDS_QUERY_KEY, id];

// 보유 카드 상세를 받아 화면에서 쓰는 형태로 변환합니다.
export default function useOwnedCardDetail(id) {
  return useQuery({
    queryKey: ownedCardDetailQueryKey(id),
    queryFn: () => getOwnedCardDetail(id),
    enabled: id != null,
    select: toOwnedCardDetailView,
    // 404(OWNED_CARD_NOT_FOUND)는 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) => error?.response?.status !== 404 && count < 2,
  });
}

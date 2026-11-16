import { useQuery } from '@tanstack/react-query';
import { getOwnedCards } from '@/api/ownedCards';
import { toOwnedCardView } from '@/pages/Card/ownedCardMapper';

export const OWNED_CARDS_QUERY_KEY = ['owned-cards'];

// 보유 카드 목록을 받아 화면에서 쓰는 형태로 변환합니다.
export default function useOwnedCards() {
  return useQuery({
    queryKey: OWNED_CARDS_QUERY_KEY,
    queryFn: getOwnedCards,
    select: (data) => (data ?? []).map(toOwnedCardView),
  });
}

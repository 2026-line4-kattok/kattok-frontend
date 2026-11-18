import { useQuery } from '@tanstack/react-query';
import { getOwnedCardState } from '@/api/ownedCards';
import { toOwnedCardStateView } from '@/pages/Card/ownedCardMapper';
import { OWNED_CARDS_QUERY_KEY } from '@/hooks/useOwnedCards';

// 목록 키 아래에 두어 invalidateQueries(OWNED_CARDS_QUERY_KEY) 한 번으로 함께 갱신됩니다.
export const ownedCardStateQueryKey = (id, params = {}) => [
  ...OWNED_CARDS_QUERY_KEY,
  id,
  'state',
  params,
];

// 카드 사용 현황 시트를 열 때 저장된 실적·남은 한도를 받아옵니다.
export default function useOwnedCardState(
  id,
  { enabled = true, ...params } = {},
) {
  return useQuery({
    queryKey: ownedCardStateQueryKey(id, params),
    queryFn: () => getOwnedCardState(id, params),
    enabled: enabled && id != null,
    select: toOwnedCardStateView,
    // 시트를 열 때마다 최신 저장값으로 채웁니다.
    staleTime: 0,
    // 400(INVALID_INPUT)·404(OWNED_CARD_NOT_FOUND)는 다시 시도해도 같습니다.
    retry: (count, error) =>
      ![400, 404].includes(error?.response?.status) && count < 2,
  });
}

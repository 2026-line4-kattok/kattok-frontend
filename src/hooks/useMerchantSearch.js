import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchMerchants } from '@/api/merchants';

export const merchantSearchQueryKey = (keyword) => [
  'merchants',
  'search',
  keyword,
];

const toMerchantView = (merchant) => ({
  id: merchant.id,
  place: merchant.name,
  channel: merchant.channel,
  categoryId: merchant.category?.id,
  category: merchant.category?.name ?? '',
  supported: merchant.supported !== false,
  unsupportedReason: merchant.unsupportedReason,
});

// 결제처 검색. 서버 정렬(지원 우선 → 이름 → ID)을 그대로 쓰고 미지원 결제처도 빼지 않습니다.
// keyword는 앞뒤 공백을 제거한 값을 넘기며, 비어 있으면 호출하지 않습니다.
export default function useMerchantSearch(keyword) {
  return useQuery({
    queryKey: merchantSearchQueryKey(keyword),
    queryFn: () => searchMerchants(keyword),
    enabled: keyword.length > 0,
    select: (data) => (data ?? []).map(toMerchantView),
    // 입력 중 결과가 비었다가 다시 채워지며 깜빡이지 않도록 이전 결과를 유지합니다.
    placeholderData: keepPreviousData,
    // 401은 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) => error?.response?.status !== 401 && count < 2,
  });
}

import { useQuery } from '@tanstack/react-query';
import { getMerchantCategories } from '@/api/merchants';
import { getCategoryIcon } from '@/constants/categories';

export const MERCHANT_CATEGORIES_QUERY_KEY = ['merchant-categories'];

// 업종 칩 목록. 개수·순서·ID를 프론트에 고정하지 않고 서버 응답을 그대로 씁니다.
// 선택한 id는 추천 요청의 categoryId로 보냅니다.
export default function useMerchantCategories() {
  return useQuery({
    queryKey: MERCHANT_CATEGORIES_QUERY_KEY,
    queryFn: getMerchantCategories,
    select: (data) =>
      (data ?? []).map(({ id, name }) => ({
        id,
        name,
        icon: getCategoryIcon(name),
      })),
    // 업종 목록은 자주 바뀌지 않으므로 5분간 캐시를 그대로 씁니다.
    staleTime: 5 * 60 * 1000,
    // 401은 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) => error?.response?.status !== 401 && count < 2,
  });
}

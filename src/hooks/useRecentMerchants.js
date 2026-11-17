import { useQuery } from '@tanstack/react-query';
import { getRecentMerchants } from '@/api/merchants';

export const RECENT_MERCHANTS_QUERY_KEY = ['merchants', 'recent'];

// lastRecommendedAt은 KST 오프셋이 포함된 ISO 문자열이라 날짜 부분을 그대로 씁니다.
// '2026-11-01T00:00:00+09:00' → '11월 01일'
const formatRecommendedDate = (iso) => {
  if (!iso) return '';
  const [, month, day] = iso.slice(0, 10).split('-');
  return `${month}월 ${day}일`;
};

const toRecentMerchantView = (merchant) => ({
  id: merchant.id,
  place: merchant.name,
  channel: merchant.channel,
  categoryId: merchant.category?.id,
  category: merchant.category?.name ?? '',
  supported: merchant.supported !== false,
  unsupportedReason: merchant.unsupportedReason,
  date: formatRecommendedDate(merchant.lastRecommendedAt),
});

// 홈(HOME-01)과 결제처 검색 입력 전 화면(HOME-04A)에서 함께 씁니다.
// 서버 정렬(최근 추천 시각 → ID)을 그대로 유지하고, 미지원 결제처도 빼지 않습니다.
export default function useRecentMerchants() {
  return useQuery({
    queryKey: RECENT_MERCHANTS_QUERY_KEY,
    queryFn: getRecentMerchants,
    select: (data) => (data ?? []).map(toRecentMerchantView),
    refetchOnMount: 'always',
    // 401은 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) => error?.response?.status !== 401 && count < 2,
  });
}

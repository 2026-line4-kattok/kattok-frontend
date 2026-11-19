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

// type: 'MERCHANT'(결제처로 고른 결제) | 'CATEGORY'(업종으로 고른 결제)
// CATEGORY 항목은 id가 null이고 name이 업종 이름이라 key는 type + id(업종은 category.id)로 만듭니다.
export const RECENT_TYPE = {
  MERCHANT: 'MERCHANT',
  CATEGORY: 'CATEGORY',
};

const toRecentMerchantView = (merchant) => {
  const type = merchant.type ?? RECENT_TYPE.MERCHANT;
  const isCategory = type === RECENT_TYPE.CATEGORY;
  const categoryId = merchant.category?.id;
  return {
    key: `${type}-${isCategory ? categoryId : merchant.id}`,
    type,
    isCategory,
    id: merchant.id,
    place: merchant.name,
    channel: merchant.channel,
    categoryId,
    category: merchant.category?.name ?? (isCategory ? merchant.name : ''),
    supported: merchant.supported !== false,
    unsupportedReason: merchant.unsupportedReason,
    date: formatRecommendedDate(merchant.lastRecommendedAt),
  };
};

// 최근 결제 항목을 눌렀을 때 금액 입력 화면으로 넘길 state.
// 업종 항목은 업종 칩과 같이 merchantId 없이 categoryId로 추천을 요청합니다.
export const toRecentAmountState = (item) =>
  item.isCategory
    ? { categoryId: item.categoryId, category: item.category }
    : {
        merchantId: item.id,
        categoryId: item.categoryId,
        category: item.category,
        place: item.place,
      };

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

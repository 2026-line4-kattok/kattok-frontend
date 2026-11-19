import { useQuery } from '@tanstack/react-query';
import { getHome } from '@/api/home';

export const HOME_QUERY_KEY = ['home'];

// 서버 응답을 홈 화면에서 쓰는 형태로 변환합니다.
const toHomeView = (data) => {
  const pending = data?.pendingPayment ?? null;
  return {
    pendingPayment: pending && {
      id: pending.recommendationId,
      // 결과 화면에서 다른 카드를 골랐으면 chosenCard, 추천 카드 그대로면 null
      chosenCardId: pending.chosenCard?.userCardId ?? null,
      cardName:
        pending.chosenCard?.productName ??
        pending.recommendedCard?.productName ??
        '',
      // 고른 카드가 있으면 추천 카드 삭제 여부와 상관없이 그 카드로 확인합니다.
      isCardDeleted:
        !pending.chosenCard && (pending.recommendedCard?.deleted ?? false),
      place: pending.merchant?.name ?? '',
      category: pending.category?.name ?? '',
      amount: pending.amount ?? 0,
    },
    pendingCount: data?.pendingCount ?? 0,
    savedBenefit: {
      month: data?.savedBenefit?.month,
      amount: data?.savedBenefit?.amount ?? 0,
      paymentCount: data?.savedBenefit?.paymentCount ?? 0,
    },
  };
};

// 홈을 열 때·결제 확인 후 홈으로 돌아올 때마다 다시 받아옵니다.
export default function useHome() {
  return useQuery({
    queryKey: HOME_QUERY_KEY,
    queryFn: getHome,
    select: toHomeView,
    refetchOnMount: 'always',
    // 401은 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) => error?.response?.status !== 401 && count < 2,
  });
}

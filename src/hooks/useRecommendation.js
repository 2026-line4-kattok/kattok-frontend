import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecommendation, getRecommendation } from '@/api/recommendations';

export const recommendationQueryKey = (id) => ['recommendations', String(id)];

// 없는 추천이거나 다른 사용자의 추천
export const isRecommendationNotFoundError = (error) =>
  error?.response?.data?.code === 'RECOMMENDATION_NOT_FOUND' ||
  error?.response?.status === 404;

// 에러 코드 → 안내 문구
export const getRecommendationErrorMessage = (error) => {
  const code = error?.response?.data?.code;
  switch (code) {
    case 'MERCHANT_NOT_SUPPORTED':
      return {
        title: '아직 계산하지 않는 곳이에요',
        description: '업종으로 골라 추천받아 보세요',
      };
    case 'INVALID_INPUT':
      return {
        title: '금액을 확인해 주세요',
        description: '1원부터 1,000만 원까지 입력할 수 있어요',
      };
    case 'MERCHANT_NOT_FOUND':
      return {
        title: '결제처를 찾을 수 없어요',
        description: '다시 검색해 주세요',
      };
    case 'CATEGORY_NOT_FOUND':
      return {
        title: '업종을 찾을 수 없어요',
        description: '다른 업종을 골라 주세요',
      };
    case 'NO_OWNED_CARDS':
      return {
        title: '등록된 카드가 없어요',
        description: '카드를 먼저 등록해 주세요',
      };
    default:
      return {
        title: '추천하지 못했어요',
        description: '잠시 후 다시 시도해 주세요',
      };
  }
};

// 추천 생성 (4-5). body: { merchantId | categoryId, amount }
export function useCreateRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => createRecommendation(body),
    // 생성 응답이 조회(4-6)와 같은 형식이므로 바로 캐시에 넣어 결과 화면에서 다시 요청하지 않습니다.
    onSuccess: (data) =>
      queryClient.setQueryData(recommendationQueryKey(data.id), data),
  });
}

// 추천 결과 조회 (4-6). 저장된 결과는 바뀌지 않으므로 한 번 받으면 다시 요청하지 않습니다.
export default function useRecommendation(id) {
  return useQuery({
    queryKey: recommendationQueryKey(id),
    queryFn: () => getRecommendation(id),
    enabled: id != null,
    staleTime: Infinity,
    // 401·404는 다시 시도해도 같으므로 재시도하지 않습니다.
    retry: (count, error) =>
      ![401, 404].includes(error?.response?.status) && count < 2,
  });
}

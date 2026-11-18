import { useNavigate } from 'react-router-dom';
import { isRecommendationNotFoundError } from '@/hooks/useRecommendation';

// 추천 결과(4-6)를 불러오는 중·실패 화면
export default function RecommendationStatusScreen({
  isPending,
  error,
  onRetry,
}) {
  const navigate = useNavigate();
  const isNotFound = isRecommendationNotFoundError(error);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center gap-[12px] bg-[#F1F1F1] px-[18px] text-center font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
      {isPending ? (
        <p>추천 결과를 불러오는 중이에요</p>
      ) : (
        <>
          <p>
            {isNotFound
              ? '추천 결과를 찾을 수 없어요'
              : '추천 결과를 불러오지 못했어요'}
          </p>
          <button
            type="button"
            onClick={
              isNotFound ? () => navigate('/', { replace: true }) : onRetry
            }
            className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
          >
            {isNotFound ? '홈으로 돌아가기' : '다시 시도'}
          </button>
        </>
      )}
    </main>
  );
}

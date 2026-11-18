import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Toast from '@/components/common/Toast';
import AmountKeypad, { AmountDisplay } from '@/components/common/AmountKeypad';
import useAmountInput from '@/hooks/useAmountInput';
import PageHeader from '@/components/layout/PageHeader';
import { getCategoryIcon } from '@/constants/categories';
import {
  getRecommendationErrorMessage,
  useCreateRecommendation,
} from '@/hooks/useRecommendation';

// 추천 요청 금액 범위 (4-5)
const MAX_RECOMMEND_AMOUNT = 10_000_000;

export default function AmountInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { amount, appendDigit, removeDigit, addAmount } = useAmountInput();
  const { mutate: recommend, isPending: isRecommending } =
    useCreateRecommendation();
  // 추천 실패 안내 { title, description }
  const [errorToast, setErrorToast] = useState(null);
  const closeErrorToast = useCallback(() => setErrorToast(null), []);

  // 검색 화면을 거치지 않고 들어오면 장소 정보가 없으므로 돌려보냅니다.
  if (!state?.place && !state?.category) {
    return <Navigate to="/search" replace />;
  }

  const { place, category, merchantId, categoryId } = state;
  const isOverMax = amount > MAX_RECOMMEND_AMOUNT;
  const title = place ?? category;
  const categoryIcon = getCategoryIcon(category);

  const handleSave = () => {
    // 결제처를 골랐으면 merchantId만, 업종 칩으로 골랐으면 categoryId만 보냅니다.
    const body =
      merchantId != null ? { merchantId, amount } : { categoryId, amount };
    recommend(body, {
      // 혜택 없음·계산 불가도 결과 화면에서 안내합니다.
      onSuccess: (data) => navigate(`/payment/${data.id}`),
      onError: (error) => setErrorToast(getRecommendationErrorMessage(error)),
    });
  };

  return (
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <PageHeader
        // 업종으로 고르기에서 들어오면 장소 없이 업종만 있습니다.
        title={place ? title : '업종으로 고르기'}
        onBack={() => navigate(-1)}
        onClose={() => navigate('/')}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[402px] flex-1 flex-col px-[22px] max-phone-xs:px-3">
        <div className="mt-[32px] flex items-center gap-[12px]">
          {categoryIcon ? (
            <img
              src={categoryIcon}
              alt=""
              className="size-[48px] shrink-0 object-contain"
            />
          ) : (
            <span className="size-[48px] shrink-0 bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f6f6f6_0_50%)] bg-size-[12px_12px]" />
          )}
          <span className="flex min-w-0 flex-col gap-[4px]">
            <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
              {title}
            </span>
            {place && category && (
              <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                {category}
              </span>
            )}
          </span>
        </div>

        <h2 className="mt-[8px] font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
          결제 금액을 알려주세요.
        </h2>

        <AmountDisplay
          amount={amount}
          placeholder="결제 금액"
          className="mt-[48px]"
        />

        <div className="pt-[48px]">
          <AmountKeypad
            onDigit={appendDigit}
            onDelete={removeDigit}
            onAdd={addAmount}
          />
        </div>
      </main>

      <div className="mx-auto w-full max-w-[402px] shrink-0 px-6 pt-[40px] pb-[max(44px,env(safe-area-inset-bottom))] max-phone-s:pt-[24px] max-phone-xs:px-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={amount === 0 || isOverMax || isRecommending}
          className="flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:bg-[#DBE1FF] disabled:text-[#B2BEFF]"
        >
          {isRecommending ? '계산하는 중이에요' : '저장하기'}
        </button>
        {isOverMax && (
          <p className="mt-[8px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#EE695D]">
            1,000만 원까지 추천받을 수 있어요
          </p>
        )}
      </div>

      {errorToast && (
        <Toast
          icon={
            <span className="flex size-[24px] items-center justify-center rounded-full bg-[#E46A5E]">
              <X className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
            </span>
          }
          title={<span className="text-[#EE695D]">{errorToast.title}</span>}
          description={errorToast.description}
          hasArrow={false}
          onClick={closeErrorToast}
          onClose={closeErrorToast}
        />
      )}
    </div>
  );
}

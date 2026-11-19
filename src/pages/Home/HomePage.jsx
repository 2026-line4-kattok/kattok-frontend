import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from '@/components/common/Toast';
import BottomNav from '@/components/layout/BottomNav';
import { getCategoryIcon } from '@/constants/categories';
import useMerchantCategories from '@/hooks/useMerchantCategories';
import useHome from '@/hooks/useHome';
import useRecentMerchants, {
  toRecentAmountState,
} from '@/hooks/useRecentMerchants';
import useSavePaymentResult, {
  PAYMENT_RESULT,
} from '@/hooks/useSavePaymentResult';
import {
  getPaymentErrorMessage,
  getPaymentResultMessage,
} from '@/utils/paymentResultMessage';
import { cn } from '@/utils/cn';

const AMOUNT_PATH = '/payment/amount';

// 결제 완료 여부 확인 카드
function PendingPaymentCard({
  payment,
  onMore,
  onReject,
  onConfirm,
  disabled,
}) {
  const { cardName, place, amount } = payment;

  return (
    <div className="-mt-3 w-full overflow-hidden rounded-b-[8px] bg-[#EBEBEB]">
      <div className="flex flex-col gap-3 px-[24px] pt-[27px] pb-[16px] max-phone-m:px-4 max-phone-xs:px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <span className="flex size-[20px] items-center justify-center rounded-full bg-[#C4C4C4] text-[14px] leading-none font-bold text-[#FAFAFA]">
              !
            </span>
            <span className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
              확인
            </span>
          </div>
          <button
            type="button"
            onClick={onMore}
            className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]"
          >
            더보기
          </button>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-['Pretendard'] text-[18px] leading-[120%] font-semibold text-[#121212]">
            {cardName}로 결제하셨나요?
          </p>
          <p className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]">
            {place} · {amount.toLocaleString('ko-KR')}원
          </p>
        </div>
      </div>
      <div className="flex h-[36px]">
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          aria-label="결제하지 않았어요"
          className="flex flex-1 items-center justify-center bg-[#F8C5C0]"
        >
          <X className="size-[22px] text-[#D53D30]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          aria-label="결제했어요"
          className="flex flex-1 items-center justify-center bg-[#CAD2FF]"
        >
          <Check className="size-[22px] text-[#7F90E8]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

// 하단 최근 결제 카드 목록. 미지원 결제처는 흐리게 보여 주고 선택을 막습니다.
function RecentPaymentCard({ payment, onClick }) {
  const { place, category, date, supported, unsupportedReason } = payment;
  const categoryIcon = getCategoryIcon(category);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!supported}
      className={cn(
        'flex h-[180px] w-[280px] shrink-0 flex-wrap content-start items-start gap-y-1 overflow-hidden rounded-[8px] bg-[#FAFAFA] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)]',
        !supported && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex h-[180px] w-[113px] shrink-0 flex-col items-center justify-center gap-4 overflow-hidden rounded-[8px] bg-[#EBEBEB]">
        {categoryIcon ? (
          <img
            src={categoryIcon}
            alt=""
            className="size-[64px] object-contain"
          />
        ) : (
          <span className="size-[64px] bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f1f1f1_0_50%)] bg-size-[14px_14px]" />
        )}
      </div>
      <div className="flex h-[180px] flex-[1_0_0] flex-col items-start justify-between p-4 text-left">
        <div className="flex flex-col items-start gap-1">
          <p className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#3B426B]">
            {place}
          </p>
          <p className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]">
            {category} · {date}
          </p>
        </div>
        {supported ? (
          <span className="flex h-[36px] shrink-0 items-center justify-center gap-1 self-stretch rounded-[27px] bg-[#A3B1FF] px-3 py-[10px] text-center font-['Pretendard'] text-[16px] leading-[140%] font-normal text-[#3B426B]">
            바로 입력
          </span>
        ) : (
          <span className="font-['Pretendard'] text-[13px] leading-[140%] font-normal break-keep text-[#8E8E8E]">
            {unsupportedReason ?? '카똑이 아직 계산하지 않는 곳'}
          </span>
        )}
      </div>
    </button>
  );
}

// 최근 결제 내역이 없는 경우
function EmptyRecentCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[174px] w-full items-center justify-center rounded-xl bg-[#FAFAFA] font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#8E8E8E]"
    >
      최근 결제 내역이 없어요
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 결제 확인 저장 결과 안내 { category, title, description, variant: 'success' | 'notPaid' | 'error' }
  // HOME-15에서 저장하고 돌아오면 location.state.paymentToast로 받습니다.
  const [paymentToast, setPaymentToast] = useState(
    location.state?.paymentToast ?? null,
  );
  const closePaymentToast = useCallback(() => setPaymentToast(null), []);
  const { mutate: savePayment, isPending: isSaving } = useSavePaymentResult();
  // 홈 요약 (결제 확인 카드·이번 달 챙긴 혜택). 홈에 들어올 때마다 다시 받아옵니다.
  const { data: home, isPending, isError, refetch } = useHome();
  // 업종 칩 (개수·순서·ID는 서버 응답 기준)
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useMerchantCategories();
  // 최근 결제한 곳 (최대 3개). 실패하면 홈 전체가 아닌 이 영역에서 재시도를 안내합니다.
  const {
    data: recentMerchants = [],
    isPending: isRecentPending,
    isError: isRecentError,
    refetch: refetchRecent,
  } = useRecentMerchants();
  const monthlyBenefit = home?.savedBenefit.amount;
  // 저장에 성공한 결제건은 홈을 다시 받아오기 전까지 바로 숨깁니다.
  const [savedPaymentId, setSavedPaymentId] = useState(null);
  const pendingPayment =
    home?.pendingPayment && home.pendingPayment.id !== savedPaymentId
      ? home.pendingPayment
      : null;

  // 새로고침·뒤로 가기 시 토스트가 다시 뜨지 않도록 전달받은 state를 비웁니다.
  useEffect(() => {
    if (location.state?.paymentToast) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  // 결제 확인 카드의 [네](PAID_RECOMMENDED) / [X](NOT_PAID) 저장
  const handleSavePayment = (result) => {
    const payment = pendingPayment;
    savePayment(
      { recommendationId: payment.id, result },
      {
        onSuccess: (response) => {
          setSavedPaymentId(payment.id);
          const message = getPaymentResultMessage(response, payment.place);
          setPaymentToast({
            category: payment.category,
            title: message.title,
            description: message.description,
            variant: message.isNotPaid ? 'notPaid' : 'success',
          });
        },
        onError: (error) =>
          setPaymentToast({
            category: payment.category,
            ...getPaymentErrorMessage(error),
            variant: 'error',
          }),
      },
    );
  };

  const goToCardSelect = () => navigate(`/pending/${pendingPayment.id}/card`);

  const handleConfirmPayment = () => {
    // 추천 카드가 삭제됐으면 추천 카드로 결제를 새로 고를 수 없으므로 다른 카드 선택으로 보냅니다.
    if (pendingPayment.isCardDeleted) {
      goToCardSelect();
      return;
    }
    handleSavePayment(PAYMENT_RESULT.PAID_RECOMMENDED);
  };

  // 조회 실패(5xx 등)는 빈 홈으로 숨기지 않고 다시 시도 안내를 보여 줍니다.
  if (isError) {
    return (
      <div className="min-h-dvh bg-[#F1F1F1]">
        <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center gap-[12px] px-[18px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))] text-center font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
          <p>홈 정보를 불러오지 못했어요</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
          >
            다시 시도
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-[1_0_0] flex-col items-start gap-[24px] self-stretch px-[18px] pt-[calc(var(--screen-top)+24px)] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-['Pretendard'] text-[24px] leading-[120%] font-semibold text-[#121212]">
            어디서 결제하세요?
          </h1>
          <p className="font-['Pretendard'] text-[16px] leading-[140%] font-normal break-keep text-[#8E8E8E] max-phone-s:text-[14px]">
            내 카드 중 가장 혜택 좋은 카드를 알려드려요
          </p>
        </div>

        <div className="flex w-full flex-col">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="relative z-10 flex min-h-[60px] w-full items-center justify-between gap-2 rounded-[8px] bg-[#fafafa] px-[24px] py-3 shadow-[0_4px_12px_0_rgba(0,0,0,0.04)] max-phone-m:px-4 max-phone-xs:px-3"
          >
            <span className="min-w-0 text-left font-['Pretendard'] text-[16px] leading-[140%] font-medium break-keep text-[#6E6E6E] max-phone-s:text-[14px]">
              이번 달 카똑으로 챙긴 혜택
            </span>
            <span className="shrink-0 font-['Pretendard'] text-[24px] leading-[120%] font-semibold whitespace-nowrap text-[#8C9EFF] max-phone-m:text-[20px] max-phone-s:text-[18px]">
              {isPending ? '-' : `${monthlyBenefit.toLocaleString('ko-KR')}원`}
            </span>
          </button>
          {pendingPayment && (
            <PendingPaymentCard
              payment={pendingPayment}
              // [다른 카드로] → HOME-15에서 5-1 선택지를 받아 실제 결제한 카드를 고릅니다.
              onMore={goToCardSelect}
              onReject={() => handleSavePayment(PAYMENT_RESULT.NOT_PAID)}
              onConfirm={handleConfirmPayment}
              disabled={isSaving}
            />
          )}
        </div>

        <section className="flex w-full flex-col gap-[12px]">
          <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
            업종으로 고르기
          </h2>
          {isCategoriesPending ||
          isCategoriesError ||
          categories.length === 0 ? (
            <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-[12px] rounded-[8px] bg-[#FAFAFA] font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)]">
              {isCategoriesPending ? (
                <p>업종을 불러오는 중이에요</p>
              ) : isCategoriesError ? (
                <>
                  <p>업종을 불러오지 못했어요</p>
                  <button
                    type="button"
                    onClick={() => refetchCategories()}
                    className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
                  >
                    다시 시도
                  </button>
                </>
              ) : (
                <p>선택할 수 있는 업종이 없어요</p>
              )}
            </div>
          ) : (
            <ul className="grid min-h-[200px] w-full grid-cols-4 content-start justify-items-center gap-y-1 rounded-[8px] bg-[#FAFAFA] px-3 pt-2 pb-3 shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-xs:px-1">
              {categories.map(({ id, name, icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    // 업종만 고르면 merchantId 없이 categoryId만 보냅니다.
                    onClick={() =>
                      navigate(AMOUNT_PATH, {
                        state: { categoryId: id, category: name },
                      })
                    }
                    className="flex w-full flex-col items-center gap-y-[4px]"
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="size-[64px] object-contain max-phone-xs:size-[52px]"
                      />
                    ) : (
                      <span className="size-[64px] bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f1f1f1_0_50%)] bg-size-[14px_14px] max-phone-xs:size-[52px]" />
                    )}
                    <span className="text-center font-['Pretendard'] text-[14px] leading-[140%] font-normal break-keep text-[#8E8E8E] max-phone-s:text-[13px] max-phone-xs:text-[12px]">
                      {name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="w-full">
          <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
            최근 결제로 고르기
          </h2>
          {isRecentPending ? (
            <div className="mt-[12px] flex h-[174px] w-full items-center justify-center rounded-xl bg-[#FAFAFA] font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
              최근 결제한 곳을 불러오는 중이에요
            </div>
          ) : isRecentError ? (
            <div className="mt-[12px] flex h-[174px] w-full flex-col items-center justify-center gap-[12px] rounded-xl bg-[#FAFAFA] font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
              <p>최근 결제한 곳을 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => refetchRecent()}
                className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
              >
                다시 시도
              </button>
            </div>
          ) : recentMerchants.length > 0 ? (
            <div className="-mx-[18px] mt-[12px] flex [scrollbar-width:none] gap-3 overflow-x-auto px-[18px] max-phone-xs:-mx-3 max-phone-xs:px-3 [&::-webkit-scrollbar]:hidden">
              {recentMerchants.map((merchant) => (
                <RecentPaymentCard
                  key={merchant.key}
                  payment={merchant}
                  onClick={() =>
                    navigate(AMOUNT_PATH, {
                      state: toRecentAmountState(merchant),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-[12px]">
              <EmptyRecentCard onClick={() => navigate('/search')} />
            </div>
          )}
        </section>
      </main>

      {paymentToast && (
        <Toast
          categoryIcon={getCategoryIcon(paymentToast.category)}
          icon={
            paymentToast.variant === 'success' ? (
              <span className="flex size-[24px] items-center justify-center rounded-full bg-[#8C9EFF]">
                <Check className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
              </span>
            ) : (
              <span className="flex size-[24px] items-center justify-center rounded-full bg-[#E46A5E]">
                <X className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
              </span>
            )
          }
          title={
            <span
              className={
                paymentToast.variant === 'success'
                  ? 'text-[#A3B1FF]'
                  : 'text-[#EE695D]'
              }
            >
              {paymentToast.title}
            </span>
          }
          description={paymentToast.description}
          hasArrow={false}
          onClick={closePaymentToast}
          onClose={closePaymentToast}
        />
      )}

      <BottomNav />
    </div>
  );
}

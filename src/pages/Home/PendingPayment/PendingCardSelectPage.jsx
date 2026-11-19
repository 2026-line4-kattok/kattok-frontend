import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import useOwnedCards from '@/hooks/useOwnedCards';
import usePaymentOptions, {
  isPaymentNotRequestedError,
  isRecommendationNotFoundError,
} from '@/hooks/usePaymentOptions';
import useSavePaymentResult, {
  PAYMENT_RESULT,
} from '@/hooks/useSavePaymentResult';
import { CardOption } from '@/pages/Home/PaymentDetail/CardChangePage';
import { formatWon } from '@/pages/Home/PaymentDetail/paymentDetailData';
import {
  getPaymentErrorMessage,
  getPaymentResultMessage,
} from '@/utils/paymentResultMessage';

// 카드 외에 항상 있는 선택지 (서버가 따로 내려주지 않습니다)
const UNREGISTERED = 'unregistered';
const NOT_PAID = 'not-paid';

// 보유 카드 목록(3-1)에서 카드 이미지를 찾아 붙입니다. (삭제된 카드·목록 실패 시 이미지 없이 보여 줍니다)
const withImage = (card, cardImages) => {
  const owned = cardImages.get(card.id);
  return {
    ...card,
    image: owned?.image,
    isHorizontal: owned?.isHorizontal ?? true,
  };
};

// 지금 기록을 기준으로 처음 선택해 둘 항목
const getInitialSelection = (payment) => {
  if (payment.result === 'PAID_UNREGISTERED') return UNREGISTERED;
  if (payment.result === 'NOT_PAID') return NOT_PAID;
  if (payment.userCardId != null) return payment.userCardId;
  if (
    payment.chosenCardId != null &&
    payment.cardOptions.some((card) => card.id === payment.chosenCardId)
  ) {
    return payment.chosenCardId;
  }
  if (payment.recommendedCard && !payment.recommendedCard.deleted) {
    return payment.recommendedCard.id;
  }
  return null;
};

// 카드별 안내 문구 (추천 당시 스냅샷의 예상 혜택)
const getBenefitNote = (expectedBenefit, category) => {
  if (expectedBenefit === null) return { label: '추천 당시 비교 안 함' };
  if (expectedBenefit === 0)
    return { label: `${category} 혜택 없음`, discount: 0 };
  return { label: '이 카드 기준 예상 혜택', discount: expectedBenefit };
};

function StatusScreen({ message, actionLabel, onAction }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center gap-[12px] bg-[#F1F1F1] px-[18px] text-center font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
      <p>{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
        >
          {actionLabel}
        </button>
      )}
    </main>
  );
}

// HOME-15. 홈의 결제 확인 카드에서 실제로 결제한 카드를 고릅니다.
export default function PendingCardSelectPage() {
  const navigate = useNavigate();
  const { recommendationId } = useParams();
  const {
    data: payment,
    isPending,
    isError,
    error,
    refetch,
  } = usePaymentOptions(recommendationId);
  const { data: ownedCards = [] } = useOwnedCards();
  // 사용자가 직접 고른 항목 (고르기 전에는 지금 기록 기준으로 선택해 둡니다)
  const [pickedId, setPickedId] = useState();
  const { mutate: savePayment, isPending: isSaving } = useSavePaymentResult();
  // 저장 실패 안내 { title, description }
  const [saveError, setSaveError] = useState(null);
  const closeSaveError = useCallback(() => setSaveError(null), []);

  if (isPending)
    return <StatusScreen message="결제 기록을 불러오는 중이에요" />;

  if (isError) {
    if (isRecommendationNotFoundError(error)) {
      return (
        <StatusScreen
          message="결제 기록을 찾을 수 없어요"
          actionLabel="홈으로 돌아가기"
          onAction={() => navigate('/', { replace: true })}
        />
      );
    }
    if (isPaymentNotRequestedError(error)) {
      return (
        <StatusScreen
          message="결제 확인을 기다리는 기록이 아니에요"
          actionLabel="홈으로 돌아가기"
          onAction={() => navigate('/', { replace: true })}
        />
      );
    }
    return (
      <StatusScreen
        message="결제 기록을 불러오지 못했어요"
        actionLabel="다시 시도"
        onAction={() => refetch()}
      />
    );
  }

  const cardImages = new Map(ownedCards.map((card) => [card.id, card]));
  const { category } = payment;
  const recommendedCard =
    payment.recommendedCard && withImage(payment.recommendedCard, cardImages);
  const cardOptions = payment.cardOptions.map((card) =>
    withImage(card, cardImages),
  );
  const selectedId =
    pickedId === undefined ? getInitialSelection(payment) : pickedId;

  // 선택 → 5-2 요청 본문
  const toRequest = (id) => {
    if (id === UNREGISTERED)
      return { result: PAYMENT_RESULT.PAID_UNREGISTERED };
    if (id === NOT_PAID) return { result: PAYMENT_RESULT.NOT_PAID };
    if (id === recommendedCard?.id) {
      return { result: PAYMENT_RESULT.PAID_RECOMMENDED };
    }
    return { result: PAYMENT_RESULT.PAID_OTHER, userCardId: id };
  };

  const handleSubmit = () => {
    savePayment(
      { recommendationId: payment.id, ...toRequest(selectedId) },
      {
        // 저장 결과 안내는 홈에서 토스트로 보여 줍니다.
        onSuccess: (response) => {
          const message = getPaymentResultMessage(response, payment.place);
          navigate('/', {
            replace: true,
            state: {
              paymentToast: {
                category,
                title: message.title,
                description: message.description,
                variant: message.isNotPaid ? 'notPaid' : 'success',
              },
            },
          });
        },
        onError: (error) => {
          setSaveError(getPaymentErrorMessage(error));
          // 삭제된 카드를 골랐으면 선택지를 다시 받아 고르게 합니다.
          if (error?.response?.data?.code === 'OWNED_CARD_NOT_FOUND') {
            setPickedId(undefined);
            refetch();
          }
        },
      },
    );
  };

  return (
    // 헤더는 고정하고 그 아래 영역만 스크롤합니다.
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <PageHeader
        title="결제 카드 변경"
        onBack={() => navigate(-1)}
        onClose={() => navigate('/')}
      />

      <main className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-full max-w-[402px] flex-col px-4 pb-[calc(66px+max(44px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
          <div className="mt-[28px] flex flex-col gap-[8px]">
            <h2 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
              어떤 카드로 결제했나요?
            </h2>
            <p className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#4B4B4B]">
              {payment.place} · {formatWon(payment.amount)}
              <br />
              실제로 쓴 카드 기준으로 한도와 챙긴 혜택을 다시 계산해요.
            </p>
          </div>

          <ul className="mt-[32px] flex w-full flex-col gap-[34px]">
            {recommendedCard && (
              <CardOption
                card={recommendedCard}
                // 삭제된 추천 카드는 새로 고를 수 없습니다. 이미 저장된 답이면 선택 상태로 보여 줍니다.
                note={
                  recommendedCard.deleted
                    ? { label: '삭제된 카드', isWarning: true }
                    : {
                        label: '카똑 추천 카드',
                        discount: recommendedCard.expectedBenefit,
                      }
                }
                disabled={recommendedCard.deleted}
                isSelected={selectedId === recommendedCard.id}
                onSelect={() => setPickedId(recommendedCard.id)}
              />
            )}
            {cardOptions.map((card) => (
              <CardOption
                key={card.id}
                card={card}
                note={getBenefitNote(card.expectedBenefit, category)}
                isSelected={selectedId === card.id}
                onSelect={() => setPickedId(card.id)}
              />
            ))}
            <CardOption
              card={{ id: UNREGISTERED, name: '카똑에 없는 카드' }}
              note={{ label: '등록하지 않은 카드' }}
              isSelected={selectedId === UNREGISTERED}
              onSelect={() => setPickedId(UNREGISTERED)}
            />
            <li className="flex items-center">
              <label className="flex w-full cursor-pointer items-center justify-between gap-[12px]">
                <span className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
                  결제하지 않았어요
                </span>
                <input
                  type="radio"
                  name="payment-card"
                  value={NOT_PAID}
                  checked={selectedId === NOT_PAID}
                  onChange={() => setPickedId(NOT_PAID)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex size-[24px] shrink-0 items-center justify-center rounded-full border-[2px] peer-focus-visible:outline-2 peer-focus-visible:outline-[#8C9EFF] ${
                    selectedId === NOT_PAID
                      ? 'border-[#8C9EFF]'
                      : 'border-[#CACACA]'
                  }`}
                >
                  {selectedId === NOT_PAID && (
                    <span className="size-[14px] rounded-full bg-[#8C9EFF]" />
                  )}
                </span>
              </label>
            </li>
          </ul>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[402px] bg-[#F1F1F1] px-4 pt-3 pb-[max(44px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedId == null || isSaving}
          className="flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:opacity-50"
        >
          카드 선택
        </button>
      </div>

      {saveError && (
        <Toast
          icon={
            <span className="flex size-[24px] items-center justify-center rounded-full bg-[#E46A5E]">
              <X className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
            </span>
          }
          title={<span className="text-[#EE695D]">{saveError.title}</span>}
          description={saveError.description}
          hasArrow={false}
          onClick={closeSaveError}
          onClose={closeSaveError}
        />
      )}
    </div>
  );
}

import { useCallback, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Toast from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import useConfirmOnLeave, {
  hasRecommendedCard,
} from '@/hooks/useConfirmOnLeave';
import useConfirmRecommendation, {
  isNoRecommendedCardError,
  isRecommendationNotFoundError,
} from '@/hooks/useConfirmRecommendation';
import useOwnedCards from '@/hooks/useOwnedCards';
import useOwnedCardState from '@/hooks/useOwnedCardState';
import useSavePaymentResult, {
  PAYMENT_RESULT,
} from '@/hooks/useSavePaymentResult';
import useRecommendation, {
  getRecommendationErrorMessage,
  useCreateRecommendation,
} from '@/hooks/useRecommendation';
import useUpdateOwnedCardState from '@/hooks/useUpdateOwnedCardState';
import { toOwnedCardStateRequest } from '@/pages/Card/ownedCardMapper';
import { cn } from '@/utils/cn';
import {
  getPaymentErrorMessage,
  getPaymentResultMessage,
} from '@/utils/paymentResultMessage';
import CardUsageAmountScreen from './CardUsageAmountScreen';
import CardUsageSheet from './CardUsageSheet';
import PaymentDetailSkeleton from './PaymentDetailSkeleton';
import RecommendationStatusScreen from './RecommendationStatusScreen';
import { formatWon } from './paymentDetailData';
import {
  toRecommendationRequest,
  toRecommendationView,
  UNREGISTERED_CARD_ID,
} from './recommendationMapper';

// 결제 카드 변경에서 고른 '미등록 카드' (혜택을 계산할 수 없는 카드)
const UNREGISTERED_CARD = {
  id: UNREGISTERED_CARD_ID,
  name: '미등록 카드',
  isHorizontal: true,
  isUnregistered: true,
};

const TEXT_14 = "font-['Pretendard'] text-[14px] leading-[140%] font-[400]";
const TEXT_16 = "font-['Pretendard'] text-[16px] leading-[140%] font-[500]";

const formatCount = (value) => `${value.toLocaleString('ko-KR')}회`;

// 카드 이미지. 보유 카드 목록에서 이미지를 못 찾으면 회색 카드로 보여 줍니다.
function CardImage({ card, width, height, vertical = false }) {
  // vertical: 세로 자리에 보여 줄지 (다른 카드 목록), 아니면 가로 자리 (상단 큰 카드)
  const needsRotate = vertical ? card.isHorizontal : !card.isHorizontal;
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-[8px] bg-[#CACACA]"
      style={{ width, height }}
    >
      {card.image && (
        <img
          src={card.image}
          alt={card.name}
          className={cn(
            'absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover',
            needsRotate && (vertical ? 'rotate-90' : '-rotate-90'),
          )}
          style={
            needsRotate ? { width: height, height: width } : { width, height }
          }
        />
      )}
      {/* 이미지가 없는 카드(미등록 카드 등)는 마그네틱 띠가 있는 회색 카드로 보여 줍니다. */}
      {!card.image && (
        <span
          className={cn(
            'absolute bg-[#D9D9D9]',
            vertical
              ? 'inset-y-0 right-[14%] w-[13%]'
              : 'inset-x-0 top-[14%] h-[13%]',
          )}
        />
      )}
    </span>
  );
}

// 미등록 카드를 고르면 혜택을 계산할 수 없다고 안내합니다. (홈 43)
function UnregisteredCalculation() {
  return (
    <section className="flex w-full flex-col gap-[12px]">
      <h2 className={cn('text-[#6E6E6E]', TEXT_16)}>이렇게 계산했어요</h2>
      <div className="flex w-full flex-col items-center gap-[12px] rounded-[8px] bg-[#FAFAFA] px-[24px] py-[20px] text-center shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-m:px-4">
        <p className={cn('break-keep text-[#8E8E8E]', TEXT_16, 'font-[400]')}>
          미등록 카드를 선택하면
          <br />
          카드 혜택을 확인할 수 없어요.
        </p>
        <p className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#B3B3B3]">
          *결제 금액과 일시는 결제 기록에서 확인할 수 있어요.
        </p>
      </div>
    </section>
  );
}

function CardSubtitle({ card }) {
  return (
    <div className="flex max-w-full items-center gap-[6px]">
      <span className={cn('truncate text-[#8E8E8E]', TEXT_14)}>
        {card.name}
      </span>
      {card.isConditional && (
        <span
          className={cn(
            'shrink-0 rounded-[8px] bg-[#DBE1FF] px-[4px] py-[1px] text-[#8C9EFF]',
            TEXT_14,
          )}
        >
          조건부
        </span>
      )}
    </div>
  );
}

// 혜택 한 건의 계산식 (비율: 기준 금액 × 비율, 정액: 정액 금액)
function RuleFormula({ rule }) {
  const { baseAmount, rate, fixedAmount, capApplied } = rule.calculation ?? {};
  // 계산식이 없는 과거 결과(PR #30 이전)는 금액만 보여 줍니다.
  const formula =
    rate != null
      ? `${formatWon(baseAmount ?? 0)} × ${rate}% = `
      : fixedAmount != null
        ? `정액 ${formatWon(fixedAmount)} = `
        : '';

  return (
    <div className="flex flex-col gap-[2px]">
      <span className={cn('text-[#8E8E8E]', TEXT_14)}>{rule.description}</span>
      <p className={cn('text-[#8C9EFF]', TEXT_16)}>
        {formula}
        {formatWon(rule.benefitAmount)}
        {capApplied && (
          <span className={cn('ml-[4px] text-[#8E8E8E]', TEXT_14)}>
            (한도까지만 적용)
          </span>
        )}
      </p>
    </div>
  );
}

// 대표 한도의 결제 후 예상 잔여
function RepresentativeCap({ cap }) {
  const isAmount = cap.capAmount != null;
  const remaining = isAmount ? cap.remainingLimitAmount : cap.remainingCount;
  const total = isAmount ? cap.capAmount : cap.capCount;
  const format = isAmount ? formatWon : formatCount;
  if (remaining == null) return null;

  return (
    <div className="flex flex-col gap-[4px]">
      <span className={cn('break-keep text-[#4B4B4B]', TEXT_16)}>
        결제 후 남은 {isAmount ? '한도' : '횟수'} {format(remaining)}
      </span>
      <p className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
        {cap.description}
        {total != null && ` · 전체 ${format(total)}`}
      </p>
    </div>
  );
}

function CalculationSection({ card, recommendation, onUpdateInfo }) {
  const isRecommended = card.id === recommendation.recommendedCardId;
  const findName = (id) =>
    recommendation.cards.find((item) => item.id === id)?.name;
  const tiedNames = isRecommended
    ? recommendation.tiedCardIds.map(findName).filter(Boolean)
    : [];
  const confirmedOnlyTopName =
    isRecommended && recommendation.confirmedOnlyTopCardId != null
      ? findName(recommendation.confirmedOnlyTopCardId)
      : null;

  return (
    <section className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h2 className={cn('text-[#6E6E6E]', TEXT_16)}>이렇게 계산했어요</h2>
        {card.assumptions.length > 0 && (
          <button
            type="button"
            onClick={onUpdateInfo}
            className={cn('text-[#8E8E8E]', TEXT_14)}
          >
            더보기
          </button>
        )}
      </div>
      <div className="flex w-full flex-col gap-3 rounded-[8px] bg-[#FAFAFA] px-[24px] py-[16px] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-m:px-4">
        {card.appliedRules.length > 0 ? (
          card.appliedRules.map((rule) => (
            <RuleFormula key={rule.ruleId} rule={rule} />
          ))
        ) : (
          <p className={cn('break-keep text-[#4B4B4B]', TEXT_16)}>
            {card.noBenefitReason ?? '이 카드로는 받을 수 있는 혜택이 없어요'}
          </p>
        )}

        {/* 계산에 쓴 가정 (실적·남은 한도·횟수) */}
        {card.assumptions.map((assumption) => (
          <div
            key={`${assumption.type}-${assumption.capGroupId}`}
            className="flex items-start gap-[8px]"
          >
            <span className="mt-[2px] flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[#F8C5C0] text-[13px] leading-none font-bold text-[#FAFAFA]">
              !
            </span>
            <span className={cn('break-keep text-[#4B4B4B]', TEXT_16)}>
              {assumption.message}
            </span>
          </div>
        ))}

        {card.representativeCap && (
          <RepresentativeCap cap={card.representativeCap} />
        )}

        {tiedNames.length > 0 && (
          <p className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
            {tiedNames.join(', ')}와 혜택이 같아요
          </p>
        )}
        {confirmedOnlyTopName && (
          <p className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
            확인된 정보로는 {confirmedOnlyTopName} 카드가 가장 유리해요
          </p>
        )}
      </div>
    </section>
  );
}

// 다른 카드 비교 한 줄. 조건부 카드는 비교 막대를 흐리게 보여 줍니다.
function OtherCardItem({ card, maxDiscount, onClick }) {
  const ratio = maxDiscount > 0 ? (card.discount / maxDiscount) * 100 : 0;
  const label =
    card.status === 'NO_BENEFIT'
      ? (card.noBenefitReason ?? '혜택 없음')
      : card.isConditional
        ? '카드 정보 미확인'
        : '남은 한도 기준 적용';

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-[10px] text-left"
      >
        <CardImage card={card} width={48} height={76} vertical />
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <div className="flex items-start justify-between gap-[10px]">
            <div className="flex min-w-0 flex-col items-start">
              <span className="w-full truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
                {card.name}
              </span>
              <span
                className={cn(
                  'break-keep',
                  TEXT_14,
                  card.isConditional ? 'text-[#EE695D]' : 'text-[#8E8E8E]',
                )}
              >
                {label}
              </span>
            </div>
            <span className="shrink-0 font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#121212]">
              {formatWon(card.discount)}
            </span>
          </div>
          <div
            className={cn(
              'h-[8px] w-full overflow-hidden rounded-[12px] shadow-[0_0_4px_0_rgba(0,0,0,0.08)]',
              // 할인 금액이 0원이면 게이지 전체를 연한 파란색으로 표시합니다.
              card.discount === 0 ? 'bg-[#DBE1FF]' : 'bg-[#EBEBEB]',
            )}
          >
            <div
              className={cn(
                'h-full rounded-[12px] bg-[#8C9EFF]',
                card.isConditional && 'opacity-50',
              )}
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      </button>
    </li>
  );
}

// 비교에서 뺀 카드 (0원으로 취급하지 않고 사유만 보여 줍니다)
function ExcludedCards({ cards }) {
  if (cards.length === 0) return null;
  return (
    <section className="flex w-full flex-col gap-[16px]">
      <h2 className={cn('text-[#6E6E6E]', TEXT_16)}>비교에서 빠진 카드</h2>
      <ul className="flex w-full flex-col gap-[16px]">
        {cards.map((card) => (
          <li key={card.id} className="flex items-center gap-[10px] opacity-60">
            <CardImage card={card} width={48} height={76} vertical />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
                {card.name}
              </span>
              <span className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
                {card.reason}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const DISCLAIMER =
  '카똑이 계산하는 혜택 기준이에요. 통신요금 할인처럼 추천 미반영 혜택은 포함하지 않았고, 실제 지급액은 카드사 기준에 따라 달라질 수 있어요.';

function CategoryBasisNote({ recommendation }) {
  if (recommendation.basis !== 'CATEGORY') return null;
  return (
    <p className={cn('text-center break-keep text-[#8E8E8E]', TEXT_14)}>
      {recommendation.category} 업종 기준이에요 · 매장 전용 혜택은 빼고
      계산했어요
    </p>
  );
}

// 혜택 없음(HOME-14)·계산 불가 화면
function NoRecommendationView({ recommendation }) {
  const isNoBenefit = recommendation.overallStatus === 'NO_BENEFIT';
  return (
    <div className="mx-auto flex w-full max-w-[402px] flex-col gap-[24px] px-[18px] pt-[32px] pb-[calc(104px+max(20px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
      <div className="flex flex-col gap-[8px]">
        <h2 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
          {isNoBenefit ? '어떤 카드로 결제해도 같아요' : '계산하지 못했어요'}
        </h2>
        <p className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
          {isNoBenefit
            ? `${recommendation.place} ${formatWon(recommendation.amount)} 결제에는 내 카드 모두 받을 수 있는 혜택이 없어요.`
            : '비교할 수 있는 카드가 없어요. 아래 사유를 확인해 주세요.'}
        </p>
        <CategoryBasisNote recommendation={recommendation} />
      </div>
      {recommendation.cards.length > 0 && (
        <ul className="flex w-full flex-col gap-[16px]">
          {recommendation.cards.map((card) => (
            <li key={card.id} className="flex items-center gap-[10px]">
              <CardImage card={card} width={48} height={76} vertical />
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
                  {card.name}
                </span>
                <span className={cn('break-keep text-[#8E8E8E]', TEXT_14)}>
                  {card.noBenefitReason ?? '혜택 없음'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ExcludedCards cards={recommendation.excludedCards} />
      <p className="font-['Pretendard'] text-[12px] leading-[120%] font-[400] break-keep text-[#969DA6]">
        {DISCLAIMER}
      </p>
    </div>
  );
}

const ERROR_ICON = (
  <span className="flex size-[24px] items-center justify-center rounded-full bg-[#E46A5E]">
    <X className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
  </span>
);

// HOME-02(확정)·HOME-02B(조건부)·HOME-14(혜택 없음) 추천 결과
export default function PaymentDetailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { paymentId } = useParams();
  const {
    data: rawRecommendation,
    isPending: isRecommendationPending,
    isError: isRecommendationError,
    error: recommendationError,
    refetch: refetchRecommendation,
  } = useRecommendation(paymentId);
  // 카드 이미지는 보유 카드 목록에서 찾습니다. (실패해도 결과는 보여 줍니다)
  const { data: ownedCards } = useOwnedCards();
  const recommendation = toRecommendationView(rawRecommendation, ownedCards);

  // 결제 카드 변경 화면에서 고른 카드가 있으면 그 카드를 먼저 보여 줍니다.
  const [selectedCardId, setSelectedCardId] = useState(
    state?.selectedCardId ?? null,
  );
  // 카드 사용 현황 입력: null(닫힘) | 'sheet'(선택지 바텀시트) | 'amount'(금액 직접 입력)
  const [usageInput, setUsageInput] = useState(null);
  // 사용 현황을 물어볼 카드 id
  const [usageCardId, setUsageCardId] = useState(null);
  // 카드별로 직접 입력한 사용 금액 (카드 id → { 질문 name → 금액 })
  const [usageAmounts, setUsageAmounts] = useState({});
  // 실패 안내 { title, description }
  const [errorToast, setErrorToast] = useState(null);
  const closeErrorToast = useCallback(() => setErrorToast(null), []);

  const { mutate: confirmPayment, isPending: isConfirming } =
    useConfirmRecommendation();
  const { mutate: recommend, isPending: isRecommending } =
    useCreateRecommendation();
  // 미등록 카드로 바로 결제하면 대기 기록을 만든 뒤 바로 PAID_UNREGISTERED로 확정합니다.
  const { mutate: savePayment, isPending: isSavingPayment } =
    useSavePaymentResult();
  const { mutate: saveCardState, isPending: isSavingState } =
    useUpdateOwnedCardState();
  // 사용 현황 시트를 열 때 저장된 실적·남은 한도(3-3)를 받아 질문과 선택값을 채웁니다.
  const { data: cardState, isLoading: isStateLoading } = useOwnedCardState(
    usageCardId,
    { enabled: usageInput !== null && usageCardId != null },
  );
  // 사용 현황을 저장하고 다시 추천받는 동안 스켈레톤을 보여 줍니다.
  const isRecalculating = isSavingState || isRecommending;
  // [X]·뒤로 가기 등으로 화면을 벗어나면 홈의 결제 확인 카드로 결제 여부를 묻습니다.
  const skipConfirmOnLeave = useConfirmOnLeave(
    recommendation?.id,
    hasRecommendedCard(recommendation),
  );

  if (!recommendation) {
    return (
      <RecommendationStatusScreen
        isPending={isRecommendationPending && !isRecommendationError}
        error={recommendationError}
        onRetry={() => refetchRecommendation()}
      />
    );
  }

  const { cards, recommendedCardId } = recommendation;
  const hasRecommendation = hasRecommendedCard(recommendation);
  const isUnregistered = selectedCardId === UNREGISTERED_CARD_ID;
  const selectedCard = isUnregistered
    ? UNREGISTERED_CARD
    : (cards.find((card) => card.id === selectedCardId) ??
      cards.find((card) => card.id === recommendedCardId) ??
      cards[0]);
  const otherCards = cards.filter((card) => card.id !== selectedCard?.id);
  const maxDiscount = Math.max(0, ...cards.map((card) => card.discount));
  const isRecommendedSelected = selectedCard?.id === recommendedCardId;
  const usageBaseCard = cards.find((card) => card.id === usageCardId);
  const usageCard =
    usageBaseCard && cardState
      ? {
          ...usageBaseCard,
          performanceOptions: cardState.performanceOptions,
          usageCaps: cardState.usageCaps,
          usageCapsByAnswer: cardState.usageCapsByAnswer,
          tierOptions: cardState.tierOptions,
          initialAnswers: cardState.initialAnswers,
        }
      : null;

  const openUsageSheet = (cardId) => {
    setUsageCardId(cardId);
    setUsageInput('sheet');
  };

  // 사용 현황 저장(3-4) → 같은 결제처·금액으로 다시 추천(4-5) → 새 결과로 바꿉니다.
  const handleSaveUsage = (input) => {
    const card = usageBaseCard;
    if (!cardState || !card) {
      setErrorToast({
        title: '저장하지 못했어요',
        description: '잠시 후 다시 시도해 주세요',
      });
      return;
    }
    const body = toOwnedCardStateRequest(cardState, input, {
      isAmountInput: Boolean(usageAmounts[card.id]),
    });
    if (!body) return; // 바뀐 내용이 없습니다.

    saveCardState(
      { id: card.id, body },
      {
        onSuccess: () => {
          setUsageAmounts((prev) => {
            const next = { ...prev };
            delete next[card.id];
            return next;
          });
          recommend(toRecommendationRequest(recommendation), {
            onSuccess: (data) =>
              navigate(`/payment/${data.id}`, {
                replace: true,
                state: { selectedCardId: card.id },
              }),
            onError: (error) =>
              setErrorToast(getRecommendationErrorMessage(error)),
          });
        },
        onError: () =>
          setErrorToast({
            title: '저장하지 못했어요',
            description: '잠시 후 다시 시도해 주세요',
          }),
      },
    );
  };

  // [바로 결제] → 대기 기록 생성(4-7) → 고른 카드로 결제 확정(5-2) → 홈 토스트
  // 결제 확인 카드는 띄우지 않습니다. (X·화면 이탈 시에만 결제 확인 카드로 묻습니다)
  const recordPayment = () => {
    const result = isUnregistered
      ? PAYMENT_RESULT.PAID_UNREGISTERED
      : isRecommendedSelected
        ? PAYMENT_RESULT.PAID_RECOMMENDED
        : PAYMENT_RESULT.PAID_OTHER;
    savePayment(
      {
        recommendationId: recommendation.id,
        result,
        userCardId: selectedCard?.id,
      },
      {
        onSuccess: (response) => {
          const message = isUnregistered
            ? {
                title: '기록했어요',
                description: '미등록 카드로 혜택 정보가 확인되지 않았어요.',
              }
            : getPaymentResultMessage(response, recommendation.place);
          skipConfirmOnLeave();
          navigate('/', {
            replace: true,
            state: {
              paymentToast: {
                category: recommendation.category,
                title: message.title,
                description: message.description,
                variant: 'success',
              },
            },
          });
        },
        onError: (error) => setErrorToast(getPaymentErrorMessage(error)),
      },
    );
  };

  const handleConfirm = () =>
    confirmPayment(recommendation.id, {
      onSuccess: recordPayment,
      onError: (error) =>
        setErrorToast(
          isNoRecommendedCardError(error)
            ? {
                title: '기록할 추천 카드가 없어요',
                description: '혜택이 계산된 카드가 없어 기록하지 않았어요',
              }
            : isRecommendationNotFoundError(error)
              ? {
                  title: '추천 정보를 찾을 수 없어요',
                  description: '처음부터 다시 추천받아 주세요',
                }
              : {
                  title: '기록하지 못했어요',
                  description: '잠시 후 다시 시도해 주세요',
                },
        ),
    });

  return (
    // 헤더는 고정하고 그 아래 영역만 스크롤합니다.
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <PageHeader
        title={recommendation.place}
        subtitle={
          hasRecommendation && selectedCard ? (
            <CardSubtitle card={selectedCard} />
          ) : undefined
        }
        onBack={() => navigate(-1)}
        onClose={() => navigate('/')}
      />

      <main className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {isRecalculating ? (
          <PaymentDetailSkeleton otherCardsTitle="다른 카드 선택" />
        ) : !hasRecommendation || !selectedCard ? (
          <NoRecommendationView recommendation={recommendation} />
        ) : (
          <div className="mx-auto flex w-full max-w-[402px] flex-col items-center gap-[24px] px-[18px] pt-[24px] pb-[calc(104px+max(20px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
            <div className="mb-[12px] flex flex-col items-center gap-[20px]">
              <CardImage card={selectedCard} width={280} height={176} />
              <div className="flex flex-col items-center gap-[8px]">
                <p className="flex items-baseline gap-[6px]">
                  <span className="font-['Pretendard'] text-[36px] leading-[100%] font-[600] tracking-[-0.09px] text-[#121212]">
                    {/* 미등록 카드는 혜택을 알 수 없어 ?원으로 보여 줍니다. */}
                    {isUnregistered ? '?원' : formatWon(selectedCard.discount)}
                  </span>
                  <span className="font-['Pretendard'] text-[20px] leading-[120%] font-[400] text-[#8E8E8E]">
                    할인
                  </span>
                </p>
                {isRecommendedSelected &&
                  recommendation.differenceFromSecond > 0 && (
                    <span
                      className={cn(
                        'rounded-[27px] bg-[#DBE1FF] px-[8px] py-[2px] text-[#8C9EFF]',
                        TEXT_14,
                      )}
                    >
                      다음 카드보다{' '}
                      {formatWon(recommendation.differenceFromSecond)} 더 받아요
                    </span>
                  )}
                <CategoryBasisNote recommendation={recommendation} />
              </div>
            </div>

            {isUnregistered ? (
              <UnregisteredCalculation />
            ) : (
              <CalculationSection
                key={selectedCard.id}
                card={selectedCard}
                recommendation={recommendation}
                onUpdateInfo={() => openUsageSheet(selectedCard.id)}
              />
            )}

            {/* 순위를 바꿀 수 있는 가정만 최대 2개 질문합니다. */}
            {!isUnregistered && recommendation.questions.length > 0 && (
              <section className="flex w-full flex-col gap-[12px]">
                <h2 className={cn('text-[#6E6E6E]', TEXT_16)}>
                  알려주시면 더 정확해져요
                </h2>
                <ul className="flex w-full flex-col gap-[8px]">
                  {recommendation.questions.map((question) => (
                    <li
                      key={`${question.userCardId}-${question.type}-${question.capGroupId}`}
                      className="flex items-center justify-between gap-[12px] rounded-[8px] bg-[#FAFAFA] px-[16px] py-[12px]"
                    >
                      <span
                        className={cn('break-keep text-[#4B4B4B]', TEXT_14)}
                      >
                        {question.message}
                      </span>
                      <button
                        type="button"
                        onClick={() => openUsageSheet(question.userCardId)}
                        className={cn(
                          'shrink-0 rounded-[27px] bg-[#A3B1FF] px-[12px] py-[4px] text-[#3B426B]',
                          TEXT_14,
                        )}
                      >
                        알려주기
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="flex w-full flex-col gap-[16px]">
              <h2 className={cn('text-[#6E6E6E]', TEXT_16)}>다른 카드 선택</h2>
              <ul className="flex w-full flex-col gap-[20px]">
                {otherCards.map((card) => (
                  <OtherCardItem
                    key={card.id}
                    card={card}
                    maxDiscount={maxDiscount}
                    onClick={() => setSelectedCardId(card.id)}
                  />
                ))}
              </ul>
              {otherCards.length === 0 && (
                <p className={cn('text-[#8E8E8E]', TEXT_14)}>
                  비교할 다른 카드가 없어요
                </p>
              )}
            </section>

            <ExcludedCards cards={recommendation.excludedCards} />

            <p className="w-full font-['Pretendard'] text-[12px] leading-[120%] font-[400] break-keep text-[#969DA6]">
              {DISCLAIMER}
            </p>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] gap-3 bg-[#F1F1F1] px-[18px] pt-3 pb-[max(20px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        {hasRecommendation ? (
          <>
            <button
              type="button"
              disabled={isRecalculating}
              onClick={() =>
                navigate(`/payment/${recommendation.id}/card`, {
                  replace: true,
                  state: { selectedCardId: selectedCard?.id },
                })
              }
              className="flex h-[54px] flex-1 items-center justify-center rounded-[27px] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
            >
              다시 고르기
            </button>
            <button
              type="button"
              disabled={isRecalculating || isConfirming || isSavingPayment}
              onClick={handleConfirm}
              className="flex h-[54px] flex-1 items-center justify-center rounded-[8px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:opacity-60"
            >
              바로 결제
            </button>
          </>
        ) : (
          // 혜택 없음·계산 불가는 대기 기록을 만들지 않습니다(4-7 409).
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="flex h-[54px] flex-1 items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
          >
            확인
          </button>
        )}
      </div>

      {errorToast && (
        <Toast
          icon={ERROR_ICON}
          title={<span className="text-[#EE695D]">{errorToast.title}</span>}
          description={errorToast.description}
          hasArrow={false}
          onClick={closeErrorToast}
          onClose={closeErrorToast}
        />
      )}

      {usageInput === 'sheet' && !isStateLoading && usageCard && (
        <CardUsageSheet
          card={usageCard}
          onClose={() => setUsageInput(null)}
          onDirectInput={() => setUsageInput('amount')}
          amounts={usageAmounts[usageCard.id]}
          onSubmit={handleSaveUsage}
        />
      )}
      {usageInput === 'sheet' && !isStateLoading && !usageCard && (
        // 상태 조회에 실패하면 시트를 열 수 없으므로 안내만 합니다.
        <Toast
          icon={ERROR_ICON}
          title={
            <span className="text-[#EE695D]">
              카드 정보를 불러오지 못했어요
            </span>
          }
          description="잠시 후 다시 시도해 주세요"
          hasArrow={false}
          onClick={() => setUsageInput(null)}
          onClose={() => setUsageInput(null)}
        />
      )}
      {usageInput === 'amount' && usageCard && (
        <CardUsageAmountScreen
          card={usageCard}
          initialAmounts={
            usageAmounts[usageCard.id] ?? cardState?.initialAmounts
          }
          onBack={() => setUsageInput('sheet')}
          // 입력을 마치면 바텀시트로 돌아가 입력한 금액을 텍스트 필드로 보여 줍니다.
          onSubmit={(amounts) => {
            setUsageAmounts((prev) => ({ ...prev, [usageCard.id]: amounts }));
            setUsageInput('sheet');
          }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import useOwnedCards from '@/hooks/useOwnedCards';
import useRecommendation from '@/hooks/useRecommendation';
import { cn } from '@/utils/cn';
import { formatWon } from './paymentDetailData';
import RecommendationStatusScreen from './RecommendationStatusScreen';
import {
  toRecommendationView,
  UNREGISTERED_CARD_ID,
} from './recommendationMapper';

// 카드 목록 썸네일 (세로형 카드 이미지는 가로로 돌려서 보여줍니다)
function CardThumbnail({ card }) {
  if (!card.image) {
    return (
      <span className="flex h-[64px] w-[102px] shrink-0 flex-col overflow-hidden rounded-[8px] bg-[#CACACA]">
        <span className="mt-[13px] h-[10px] w-full bg-[#D9D9D9]" />
      </span>
    );
  }

  return (
    <span className="relative h-[64px] w-[102px] shrink-0 overflow-hidden rounded-[8px]">
      <img
        src={card.image}
        alt={card.name}
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover',
          card.isHorizontal
            ? 'h-[64px] w-[102px]'
            : 'h-[102px] w-[64px] -rotate-90',
        )}
      />
    </span>
  );
}

function getCardNote(card) {
  if (card.id === UNREGISTERED_CARD_ID) {
    return { label: '등록하지 않은 카드' };
  }
  if (card.status === 'NO_BENEFIT') {
    return { label: card.noBenefitReason ?? '혜택 없음', discount: 0 };
  }
  if (card.isConditional) {
    return {
      label: '카드 정보 미확인',
      isWarning: true,
      discount: card.discount,
    };
  }
  return { label: '잔여 한도 기준 적용', discount: card.discount };
}

// 카드 선택지 한 줄. note: { label, isWarning?, discount? } (discount가 null이면 '계산 안 됨')
export function CardOption({ card, note, isSelected, onSelect, disabled }) {
  return (
    <li>
      <label
        className={cn(
          'flex w-full items-center gap-[12px]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <CardThumbnail card={card} />
        <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
            {card.name}
          </span>
          <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
            <span className={cn(note.isWarning && 'text-[#EE695D]')}>
              {note.label}
            </span>
            {note.discount !== undefined &&
              ` · ${note.discount === null ? '계산 안 됨' : formatWon(note.discount)}`}
          </span>
        </span>
        <input
          type="radio"
          name="payment-card"
          value={card.id}
          checked={isSelected}
          onChange={onSelect}
          disabled={disabled}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex size-[24px] shrink-0 items-center justify-center rounded-full border-[2px] peer-focus-visible:outline-2 peer-focus-visible:outline-[#8C9EFF]',
            isSelected ? 'border-[#8C9EFF]' : 'border-[#CACACA]',
          )}
        >
          {isSelected && (
            <span className="size-[14px] rounded-full bg-[#8C9EFF]" />
          )}
        </span>
      </label>
    </li>
  );
}

export default function CardChangePage() {
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
  const { data: ownedCards } = useOwnedCards();
  const payment = toRecommendationView(rawRecommendation, ownedCards);
  // 사용자가 고른 카드. 고르기 전에는 결과 화면에서 보던 카드 → 추천 카드 순으로 선택해 둡니다.
  const [pickedCardId, setSelectedCardId] = useState(
    state?.selectedCardId ?? null,
  );
  const selectedCardId = pickedCardId ?? payment?.recommendedCardId;

  if (!payment) {
    return (
      <RecommendationStatusScreen
        isPending={isRecommendationPending && !isRecommendationError}
        error={recommendationError}
        onRetry={() => refetchRecommendation()}
      />
    );
  }

  const recommendedCard = payment.cards.find(
    (card) => card.id === payment.recommendedCardId,
  );
  const options = [
    ...payment.cards,
    { id: UNREGISTERED_CARD_ID, name: '미등록 카드' },
  ];

  const goToDetail = (cardId) =>
    navigate(`/payment/${payment.id}`, {
      replace: true,
      state: { selectedCardId: cardId },
    });

  // 미등록 카드도 결과 화면(홈 43)으로 돌아가 혜택을 확인할 수 없다고 안내합니다.
  const handleSubmit = () => goToDetail(selectedCardId);

  return (
    // 헤더는 고정하고 그 아래 영역만 스크롤합니다.
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <PageHeader
        title="결제 카드 변경"
        onBack={() => goToDetail(state?.selectedCardId)}
        onClose={() => navigate('/')}
      />

      <main className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-full max-w-[402px] flex-col px-4 pb-[calc(66px+max(44px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
          <div className="mt-[28px] flex flex-col gap-[8px]">
            <h2 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
              어떤 카드로 결제할까요?
            </h2>
            <p className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#4B4B4B]">
              카똑은 해당 결제건에서 {recommendedCard?.name} 카드를 추천했어요.
              <br />
              실제로 쓴 카드 기준으로 한도와 챙긴 혜택을 다시 계산해요.
            </p>
          </div>

          <ul className="mt-[32px] flex w-full flex-col gap-[34px]">
            {options.map((card) => (
              <CardOption
                key={card.id}
                card={card}
                note={getCardNote(card)}
                isSelected={card.id === selectedCardId}
                onSelect={() => setSelectedCardId(card.id)}
              />
            ))}
          </ul>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[402px] bg-[#F1F1F1] px-4 pt-3 pb-[max(44px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCardId}
          className="flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:opacity-50"
        >
          카드 선택
        </button>
      </div>
    </div>
  );
}

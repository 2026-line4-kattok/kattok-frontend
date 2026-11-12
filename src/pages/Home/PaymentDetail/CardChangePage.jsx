import { ChevronLeft, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatWon, PAYMENT_DETAILS } from './paymentDetailData';

// 등록하지 않은 카드로 결제한 경우 선택하는 항목
const UNREGISTERED_CARD_ID = 'unregistered';

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
          card.isHorizontal ? 'h-[64px] w-[102px]' : 'h-[102px] w-[64px] -rotate-90',
        )}
      />
    </span>
  );
}

function getCardNote(card, category) {
  if (card.id === UNREGISTERED_CARD_ID) {
    return { label: '등록하지 않은 카드' };
  }
  if (card.isConditional) {
    return { label: '카드 정보 미확인', isWarning: true, discount: card.discount };
  }
  if (card.discount === 0) {
    return { label: `${category} 혜택 없음`, discount: card.discount };
  }
  return { label: '잔여 한도 기준 적용', discount: card.discount };
}

function CardOption({ card, category, isSelected, onSelect }) {
  const note = getCardNote(card, category);

  return (
    <li>
      <label className="flex w-full cursor-pointer items-center gap-[12px]">
        <CardThumbnail card={card} />
        <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
            {card.name}
          </span>
          <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
            <span className={cn(note.isWarning && 'text-[#EE695D]')}>
              {note.label}
            </span>
            {note.discount !== undefined && ` · ${formatWon(note.discount)}`}
          </span>
        </span>
        <input
          type="radio"
          name="payment-card"
          value={card.id}
          checked={isSelected}
          onChange={onSelect}
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
  const payment = PAYMENT_DETAILS[paymentId];
  const [selectedCardId, setSelectedCardId] = useState(
    state?.selectedCardId ?? payment?.recommendedCardId,
  );

  if (!payment) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center gap-4 bg-[#F1F1F1]">
        <p className="font-['Pretendard'] text-[16px] text-[#6E6E6E]">
          결제 기록을 찾을 수 없어요
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-['Pretendard'] text-[14px] text-[#8C9EFF] underline"
        >
          홈으로 돌아가기
        </button>
      </main>
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

  const handleSubmit = () => {
    if (selectedCardId === UNREGISTERED_CARD_ID) {
      // TODO: API 연동 시 미등록 카드로 결제했음을 서버에 기록합니다.
      navigate('/');
      return;
    }
    goToDetail(selectedCardId);
  };

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col px-4 pt-[71px] pb-[calc(66px+max(44px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
        <header className="flex h-[40px] w-full items-center justify-between">
          <button
            type="button"
            onClick={() => goToDetail(state?.selectedCardId)}
            aria-label="뒤로 가기"
            className="flex size-[40px] items-center justify-center text-[#CACACA]"
          >
            <ChevronLeft className="size-[40px]" strokeWidth={2.5} absoluteStrokeWidth />
          </button>
          <h1 className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            결제 카드 변경
          </h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="닫기"
            className="flex size-[40px] items-center justify-center text-[#CACACA]"
          >
            <X className="size-[40px]" strokeWidth={2.5} absoluteStrokeWidth />
          </button>
        </header>

        <div className="mt-[28px] flex flex-col gap-[8px]">
          <h2 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
            어떤 카드로 결제할까요?
          </h2>
          <p className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#4B4B4B]">
            카똑은 해당 결제건에서 {recommendedCard?.brandName ?? recommendedCard?.name}카드를 추천했어요.
            <br />
            실제로 쓴 카드 기준으로 한도와 챙긴 혜택을 다시 계산해요.
          </p>
        </div>

        <ul className="mt-[32px] flex w-full flex-col gap-[34px]">
          {options.map((card) => (
            <CardOption
              key={card.id}
              card={card}
              category={payment.category}
              isSelected={card.id === selectedCardId}
              onSelect={() => setSelectedCardId(card.id)}
            />
          ))}
        </ul>
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

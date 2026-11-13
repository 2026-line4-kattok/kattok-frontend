import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/utils/cn';
import CardUsageAmountScreen from './CardUsageAmountScreen';
import CardUsageSheet from './CardUsageSheet';
import PaymentDetailSkeleton from './PaymentDetailSkeleton';
import {
  applyCardUsage,
  formatWon,
  PAYMENT_DETAILS,
} from './paymentDetailData';

function CardSubtitle({ card }) {
  return (
    <div className="flex max-w-full items-center gap-[6px]">
      <span className="truncate font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
        {card.name}
      </span>
      {card.isConditional && (
        <span className="shrink-0 rounded-[8px] bg-[#DBE1FF] px-[4px] py-[1px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8C9EFF]">
          조건부
        </span>
      )}
    </div>
  );
}

function CalculationSection({ amount, card, recommendedCard, onMore }) {
  const { conditionNotice, remainingLimit } = card;
  const showsLimitNotice = !conditionNotice && remainingLimit !== undefined;
  const showsRecommendation = recommendedCard && recommendedCard.id !== card.id;

  return (
    <section className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
          이렇게 계산했어요
        </h2>
        {conditionNotice && (
          <button
            type="button"
            onClick={onMore}
            className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
          >
            더보기
          </button>
        )}
      </div>
      <div className="flex w-full flex-col gap-3 rounded-[8px] bg-[#FAFAFA] px-[24px] py-[16px] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-m:px-4">
        <p className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#8C9EFF]">
          {formatWon(amount)} × {card.rate}% = {formatWon(card.discount)}
        </p>
        {conditionNotice && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[8px]">
              {/* 사용 현황을 알려줘 다시 계산한 카드는 경고 아이콘 없이 보여줍니다 */}
              {!card.isVerified && (
                <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[#F8C5C0] text-[13px] leading-none font-bold text-[#FAFAFA]">
                  !
                </span>
              )}
              <span className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] break-keep text-[#4B4B4B]">
                {conditionNotice.title}
              </span>
            </div>
            {conditionNotice.description && (
              <p className="line-clamp-3 font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]">
                {conditionNotice.description}
              </p>
            )}
          </div>
        )}
        {showsLimitNotice && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] break-keep text-[#4B4B4B]">
              남은 한도 {formatWon(remainingLimit)}까지만 적용돼요
            </span>
            {showsRecommendation && (
              <p className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]">
                확인된 정보로는{' '}
                {recommendedCard.brandName ?? recommendedCard.name} 카드가 가장
                유리해요
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function OtherCardItem({ card, maxDiscount, onClick }) {
  const ratio = maxDiscount > 0 ? (card.discount / maxDiscount) * 100 : 0;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center items-start gap-[10px]"
      >
        {/* 가로형 카드 이미지는 세로로 돌려서 보여줍니다 */}
        <span className="relative h-[76px] w-[48px] shrink-0 overflow-hidden rounded-[2px]">
          <img
            src={card.image}
            alt={card.name}
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover',
              card.isHorizontal
                ? 'h-[48px] w-[76px] rotate-90'
                : 'h-[76px] w-[48px]',
            )}
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <div className="flex items-start justify-between gap-[10px]">
            <div className="flex min-w-0 flex-col items-start">
              <span className="truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
                {card.brandName ?? card.name}
              </span>
              <span
                className={cn(
                  "font-['Pretendard'] text-[14px] leading-[140%] font-[400]",
                  card.isConditional ? 'text-[#EE695D]' : 'text-[#8E8E8E]',
                )}
              >
                {card.isConditional
                  ? '카드 정보 미확인'
                  : '남은 한도 기준 적용'}
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
              className="h-full rounded-[12px] bg-[#8C9EFF]"
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      </button>
    </li>
  );
}

const LOADING_DELAY = 800;

export default function PaymentDetailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { paymentId } = useParams();
  const payment = PAYMENT_DETAILS[paymentId];
  // 결제 카드 변경 화면에서 고른 카드가 있으면 그 카드를 먼저 보여줍니다.
  const [selectedCardId, setSelectedCardId] = useState(
    state?.selectedCardId ?? payment?.recommendedCardId,
  );
  // 카드 사용 현황 입력: null(닫힘) | 'sheet'(선택지 바텀시트) | 'amount'(금액 직접 입력)
  const [usageInput, setUsageInput] = useState(null);
  // 카드별로 직접 입력한 사용 금액 (카드 id → { 질문 name → 금액 })
  const [usageAmounts, setUsageAmounts] = useState({});
  // 혜택 금액을 계산하는 동안 본문 대신 스켈레톤을 보여줍니다.
  const [isLoading, setIsLoading] = useState(true);
  // 카드 사용 현황을 알려줘 다시 계산한 카드 id
  const [verifiedCardIds, setVerifiedCardIds] = useState([]);

  // TODO: API 연동 시 혜택 계산 요청이 끝나면 로딩을 끝냅니다. 지금은 잠깐 기다리는 것으로 대신합니다.
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, [isLoading]);

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

  const cards = payment.cards.map((card) =>
    verifiedCardIds.includes(card.id)
      ? applyCardUsage(card, payment.amount)
      : card,
  );
  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const otherCards = cards.filter((card) => card.id !== selectedCard.id);
  const maxDiscount = Math.max(...cards.map((card) => card.discount));

  return (
    // 헤더는 고정하고 그 아래 영역만 스크롤합니다.
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <PageHeader
        title={payment.place}
        subtitle={<CardSubtitle card={selectedCard} />}
        onBack={() => navigate(-1)}
        onClose={() => navigate('/')}
      />

      <main className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <PaymentDetailSkeleton />
        ) : (
          <div className="mx-auto flex w-full max-w-[402px] flex-col items-center gap-[24px] px-[18px] pt-[24px] pb-[calc(104px+max(20px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
            <div className="mb-[12px] flex flex-col items-center gap-[20px]">
              {/* 세로형 카드 이미지는 가로로 돌려서 보여줍니다 */}
              <div className="relative h-[176px] w-[280px] overflow-hidden rounded-[8px]">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className={cn(
                    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover',
                    selectedCard.isHorizontal
                      ? 'h-[176px] w-[280px]'
                      : 'h-[280px] w-[176px] -rotate-90',
                  )}
                />
              </div>
              <p className="flex items-baseline gap-[6px]">
                <span className="font-['Pretendard'] text-[36px] leading-[100%] font-[600] tracking-[-0.09px] text-[#121212]">
                  {formatWon(selectedCard.discount)}
                </span>
                <span className="font-['Pretendard'] text-[20px] leading-[120%] font-[400] text-[#8E8E8E]">
                  할인
                </span>
              </p>
            </div>

            <CalculationSection
              key={selectedCard.id}
              amount={payment.amount}
              card={selectedCard}
              recommendedCard={cards.find(
                (card) => card.id === payment.recommendedCardId,
              )}
              onMore={() => setUsageInput('sheet')}
            />

            <section className="flex w-full flex-col gap-[16px]">
              <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
                내 카드 비교
              </h2>
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
              <p className="font-['Pretendard'] text-[12px] leading-[120%] font-[400] break-keep text-[#969DA6]">
                카똑이 계산하는 혜택 기준이에요. 통신요금 할인처럼 추천 미반영
                혜택은 포함하지 않았고, 실제 지급액은 카드사 기준에 따라 달라질
                수 있어요.
              </p>
            </section>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] gap-3 bg-[#F1F1F1] px-[18px] pt-3 pb-[max(20px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            navigate(`/payment/${payment.id}/card`, {
              replace: true,
              state: { selectedCardId: selectedCard.id },
            })
          }
          className="flex h-[54px] flex-1 items-center justify-center rounded-[27px] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
        >
          다시 고르기
        </button>
        <button
          type="button"
          disabled={isLoading}
          // TODO: API 연동 시 선택한 카드로 결제 완료를 서버에 기록합니다.
          onClick={() =>
            navigate('/', {
              replace: true,
              state: {
                recordedPayment: {
                  id: payment.id,
                  place: payment.place,
                  discount: selectedCard.discount,
                },
              },
            })
          }
          className="flex h-[54px] flex-1 items-center justify-center rounded-[8px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
        >
          바로 결제
        </button>
      </div>

      {usageInput === 'sheet' && (
        <CardUsageSheet
          card={selectedCard}
          onClose={() => setUsageInput(null)}
          onDirectInput={() => setUsageInput('amount')}
          amounts={usageAmounts[selectedCard.id]}
          // TODO: API 연동 시 입력한 사용 현황으로 혜택을 다시 계산합니다.
          onSubmit={() => {
            setVerifiedCardIds((prev) =>
              prev.includes(selectedCard.id)
                ? prev
                : [...prev, selectedCard.id],
            );
            setIsLoading(true);
          }}
        />
      )}
      {usageInput === 'amount' && (
        <CardUsageAmountScreen
          card={selectedCard}
          initialAmounts={usageAmounts[selectedCard.id]}
          onBack={() => setUsageInput('sheet')}
          // 입력을 마치면 바텀시트로 돌아가 입력한 금액을 텍스트 필드로 보여줍니다.
          onSubmit={(amounts) => {
            setUsageAmounts((prev) => ({
              ...prev,
              [selectedCard.id]: amounts,
            }));
            setUsageInput('sheet');
          }}
        />
      )}
    </div>
  );
}

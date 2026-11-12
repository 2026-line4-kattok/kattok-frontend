import { ChevronLeft, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import kbNori2Image from '@/assets/card/KB 국민은행 노리2.png';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';
import { cn } from '@/utils/cn';

const AMOUNT_PATH = '/payment/amount';

// TODO: API 연동 시 서버 데이터로 교체합니다. (결제 기록 id로 조회)
const PAYMENT_DETAILS = {
  1: {
    id: 1,
    place: '스타벅스',
    category: '카페',
    amount: 30000,
    selectedCardId: 'kb-nori2',
    cards: [
      {
        id: 'kb-nori2',
        name: 'KB국민 노리2 체크카드',
        shortName: '노리 2',
        image: kbNori2Image,
        isHorizontal: true,
        discount: 3000,
        rate: 10,
        isConditional: true,
        conditionNotice: {
          title: '노리 2의 지난달 실적을 아직 몰라요',
          description:
            '실적 조건(30만 원 이상)을 채웠다고 보고 10% 할인을 전부 적용했어요. 지난달 실적을 업데이트 하면 남은 한도 기준으로 정확히 계산할 수 있어요.',
        },
      },
      {
        id: 'shinhan-mr-life',
        name: '신한 Mr.Life',
        shortName: 'Mr.Life',
        image: mrLifeImage,
        discount: 2000,
        rate: 10,
        isConditional: false,
      },
      {
        id: 'hana-k-pass',
        name: '하나 K-패스',
        shortName: 'K-패스',
        image: hanaKPassCheckImage,
        discount: 0,
        rate: 0,
        isConditional: false,
      },
    ],
  },
};

const formatWon = (value) => `${value.toLocaleString('ko-KR')}원`;

function Header({ place, card, onBack, onClose }) {
  return (
    <header className="flex w-full items-center justify-between py-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="flex size-[40px] items-center justify-center text-[#CACACA]"
      >
        <ChevronLeft className="size-[28px]" strokeWidth={1.75} />
      </button>
      <div className="flex min-w-0 flex-col items-center gap-[2px]">
        <h1 className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
          {place}
        </h1>
        <div className="flex items-center gap-[6px]">
          <span className="truncate font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
            {card.name}
          </span>
          {card.isConditional && (
            <span className="shrink-0 rounded-[8px] bg-[#DBE1FF] px-[4px] py-[1px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8C9EFF]">
              조건부
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex size-[40px] items-center justify-center text-[#CACACA]"
      >
        <X className="size-[26px]" strokeWidth={1.75} />
      </button>
    </header>
  );
}

function CalculationSection({ amount, card }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { conditionNotice } = card;

  return (
    <section className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
          이렇게 계산했어요
        </h2>
        {conditionNotice && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
          >
            {isExpanded ? '접기' : '더보기'}
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
              <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[#F8C5C0] text-[13px] leading-none font-bold text-[#FAFAFA]">
                !
              </span>
              <span className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] break-keep text-[#4B4B4B]">
                {conditionNotice.title}
              </span>
            </div>
            <p
              className={cn(
                "font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]",
                !isExpanded && 'line-clamp-3',
              )}
            >
              {conditionNotice.description}
            </p>
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
        className="flex w-full items-center gap-[10px] items-start"
      >
        <img
          src={card.image}
          alt={card.name}
          className="h-[76px] w-[48px] shrink-0 rounded-[2px] object-cover aspect-[12/19]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <div className="flex items-start justify-between gap-[10px]">
            <div className="flex min-w-0 flex-col items-start">
              <span className="truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
                {card.name}
              </span>
              <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                남은 한도 기준 적용
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

export default function PaymentDetailPage() {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const payment = PAYMENT_DETAILS[paymentId];
  const [selectedCardId, setSelectedCardId] = useState(
    payment?.selectedCardId,
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

  const selectedCard =
    payment.cards.find((card) => card.id === selectedCardId) ??
    payment.cards[0];
  const otherCards = payment.cards.filter(
    (card) => card.id !== selectedCard.id,
  );
  const maxDiscount = Math.max(...payment.cards.map((card) => card.discount));

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col items-center gap-[24px] px-[18px] pt-[48px] pb-[calc(104px+max(20px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
        <Header
          place={payment.place}
          card={selectedCard}
          onBack={() => navigate(-1)}
          onClose={() => navigate('/')}
        />

        <div className="flex flex-col items-center gap-[20px] mb-[12px]">
          <img
            src={selectedCard.image}
            alt={selectedCard.name}
            className={cn(
              'rounded-[8px] object-cover h-[176px] w-[280px]'
            )}
          />
          <p className="flex items-baseline gap-[6px]">
            <span className="font-['Pretendard'] text-[36px] leading-[100%] font-[600] text-[#121212] tracking-[-0.09px]">
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
        />

        <section className="flex w-full flex-col gap-[16px]">
          <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
            다른 카드 선택
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
            혜택은 포함하지 않았고, 실제 지급액은 카드사 기준에 따라 달라질 수
            있어요.
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] gap-3 bg-[#F1F1F1] px-[18px] pt-3 pb-[max(20px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <button
          type="button"
          onClick={() =>
            navigate(AMOUNT_PATH, {
              state: { category: payment.category, place: payment.place },
            })
          }
          className="flex h-[54px] flex-1 items-center justify-center rounded-[27px] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
        >
          다시 고르기
        </button>
        <button
          type="button"
          // TODO: API 연동 시 선택한 카드로 결제 완료를 기록합니다.
          onClick={() => navigate('/')}
          className="flex h-[54px] flex-1 items-center justify-center rounded-[8px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B]"
        >
          바로 결제
        </button>
      </div>
    </div>
  );
}

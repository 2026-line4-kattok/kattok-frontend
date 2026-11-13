import { Check, Ellipsis, Plus } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Toast from '@/components/common/Toast';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/utils/cn';
import CardUsageAmountScreen from '@/pages/Home/PaymentDetail/CardUsageAmountScreen';
import CardUsageSheet from '@/pages/Home/PaymentDetail/CardUsageSheet';
import CardMoreSheet from './CardMoreSheet';
import { MY_CARDS } from './cardData';
import { EditIcon } from '@/assets/icons/icons';

// 캐러셀 카드 크기 (px) — 스크롤 위치로 현재 카드를 계산할 때 사용합니다.
const CARD_WIDTH = 216;
const CARD_HEIGHT = 136;
const CARD_GAP = 24;

const formatWon = (value) => `${value.toLocaleString('ko-KR')}원`;

// 카드 이미지 (세로형 이미지는 가로로 눕혀서 표시, 실적 미확인 카드는 뿌옇게 표시)
function CardImage({ card }) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <img
        src={card.image}
        alt={card.name}
        draggable={false}
        className={cn(
          'absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
          card.isHorizontal ? 'size-full' : '-rotate-90',
        )}
        style={
          card.isHorizontal
            ? undefined
            : { width: CARD_HEIGHT, height: CARD_WIDTH }
        }
      />
      {/* 실적 확인이 필요한 카드는 비활성화된 것처럼 뿌옇게 덮습니다. */}
      {!card.isPerformanceConfirmed && (
        <span className="absolute inset-0 bg-[#F1F1F1]/50" />
      )}
    </div>
  );
}

// 혜택 한 줄 (사용 금액 / 한도 + 진행 바)
function BenefitItem({ benefit, onEdit, onEnterLimit }) {
  const { name, used, limit, isLimitEntered = true, isEstimated } = benefit;
  const isExhausted = used >= limit;
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;

  return (
    <li className="flex items-center gap-[24px]">
      <span className="size-[64px] shrink-0 bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f1f1f1_0_50%)] bg-size-[14px_14px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <p className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
          {name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-[6px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
            <span>{formatWon(used)}</span>
            <span className="h-[10px] w-px bg-[#C4C4C4]" />
            <span>{formatWon(limit)}</span>
          </p>
          {!isLimitEntered ? (
            <div className="flex shrink-0 items-center gap-[4px]">
              {isEstimated && (
                <span className="rounded-[27px] bg-[#DBE1FF] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8C9EFF]">
                  추정
                </span>
              )}
              <button
                type="button"
                onClick={onEnterLimit}
                className="flex items-center gap-[4px] rounded-[27px] bg-[#FAFAFA] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
              >
                <Plus className="size-[16px] text-[#C4C4C4]" strokeWidth={2} />
                한도 입력
              </button>
            </div>
          ) : isExhausted ? (
            <span className="shrink-0 rounded-[27px] bg-[#F8C5C0] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#EE695D]">
              한도 소진
            </span>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="flex shrink-0 items-center gap-[4px] rounded-[27px] bg-[#FAFAFA] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
            >
              <EditIcon
                className="size-[12px] fill-[#8E8E8E] text-[#8E8E8E]"
                strokeWidth={1.5}
              />
              수정
            </button>
          )}
        </div>
        <div className="mt-[4px] h-[8px] w-full overflow-hidden rounded-full bg-[#EBEBEB] shadow-[inset_0_0_4px_0_rgba(0,0,0,0.08)]">
          <div
            className={cn(
              'h-full rounded-full',
              isExhausted ? 'bg-[#DBE1FF]' : 'bg-[#8C9EFF]',
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
    </li>
  );
}

export default function CardPage() {
  const scrollRef = useRef(null);
  // TODO: API 연동 시 서버 데이터로 교체합니다. (실적 등록 결과를 화면에 반영하기 위해 상태로 둡니다.)
  const [cards, setCards] = useState(MY_CARDS);
  // 스크롤 위치를 카드 단위로 환산한 값 (0 = 첫 카드가 가운데, 1.5 = 두 번째와 세 번째 카드 사이)
  const [scrollPosition, setScrollPosition] = useState(0);
  const activeIndex = Math.min(
    Math.max(Math.round(scrollPosition), 0),
    cards.length - 1,
  );
  const activeCard = cards[activeIndex];
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  // 실적 저장 완료 토스트에 보여줄 카드 (저장 전 isPerformanceConfirmed가 false면 처음 등록, true면 수정)
  const [registeredCard, setRegisteredCard] = useState(null);
  const closeRegisteredToast = useCallback(
    () => setRegisteredCard(null),
    [setRegisteredCard],
  );
  // 카드 사용 현황 입력: null | 'sheet'(바텀시트) | 'amount'(금액 직접 입력 화면)
  const [usageInput, setUsageInput] = useState(null);
  // 카드별로 직접 입력한 금액
  const [usageAmounts, setUsageAmounts] = useState({});

  const handleScroll = () => {
    setScrollPosition(scrollRef.current.scrollLeft / (CARD_WIDTH + CARD_GAP));
  };

  const scrollToCard = (index) => {
    scrollRef.current?.scrollTo({
      left: index * (CARD_WIDTH + CARD_GAP),
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col pt-[72px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))]">
        <header className="flex items-start justify-between px-[18px] max-phone-xs:px-3">
          <div className="flex flex-col gap-[2px]">
            <h1 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
              {activeCard.name}
            </h1>
            <p className="font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8E8E8E]">
              {activeCard.type}
            </p>
          </div>
          <button
            type="button"
            aria-label="카드 더보기"
            onClick={() => setIsMoreSheetOpen(true)}
            className="p-1"
          >
            <Ellipsis className="size-[24px] text-[#C4C4C4]" />
          </button>
        </header>

        {/* 내 카드 캐러셀 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-[36px] flex snap-x snap-mandatory [scrollbar-width:none] items-end overflow-x-auto px-[calc(50%-108px)] [&::-webkit-scrollbar]:hidden"
          style={{ gap: CARD_GAP }}
        >
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            // 가운데에서 멀어질수록(0~1) 작고 흐려집니다. 스크롤에 맞춰 연속으로 변해 카드가 튀지 않습니다.
            const offset = index - scrollPosition;
            const distance = Math.min(Math.abs(offset), 1);
            return (
              <button
                key={card.id}
                type="button"
                aria-label={card.name}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollToCard(index)}
                // 스냅 기준은 크기가 변하지 않는 바깥 버튼에 두어야 카드가 정확히 가운데에 멈춥니다.
                className="shrink-0 snap-center snap-always"
              >
                {/* 옆 카드는 아래 기준으로 줄이고, 가운데 카드 쪽 모서리를 기준으로 삼아 간격을 유지합니다. */}
                <div
                  style={{
                    scale: 1 - 0.3 * distance,
                    opacity: 1 - 0.5 * distance,
                    transformOrigin:
                      offset < 0 ? 'right bottom' : 'left bottom',
                  }}
                >
                  <CardImage card={card} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-[16px] flex justify-center">
          {activeCard.isPerformanceConfirmed ? (
            <span className="rounded-[27px] bg-[#DBE1FF] px-[12px] py-[6px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8C9EFF]">
              {activeCard.performanceMonth}월 카드 실적 확인 완료
            </span>
          ) : (
            // TODO: 실적 확인 화면이 정해지면 연결합니다.
            <span className="flex items-center gap-[6px] rounded-[27px] bg-[#F8C5C0] px-[12px] py-[6px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#EE695D]">
              <span className="flex size-[18px] items-center justify-center rounded-full bg-[#D53D30] text-[12px] leading-none font-bold text-[#FAFAFA]">
                !
              </span>
              {activeCard.performanceMonth}월 카드 실적 확인 필요
            </span>
          )}
        </div>

        <section className="mt-[36px] flex flex-col px-[18px] max-phone-xs:px-3">
          <h2 className="font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#4B4B4B]">
            이 카드의 혜택
          </h2>
          <p className="mt-[1px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]">
            추천에 포함되는 혜택만 모았어요. 다 받아가세요.
            <br />
            카똑에서 확인된 결제 내역만 입력돼요.
          </p>

          <ul className="mt-[24px] flex flex-col gap-[16px]">
            {activeCard.benefits.map((benefit) => (
              <BenefitItem
                key={benefit.id}
                benefit={benefit}
                onEdit={() => setUsageInput('sheet')}
                // TODO: 한도 입력 화면이 정해지면 연결합니다.
                onEnterLimit={() => {}}
              />
            ))}
          </ul>
        </section>
      </main>

      {registeredCard && (
        <Toast
          icon={
            <span className="relative size-full">
              <img
                src={registeredCard.image}
                alt=""
                className={cn(
                  'absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
                  registeredCard.isHorizontal
                    ? 'h-[60px] w-[95px]'
                    : 'h-[95px] w-[60px] -rotate-90',
                )}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-[rgba(18,18,18,0.2)]">
                <span className="flex size-[28px] items-center justify-center rounded-full bg-[#A3B1FF]">
                  <Check
                    className="size-[18px] text-[#FAFAFA]"
                    strokeWidth={2.5}
                  />
                </span>
              </span>
            </span>
          }
          title={
            <span className="text-[#A3B1FF]">
              카드 실적이{' '}
              {registeredCard.isPerformanceConfirmed ? '수정' : '등록'}
              되었어요
            </span>
          }
          description="더 정확하게 카드를 추천받을 수 있어요"
          hasArrow={false}
          // 카드 전체가 보이도록 아이콘 영역을 카드 비율(가로형)로 넓힙니다.
          iconClassName="w-[95px] rounded-[4px]"
          onClick={closeRegisteredToast}
          onClose={closeRegisteredToast}
        />
      )}

      <BottomNav />

      {isMoreSheetOpen && (
        <CardMoreSheet
          card={activeCard}
          onClose={() => setIsMoreSheetOpen(false)}
          onEditPerformance={() => {
            setIsMoreSheetOpen(false);
            setUsageInput('sheet');
          }}
          // TODO: 카드 삭제 API 연동 (삭제 확인 단계가 정해지면 함께 연결합니다.)
          onDelete={() => {}}
        />
      )}

      {usageInput === 'sheet' && (
        <CardUsageSheet
          card={activeCard}
          submitLabel="저장하기"
          onClose={() => setUsageInput(null)}
          onDirectInput={() => setUsageInput('amount')}
          amounts={usageAmounts[activeCard.id]}
          // TODO: API 연동 시 입력한 사용 현황을 저장하고 혜택 현황을 다시 받아옵니다.
          onSubmit={() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === activeCard.id
                  ? { ...card, isPerformanceConfirmed: true }
                  : card,
              ),
            );
            setRegisteredCard(activeCard);
          }}
        />
      )}
      {usageInput === 'amount' && (
        <CardUsageAmountScreen
          card={activeCard}
          initialAmounts={usageAmounts[activeCard.id]}
          onBack={() => setUsageInput('sheet')}
          // 입력을 마치면 바텀시트로 돌아가 입력한 금액을 보여줍니다.
          onSubmit={(amounts) => {
            setUsageAmounts((prev) => ({ ...prev, [activeCard.id]: amounts }));
            setUsageInput('sheet');
          }}
        />
      )}
    </div>
  );
}

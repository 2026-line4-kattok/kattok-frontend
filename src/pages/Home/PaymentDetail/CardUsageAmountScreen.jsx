import { ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import AmountKeypad, { AmountDisplay } from '@/components/common/AmountKeypad';
import useAmountInput from '@/hooks/useAmountInput';
import { cn } from '@/utils/cn';

// 단계가 바뀔 때 화면 전체가 옅어졌다가(out) 다음 단계로 짙어집니다(in).
const FADE_DURATION = '200ms';

// 카드 사용 현황에서 물어볼 금액 단계 (지난달 실적 → 업종별 받은 할인)
// card.performanceOptions·usageCaps(3-3 상태 조회)가 있으면 서버 데이터로 단계를 만듭니다.
const getSteps = (card) => [
  ...(card.performanceOptions || card.performanceRequirement
    ? [
        {
          name: 'performance',
          title: '카드 사용 현황을 알려주세요',
          placeholder: '결제 금액',
        },
      ]
    : []),
  ...(card.usageCaps ?? []).map((cap) =>
    cap.unit === 'COUNT'
      ? {
          name: cap.name,
          title: `${cap.description}, 몇 번 남았나요?`,
          placeholder: '남은 횟수',
          unit: '회',
        }
      : {
          name: cap.name,
          title: `${cap.description}, 얼마나 남았나요?`,
          placeholder: '잔여 한도',
        },
  ),
  ...(card.usageCaps ? [] : (card.benefitCategories ?? [])).map((category) => ({
    name: `remaining-${category}`,
    title: `${category} 할인 얼마나 받았나요?`,
    placeholder: '할인 금액',
  })),
];

// 단계가 이보다 많으면 헤더 제목과 겹치지 않도록 '현재 … 마지막'으로 줄여 보여줍니다.
const MAX_VISIBLE_STEPS = 3;

// 보여줄 단계 번호(0부터) 목록. 'ellipsis'는 생략 표시입니다.
// 예) 7단계: 1단계 → [1 … 7], 4단계 → [4 … 7], 6단계 → [6 7], 7단계 → [1 … 7]
const getVisibleSteps = (total, current) => {
  if (total <= MAX_VISIBLE_STEPS)
    return Array.from({ length: total }, (_, index) => index);
  const last = total - 1;
  if (current === last) return [0, 'ellipsis', last];
  if (current === last - 1) return [current, last];
  return [current, 'ellipsis', last];
};

function StepIndicator({ total, current }) {
  return (
    <ol
      aria-label={`${total}단계 중 ${current + 1}단계`}
      className="flex shrink-0 items-center gap-[10px]"
    >
      {getVisibleSteps(total, current).map((index) =>
        index === 'ellipsis' ? (
          <li
            key="ellipsis"
            aria-hidden="true"
            className="flex h-[24px] items-center font-['Pretendard'] text-[16px] leading-none font-[400] text-[#A3B1FF]"
          >
            …
          </li>
        ) : (
          <li
            key={index}
            aria-current={index === current ? 'step' : undefined}
            className={cn(
              "flex size-[24px] items-center justify-center rounded-full font-['Pretendard'] text-[16px] leading-none font-[400]",
              index === current
                ? 'bg-[#8C9EFF] text-[#F4F5FF]'
                : 'bg-[#DBE1FF] text-[#A3B1FF]',
            )}
          >
            {index + 1}
          </li>
        ),
      )}
    </ol>
  );
}

const noop = () => {};

function AmountStep({
  card,
  step,
  amount,
  onDigit = noop,
  onDelete = noop,
  onAdd = noop,
  onSave = noop,
}) {
  return (
    <>
      <main className="mx-auto flex min-h-0 w-full max-w-[402px] flex-1 flex-col px-[22px] max-phone-xs:px-3">
        <div className="mt-[32px] flex items-center gap-[10px]">
          <span className="relative h-[32px] w-[50px] shrink-0 overflow-hidden rounded-[2px]">
            <img
              src={card.image}
              alt=""
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover',
                card.isHorizontal
                  ? 'h-[34px] w-[54px]'
                  : 'h-[54px] w-[34px] -rotate-90',
              )}
            />
          </span>
          <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#8E8E8E]">
            {card.brandName ?? card.name}
          </span>
        </div>

        <h2 className="mt-[8px] font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
          {step.title}
        </h2>

        <AmountDisplay
          amount={amount}
          placeholder={step.placeholder}
          unit={step.unit}
          className="mt-[48px]"
        />

        <div className="pt-[48px]">
          <AmountKeypad
            onDigit={onDigit}
            onDelete={onDelete}
            onAdd={onAdd}
            hasQuickAdds={step.unit !== '회'}
          />
        </div>
      </main>

      <div className="mx-auto w-full max-w-[402px] shrink-0 px-6 pt-[40px] pb-[max(44px,env(safe-area-inset-bottom))] max-phone-s:pt-[24px] max-phone-xs:px-3">
        <button
          type="button"
          onClick={() => onSave(amount)}
          disabled={amount === 0}
          className="flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:bg-[#DBE1FF] disabled:text-[#B2BEFF]"
        >
          저장하기
        </button>
      </div>
    </>
  );
}

// 카드 사용 현황 바텀시트에서 "금액을 알면 직접 입력할 수 있어요"를 누르면 뜨는 금액 입력 화면
export default function CardUsageAmountScreen({
  card,
  initialAmounts = {},
  onBack,
  onSubmit,
}) {
  const steps = getSteps(card);
  const [stepIndex, setStepIndex] = useState(0);
  const [amounts, setAmounts] = useState(initialAmounts);
  // 'idle' | 'out'(옅어지는 중) | 'in'(짙어지는 중)
  const [fade, setFade] = useState('idle');
  // 화면이 다 옅어진 뒤 넘어갈 단계
  const pendingRef = useRef(null);
  const step = steps[stepIndex];
  const { amount, setAmount, appendDigit, removeDigit, addAmount } =
    useAmountInput(step ? (initialAmounts[step.name] ?? 0) : 0);

  const goToStep = (nextIndex, nextAmounts) => {
    if (fade === 'out') return;
    pendingRef.current = { nextIndex, nextAmounts };
    setFade('out');
  };

  const handleFadeEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (fade === 'out' && pendingRef.current) {
      const { nextIndex, nextAmounts } = pendingRef.current;
      pendingRef.current = null;
      setAmounts(nextAmounts);
      setStepIndex(nextIndex);
      setAmount(nextAmounts[steps[nextIndex].name] ?? 0);
      setFade('in');
    } else if (fade === 'in') {
      setFade('idle');
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      onBack();
      return;
    }
    // 뒤로 가도 지금 단계에 입력하던 금액은 남겨둡니다.
    goToStep(stepIndex - 1, { ...amounts, [step.name]: amount });
  };

  const handleSave = () => {
    const nextAmounts = { ...amounts, [step.name]: amount };
    if (stepIndex === steps.length - 1) onSubmit?.(nextAmounts);
    else goToStep(stepIndex + 1, nextAmounts);
  };

  if (!step) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="카드 사용 현황"
      className="fixed inset-0 z-30 bg-[#F1F1F1]"
    >
      <div
        onAnimationEnd={handleFadeEnd}
        className={cn(
          'flex h-full flex-col',
          fade === 'out' && 'pointer-events-none',
        )}
        style={
          fade === 'idle'
            ? undefined
            : {
                animation: `${fade === 'out' ? 'dim-out' : 'dim-in'} ${FADE_DURATION} ease-out forwards`,
              }
        }
      >
        <div className="mx-auto w-full max-w-[402px] shrink-0 px-4 pt-[71px] max-phone-xs:px-3">
          <header className="relative flex min-h-[40px] w-full items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="flex size-[40px] shrink-0 items-center justify-center text-[#CACACA]"
            >
              <ChevronLeft
                className="size-[40px]"
                strokeWidth={2.5}
                absoluteStrokeWidth
              />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-['Pretendard'] text-[18px] leading-[120%] font-[600] whitespace-nowrap text-[#4B4B4B]">
              카드 사용 현황
            </h1>
            <StepIndicator total={steps.length} current={stepIndex} />
          </header>
        </div>

        <AmountStep
          card={card}
          step={step}
          amount={amount}
          onDigit={appendDigit}
          onDelete={removeDigit}
          onAdd={addAmount}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

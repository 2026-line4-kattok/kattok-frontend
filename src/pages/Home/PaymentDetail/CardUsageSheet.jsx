import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

const SHEET_DURATION = '300ms';

const formatManWon = (value) => `${value / 10000}만원`;

function OptionGroup({ name, question, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-[12px] font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
        {question}
      </legend>
      <div className="grid grid-cols-3 gap-[10px] max-phone-xs:gap-[6px]">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex h-[48px] items-center justify-center rounded-[8px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] whitespace-nowrap peer-focus-visible:outline-2 peer-focus-visible:outline-[#8C9EFF] max-phone-s:text-[14px]",
                value === option.value
                  ? 'bg-[#8C9EFF] text-[#3B426B]'
                  : 'bg-[#F1F1F1] text-[#8E8E8E]',
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// 조건부 카드의 지난달 실적·이번 달 할인 사용 현황을 묻는 바텀시트
export default function CardUsageSheet({ card, onClose, onSubmit }) {
  const [isClosing, setIsClosing] = useState(false);
  const categories = card.benefitCategories ?? [];
  const requirement = card.performanceRequirement;

  const questions = [
    ...(requirement
      ? [
          {
            name: 'performance',
            question: '지난달 이 카드로 얼마나 쓰셨나요?',
            options: [
              { value: 'under', label: `${formatManWon(requirement)} 미만` },
              { value: 'over', label: `${formatManWon(requirement)} 이상` },
              { value: 'unknown', label: '모르겠어요' },
            ],
          },
        ]
      : []),
    ...categories.map((category) => ({
      name: `remaining-${category}`,
      question: `이번 달 ${category} 할인 얼마나 남았나요?`,
      options: [
        { value: 'used', label: '다 썼어요' },
        { value: 'unused', label: '안 썼어요' },
        { value: 'unknown', label: '모르겠어요' },
      ],
    })),
  ];
  // 시안처럼 각 질문의 첫 번째 선택지가 선택된 상태로 시작합니다.
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      questions.map(({ name, options }) => [name, options[0].value]),
    ),
  );

  // 닫힐 때도 시트가 내려가고 배경이 옅어진 뒤에 화면에서 빠집니다.
  const close = () => setIsClosing(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsClosing(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    onSubmit?.(answers);
    close();
  };

  return (
    <div className="fixed inset-0 z-30">
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-[rgba(18,18,18,0.5)] backdrop-blur-[4px]"
        style={{
          animation: `${isClosing ? 'dim-out' : 'dim-in'} ${SHEET_DURATION} ease-out forwards`,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-usage-sheet-title"
        onAnimationEnd={(e) => {
          if (isClosing && e.target === e.currentTarget) onClose();
        }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-[calc(100%-8px)] max-w-[394px] [scrollbar-width:none] flex-col overflow-y-auto rounded-t-[24px] bg-[#FAFAFA] px-[20px] pt-[12px] pb-[max(24px,env(safe-area-inset-bottom))] max-phone-xs:px-3 [&::-webkit-scrollbar]:hidden"
        style={{
          animation: `${isClosing ? 'sheet-down' : 'sheet-up'} ${SHEET_DURATION} ease-out forwards`,
        }}
      >
        <span
          aria-hidden="true"
          className="mx-auto h-[4px] w-[52px] shrink-0 rounded-full bg-[#D9D9D9]"
        />

        <div className="mt-[40px] flex flex-col gap-[8px] px-[4px]">
          <div className="flex items-center gap-[10px]">
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
          <h2
            id="card-usage-sheet-title"
            className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]"
          >
            카드 사용 현황을 알려주세요
          </h2>
        </div>

        <div className="mt-[32px] flex flex-col gap-[24px]">
          {questions.map(({ name, question, options }) => (
            <OptionGroup
              key={name}
              name={name}
              question={question}
              options={options}
              value={answers[name]}
              onChange={(value) =>
                setAnswers((prev) => ({ ...prev, [name]: value }))
              }
            />
          ))}
        </div>

        <button
          type="button"
          className="mx-auto mt-[32px] font-['Pretendard'] text-[14px] leading-[140%] font-[500] text-[#6E6E6E] underline underline-offset-2"
        >
          금액을 알면 직접 입력할 수 있어요
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="mt-[12px] flex h-[54px] w-full shrink-0 items-center justify-center rounded-[27px] bg-[#121212] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#FAFAFA]"
        >
          카드 추천 받기
        </button>
      </div>
    </div>
  );
}

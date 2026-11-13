import { Delete } from 'lucide-react';
import { cn } from '@/utils/cn';

const QUICK_ADDS = [
  { label: '+ 1천', value: 1_000 },
  { label: '+ 5천', value: 5_000 },
  { label: '+ 1만', value: 10_000 },
  { label: '+ 5만', value: 50_000 },
];

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function AmountDisplay({ amount, placeholder, className }) {
  return (
    <p
      role="textbox"
      aria-label={placeholder}
      aria-readonly="true"
      className={cn(
        "flex h-[36px] items-center font-['Pretendard'] text-[36px] leading-[100%] font-[600]",
        className,
      )}
    >
      {amount > 0 ? (
        <>
          <span className="text-[#121212]">
            {amount.toLocaleString('ko-KR')}
          </span>
          <span className="text-[#121212]">원</span>
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="mr-[2px] h-[36px] w-[2px] animate-caret-blink bg-[#A3B1FF]"
          />
          <span className="text-[#E1E1E1]">{placeholder}</span>
        </>
      )}
    </p>
  );
}

function Key({ children, onClick, label, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex h-[70px] items-center justify-center font-['Pretendard'] text-[32px] leading-[120%] font-[500] text-[#121212] active:bg-[#E6E6E6] disabled:active:bg-transparent"
    >
      {children}
    </button>
  );
}

// 빠른 금액 추가 버튼 + 숫자 키패드
export default function AmountKeypad({ onDigit, onDelete, onAdd }) {
  return (
    <div className="flex flex-col">
      <div className="-mx-[4px] grid grid-cols-4 gap-[10px] max-phone-xs:mx-0 max-phone-xs:gap-[6px]">
        {QUICK_ADDS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => onAdd(value)}
            className="flex h-[48px] items-center justify-center rounded-[27px] bg-[#F4F5FF] font-['Pretendard'] text-[16px] leading-[140%] font-[400] whitespace-nowrap text-[#8C9EFF] active:bg-[#E6EAFF]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-[16px] grid grid-cols-3">
        {DIGIT_KEYS.map((digit) => (
          <Key key={digit} onClick={() => onDigit(digit)}>
            {digit}
          </Key>
        ))}
        <Key label="소수점" disabled>
          ·
        </Key>
        <Key onClick={() => onDigit('0')}>0</Key>
        <Key onClick={onDelete} label="지우기">
          <Delete className="size-[20px]" strokeWidth={2} />
        </Key>
      </div>
    </div>
  );
}

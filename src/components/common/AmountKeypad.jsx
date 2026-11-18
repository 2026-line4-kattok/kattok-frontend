import { Delete } from 'lucide-react';
import { cn } from '@/utils/cn';

const QUICK_ADDS = [
  { label: '+ 1천', value: 1_000 },
  { label: '+ 5천', value: 5_000 },
  { label: '+ 1만', value: 10_000 },
  { label: '+ 5만', value: 50_000 },
];

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// unit: 숫자 뒤에 붙는 단위 (기본 '원', 횟수 입력은 '회')
export function AmountDisplay({ amount, placeholder, className, unit = '원' }) {
  return (
    <p
      role="textbox"
      aria-label={placeholder}
      aria-readonly="true"
      className={cn(
        "flex h-[36px] shrink-0 items-center font-['Pretendard'] text-[36px] leading-[100%] font-[600] whitespace-nowrap max-phone-s:h-[32px] max-phone-s:text-[32px]",
        className,
      )}
    >
      {amount > 0 ? (
        <>
          <span className="text-[#121212]">
            {amount.toLocaleString('ko-KR')}
          </span>
          <span className="text-[#121212]">{unit}</span>
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="mr-[2px] h-full w-[2px] animate-caret-blink bg-[#A3B1FF]"
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
      className="flex h-full min-h-0 items-center justify-center font-['Pretendard'] text-[32px] leading-[120%] font-[500] text-[#121212] active:bg-[#E6E6E6] disabled:active:bg-transparent max-phone-s:text-[28px]"
    >
      {children}
    </button>
  );
}

// 빠른 금액 추가 버튼 + 숫자 키패드
// hasQuickAdds: 금액이 아닌 값(횟수 등)을 입력할 때는 빠른 금액 추가 버튼을 숨깁니다.
// 남은 높이를 채우되 키 한 줄은 최대 70px, 화면이 낮으면 최소 44px까지 줄어듭니다.
// (부모에서 flex-1 min-h-0 으로 높이를 넘겨주세요.)
export default function AmountKeypad({
  onDigit,
  onDelete,
  onAdd,
  hasQuickAdds = true,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          '-mx-[4px] grid shrink-0 grid-cols-4 gap-[10px] max-phone-xs:mx-0 max-phone-xs:gap-[6px]',
          !hasQuickAdds && 'hidden',
        )}
      >
        {QUICK_ADDS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => onAdd(value)}
            className="flex h-[48px] items-center justify-center rounded-[27px] bg-[#F4F5FF] font-['Pretendard'] text-[16px] leading-[140%] font-[400] whitespace-nowrap text-[#8C9EFF] active:bg-[#E6EAFF] max-phone-xs:text-[14px] [@media(max-height:640px)]:h-[40px]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-[16px] grid max-h-[280px] min-h-[176px] flex-1 grid-cols-3 grid-rows-4 [@media(max-height:640px)]:mt-[8px]">
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

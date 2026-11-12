import { ChevronLeft, Delete, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  createPaymentDetail,
  hasBenefit,
} from '@/pages/Home/PaymentDetail/paymentDetailData';

const QUICK_ADDS = [
  { label: '+ 1천', value: 1_000 },
  { label: '+ 5천', value: 5_000 },
  { label: '+ 1만', value: 10_000 },
  { label: '+ 5만', value: 50_000 },
];

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// 1억원 미만까지만 입력받습니다.
const MAX_AMOUNT = 99_999_999;

const clamp = (value) => Math.min(value, MAX_AMOUNT);

function Key({ children, onClick, label, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex h-[70px] gap-12px items-center justify-center font-['Pretendard'] text-[32px] leading-[120%] font-[500] text-[#121212] active:bg-[#E6E6E6] disabled:active:bg-transparent"
    >
      {children}
    </button>
  );
}

export default function AmountInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [amount, setAmount] = useState(0);

  const appendDigit = (digit) =>
    setAmount((prev) => clamp(prev * 10 + Number(digit)));
  const removeDigit = () => setAmount((prev) => Math.floor(prev / 10));
  const addAmount = (value) => setAmount((prev) => clamp(prev + value));

  // 데스크톱에서는 키보드 숫자 입력도 받습니다.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^\d$/.test(e.key)) {
        setAmount((prev) => clamp(prev * 10 + Number(e.key)));
      } else if (e.key === 'Backspace') {
        setAmount((prev) => Math.floor(prev / 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 검색 화면을 거치지 않고 들어오면 장소 정보가 없으므로 돌려보냅니다.
  if (!state?.place && !state?.category) {
    return <Navigate to="/search" replace />;
  }

  const { place, category } = state;
  const title = place ?? category;

  const handleSave = () => {
    // TODO: API 연동 시 결제 기록(장소, 업종, 금액)을 서버에 저장하고 혜택 계산 결과를 받아옵니다.
    const payment = createPaymentDetail({ place, category, amount });
    // 받을 수 있는 혜택이 있으면 혜택 금액 확인 화면으로 이어집니다.
    navigate(hasBenefit(payment) ? `/payment/${payment.id}` : '/');
  };

  return (
    <div className="flex h-dvh flex-col bg-[#F1F1F1]">
      <div className="mx-auto w-full max-w-[402px] shrink-0 px-4 pt-[71px] max-phone-xs:px-3">
        <header className="flex h-[40px] w-full items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="flex size-[40px] items-center justify-center text-[#CACACA]"
          >
            <ChevronLeft
              className="size-[40px]"
              strokeWidth={2.5}
              absoluteStrokeWidth
            />
          </button>
          <h1 className="truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            {title}
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
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-[402px] flex-1 flex-col px-[22px] max-phone-xs:px-3">
        <div className="mt-[32px] flex items-center gap-[12px]">
          <span className="size-[48px] shrink-0 bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f6f6f6_0_50%)] bg-size-[12px_12px]" />
          <span className="flex min-w-0 flex-col gap-[4px]">
            <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
              {title}
            </span>
            {place && category && (
              <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                {category}
              </span>
            )}
          </span>
        </div>

        <h2 className="mt-[8px] font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
          결제 금액을 알려주세요.
        </h2>

        <p
          role="textbox"
          aria-label="결제 금액"
          aria-readonly="true"
          className="mt-[48px] flex h-[36px] items-center font-['Pretendard'] text-[36px] leading-[100%] font-[600]"
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
              <span className="text-[#E1E1E1]">결제 금액</span>
            </>
          )}
        </p>

        <div className="flex flex-col pt-[48px]">
          <div className="-mx-[4px] grid grid-cols-4 gap-[10px] max-phone-xs:mx-0 max-phone-xs:gap-[6px]">
            {QUICK_ADDS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => addAmount(value)}
                className="flex h-[48px] items-center justify-center rounded-[27px] bg-[#F4F5FF] font-['Pretendard'] text-[16px] leading-[140%] font-[400] whitespace-nowrap text-[#8C9EFF] active:bg-[#E6EAFF]"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-[16px] grid grid-cols-3">
            {DIGIT_KEYS.map((digit) => (
              <Key key={digit} onClick={() => appendDigit(digit)}>
                {digit}
              </Key>
            ))}
            <Key label="소수점" disabled>
              ·
            </Key>
            <Key onClick={() => appendDigit('0')}>0</Key>
            <Key onClick={removeDigit} label="지우기">
              <Delete className="size-[20px]" strokeWidth={2} />
            </Key>
          </div>
        </div>
      </main>

      <div className="mx-auto w-full max-w-[402px] shrink-0 px-6 pt-[40px] pb-[max(44px,env(safe-area-inset-bottom))] max-phone-s:pt-[24px] max-phone-xs:px-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={amount === 0}
          className="flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#A3B1FF] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#3B426B] disabled:bg-[#DBE1FF] disabled:text-[#B2BEFF]"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AmountKeypad, { AmountDisplay } from '@/components/common/AmountKeypad';
import useAmountInput from '@/hooks/useAmountInput';
import PageHeader from '@/components/layout/PageHeader';
import {
  createPaymentDetail,
  hasBenefit,
} from '@/pages/Home/PaymentDetail/paymentDetailData';

<<<<<<< HEAD
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
      className="gap-12px flex h-[70px] items-center justify-center font-['Pretendard'] text-[32px] leading-[120%] font-[500] text-[#121212] active:bg-[#E6E6E6] disabled:active:bg-transparent"
    >
      {children}
    </button>
  );
}

=======
>>>>>>> 35aeab8e75b5c6b2c384baa2ad197820ed27f1cd
export default function AmountInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { amount, appendDigit, removeDigit, addAmount } = useAmountInput();

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
      <PageHeader
        title={title}
        onBack={() => navigate(-1)}
        onClose={() => navigate('/')}
      />

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

        <AmountDisplay
          amount={amount}
          placeholder="결제 금액"
          className="mt-[48px]"
        />

        <div className="pt-[48px]">
          <AmountKeypad
            onDigit={appendDigit}
            onDelete={removeDigit}
            onAdd={addAmount}
          />
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

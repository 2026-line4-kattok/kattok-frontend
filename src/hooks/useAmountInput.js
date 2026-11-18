import { useEffect, useState } from 'react';

// 1억원 미만까지만 입력받습니다.
const MAX_AMOUNT = 99_999_999;

const clamp = (value) => Math.min(value, MAX_AMOUNT);

// 금액 입력 상태 (키패드·빠른 추가·데스크톱 키보드 입력)
export default function useAmountInput(initialAmount = 0) {
  const [amount, setAmount] = useState(initialAmount);

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

  return { amount, setAmount, appendDigit, removeDigit, addAmount };
}

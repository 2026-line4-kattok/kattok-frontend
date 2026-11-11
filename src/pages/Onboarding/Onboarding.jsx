import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '@/utils/cn';
import logo from '@/assets/카똑.svg';
import splash from '@/assets/onboarding/splash.png';
import logoblack from '@/assets/onboarding/logo-black.svg';
export default function Onboarding() {
  const { state } = useLocation();
  const isBack = state?.back;
  const [step, setStep] = useState(isBack ? 3 : 1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isBack) return; // 뒤로 온 경우 타이머 생략
    const t1 = setTimeout(() => setStep(2), 800);
    const t2 = setTimeout(() => setStep(3), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isBack]);

  return (
    <div
      className={cn(
        'relative mx-auto h-screen max-w-[430px] overflow-hidden bg-neutral-100',
        isBack && 'animate-slide-in',
      )}
    >
      {/* 스플래시 2 배경 */}
      <div
        className={cn(
          'absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FAFAFA,#E1E1E1)] transition-opacity duration-1000',
          step === 3 && 'opacity-0',
        )}
      />

      {/* 스플래시 2-3: 카드 배경 */}
      <div className="absolute inset-x-0 top-[14%]">
        <img
          src={splash}
          alt=""
          className={cn(
            'w-full origin-[52%_49%] transition-all duration-1000 ease-out',
            step === 1 && 'scale-[2.3] opacity-0',
            step === 2 && 'scale-[2.3] opacity-100',
            step === 3 && 'scale-120 blur-[2px]',
          )}
        />
      </div>
      <div
        className={cn(
          'absolute inset-0 z-[5] bg-[#F1F1F1]/50 backdrop-blur-[24px] transition-opacity duration-1000',
          '[mask-image:linear-gradient(to_bottom,black_0%,transparent_78.38%)]',
          step === 3 ? 'opacity-100' : 'opacity-0',
        )}
      />
      {/* 스플래시 1 */}
      <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-900 text-white transition-opacity duration-700',
          step === 1 ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <img src={logo} alt="카똑" className="h-16 w-auto" />
        <p className="mt-3 text-center text-2xl leading-[1.2] font-normal text-[#F4F5FF]">
          내 카드가 똑똑해지는 순간
        </p>
      </div>

      {/* 스플래시 3 */}
      <div
        className={cn(
          'relative z-10 flex h-full flex-col px-6 pt-24 pb-8 transition-opacity duration-700',
          step === 3 ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <img src={logoblack} alt="카똑" className="h-12 w-auto self-start" />
        <p className="mt-3 text-sm leading-[1.3] text-neutral-900">
          놓치던 카드 혜택,
          <br />
          오늘부터 카똑과 함께 챙겨요.
        </p>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-[54px] cursor-pointer text-[20px] font-semibold text-[#3B426B]"
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="h-[54px] w-full cursor-pointer rounded-lg bg-[#A3B1FF] text-[20px] font-semibold text-[#3B426B]"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

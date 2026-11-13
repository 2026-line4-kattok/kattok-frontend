import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeclose from '@/assets/onboarding/eyeclose.svg';
import warning from '@/assets/onboarding/Warning.svg';

import LoginResult from './LoginResult';
import exampleCard1 from '@/assets/onboarding/card/eco-plan.png';
import exampleCard2 from '@/assets/onboarding/card/hey-young.png';
import exampleCard3 from '@/assets/onboarding/card/bbig.png';

// Temporary preview data until the login/card API is connected.
const EXAMPLE_CARDS = [
  { id: 1, name: 'ECO Plan', image: exampleCard1 },
  { id: 2, name: 'Hey Young', image: exampleCard2 },
  { id: 3, name: 'B.Big', image: exampleCard3 },
];

/*
상단 아이디, 비밀번호*/
function FloatingField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  right,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== '';

  return (
    <div className="relative">
      {/* 테두리 전용 레이어*/}
      <fieldset
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-[-5px] bottom-0 m-0 rounded-lg border px-4 py-0 transition-colors',
          error
            ? 'border-[#F8C5C0]'
            : focused
              ? 'border-[#CACACA]'
              : 'border-transparent',
        )}
      >
        <legend
          className={cn(
            'px-1 text-[10px] leading-none',
            floated ? 'invisible block' : 'hidden',
          )}
        >
          {label}
        </legend>
      </fieldset>

      <label
        htmlFor={name}
        className={cn(
          'pointer-events-none absolute left-5 z-10 text-[#8E8E8E] transition-all duration-150',
          floated
            ? '-top-[5px] text-[10px] leading-none'
            : 'top-1/2 -translate-y-1/2 text-[16px]',
        )}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'font-regular h-12 w-full rounded-lg bg-[#EBEBEB] px-5 font-[16px] text-[#6E6E6E] outline-none',
          right && 'pr-12',
        )}
      />
      {right}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const cards = location.state?.registeredCards ?? EXAMPLE_CARDS;
  const [form, setForm] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading

  useEffect(() => {
    if (status !== 'loading') return;
    // Replace this preview delay with the card API response.
    const timer = window.setTimeout(() => setStatus('complete'), 1500);
    return () => window.clearTimeout(timer);
  }, [status]);

  const isValid = form.id.trim() !== '' && form.password !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(''); // 다시 입력하면 에러 해제
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      // TODO: 로그인 API 연동 (form, autoLogin 사용)
      setStatus('loading');
      // TODO: 카드 정보 불러온 뒤 navigate('/') 등 홈으로 이동
    } catch {
      setStatus('idle');
      setError('잘못된 비밀번호입니다. 다시시도하세요.');
    }
  };

  /* 로그인 완료 → 카드 정보 불러오는 화면 */
  if (status === 'loading' || status === 'complete') {
    return <LoginResult cards={cards} loading={status === 'loading'} />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-neutral-100 px-5">
      <div className="h-[62px] w-max"></div>
      {/* 상단 뒤로가기 */}
      <header className="flex h-12 items-center">
        <button
          type="button"
          onClick={() => navigate('/onboarding', { state: { back: true } })}
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="size-6 cursor-pointer text-[#CACACA]" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="group flex flex-1 flex-col">
        {/* 타이틀 */}
        <div className="mt-6">
          <h1 className="text-[24px] font-semibold text-[#121212]">
            다시 만나서 반가워요
          </h1>
          <p className="font-regular mt-2 text-[16px] text-[#4B4B4B]">
            아이디와 비밀번호를 입력해주세요
          </p>
        </div>

        {/* 입력 영역 */}
        <div className="mt-16 flex flex-col gap-[18px]">
          <FloatingField
            label="아이디"
            name="id"
            value={form.id}
            onChange={handleChange}
          />

          <FloatingField
            label="비밀번호"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            error={error}
            right={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="비밀번호 보기 전환"
                className="absolute top-1/2 right-4 -translate-y-1/2"
              >
                {showPassword ? (
                  <img src={eye} alt="" />
                ) : (
                  <img src={eyeclose} alt="" />
                )}
              </button>
            }
          />

          {/* 에러 문구*/}
          {error && (
            <p className="flex items-center gap-1 text-[12px] text-[#EE695D]">
              <img src={warning} className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-[14px] text-[#8E8E8E]">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="peer sr-only"
              />
              <span className="flex size-5 cursor-pointer items-center justify-center rounded-[0.8px] border-[2.5px] border-[#CACACA] text-transparent transition-colors peer-checked:bg-[#CACACA] peer-checked:text-[#FAFAFA]">
                <Check className="size-4" strokeWidth={3} />
              </span>
              자동 로그인
            </label>
            <button type="button" className="cursor-pointer">
              비밀번호 찾기
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button
          type="submit"
          disabled={!isValid}
          className={cn(
            'mt-auto mb-11 h-12 h-[54px] cursor-pointer items-center justify-center rounded-[8px] p-[10px] text-[20px] font-semibold transition-colors group-has-[input[name]:focus]:rounded-[27px]',
            isValid
              ? 'bg-[#A3B1FF] text-[#3B426B]'
              : 'bg-[#DBE1FF] text-[#B2BEFF]',
          )}
        >
          로그인
        </button>
      </form>
    </div>
  );
}

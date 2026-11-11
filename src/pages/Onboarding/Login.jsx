import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeclose from '@/assets/onboarding/eyeclose.svg';
import warning from '@/assets/onboarding/Warning.svg';
import login_check from '@/assets/onboarding/login_check.svg';

/*상단 아이디, 비밀번호*/
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
      <label
        htmlFor={name}
        className={cn(
          'pointer-events-none absolute left-5 z-10 text-[#8E8E8E]',
          floated
            ? '-top-[7px] bg-none text-[10px] leading-none'
            : 'top-1/2 -translate-y-1/2 bg-transparent text-[16px]',
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
          'h-12 w-full rounded-lg border bg-[#EBEBEB] px-5 outline-none',
          focused ? 'border-[#CACACA]' : 'border-transparent',
          error && 'border-[#F8C5C0]',
        )}
      />
      {right}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading

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
  if (status === 'loading') {
    return (
      <div className="mx-auto flex min-h-screen max-w-[402px] flex-col items-center justify-center overflow-hidden bg-[#F1F1F1]">
        <img src={login_check} className="mt-[190px] h-20 w-20" />
        <h1 className="mt-7 text-[24px] font-semibold text-[#3B426B]">
          로그인 완료!
        </h1>
        <p className="font-regular mt-2 text-[16px] text-[#8E8E8E]">
          카드 정보를 불러오고 있어요...
        </p>

        {/* 카드 스켈레톤 */}
        <div className="mt-12 flex w-full items-center justify-center gap-4">
          <div className="h-[340px] w-[215px] shrink-0 rounded-[14px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2] shadow-[0_0_12px_rgba(0,0,0,0.04)]" />
          <div className="h-[340px] w-[215px] shrink-0 rounded-[14px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2] shadow-[0_0_12px_rgba(0,0,0,0.04)]" />
          <div className="h-[340px] w-[215px] shrink-0 rounded-[14px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2] shadow-[0_0_12px_rgba(0,0,0,0.04)]" />
        </div>
      </div>
    );
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
          <ChevronLeft className="size-6 text-neutral-400" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
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
            'mt-auto mb-11 h-12 h-[54px] cursor-pointer items-center justify-center rounded-[27px] p-[10px] text-[20px] font-semibold transition-colors',
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

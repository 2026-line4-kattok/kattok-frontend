import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeoff from '@/assets/onboarding/eyeclose.svg';

const STEPS = [1, 2, 3, 4];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  const isValid = form.id.trim() !== '' && form.password !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: 회원가입 API 연동, 성공 시 다음 step으로 이동
  };

  // 뒤로 가기: 1단계면 이전 페이지, 아니면 이전 단계
  const handleBack = () => {
    if (step === 1) navigate(-1);
    else setStep((prev) => prev - 1);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-neutral-100 px-5">
      {/* 상단: 뒤로가기 + 스텝 인디케이터 */}
      <header className="relative flex h-14 items-center">
        <button type="button" onClick={handleBack} aria-label="뒤로 가기">
          <ChevronLeft className="size-6 text-neutral-400" />
        </button>

        <div className="absolute left-1/2 flex -translate-x-1/2 gap-2">
          {STEPS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n)}
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-[10px] font-medium',
                step === n
                  ? 'bg-indigo-400 text-white'
                  : 'bg-indigo-100 text-indigo-300',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </header>

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="mt-4">
            <h1 className="text-xl font-bold">만나서 반가워요!</h1>
            <p className="mt-1 text-xs text-neutral-600">
              아이디와 비밀번호를 입력해주세요
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-3">
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="아이디"
              className="h-12 rounded-[8px] bg-[#EBEBEB] px-4 text-sm outline-none focus:ring-2 focus:ring-[#CACACA]"
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호"
                className="h-12 w-full rounded-[8px] bg-[#EBEBEB] px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#CACACA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="비밀번호 보기 전환"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400"
              >
                {showPassword ? (
                  <img src={eye} alt="" />
                ) : (
                  <img src={eyeoff} alt="" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="size-4"
                />
                자동 로그인
              </label>
              <button type="button">비밀번호 찾기</button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={cn(
              'mt-auto mb-6 h-12 rounded-lg text-sm font-semibold transition-colors',
              isValid
                ? 'bg-indigo-400 text-white'
                : 'bg-indigo-100 text-indigo-300',
            )}
          >
            회원가입
          </button>
        </form>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
          {step}단계 화면 (준비 중)
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axiosInstance';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeclose from '@/assets/onboarding/eyeclose.svg';
import warning from '@/assets/onboarding/Warning.svg';

import LoginResult from './LoginResult';
import {
  canRestoreAutoLogin,
  clearAuthSession,
  saveAuthSession,
} from './authSession';

import { toOwnedCardView } from '@/pages/Card/ownedCardMapper';

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
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [restoringAutoLogin] = useState(canRestoreAutoLogin);
  const [autoLogin, setAutoLogin] = useState(restoringAutoLogin);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(restoringAutoLogin ? 'loading' : 'idle'); // idle | loading

  useEffect(() => {
    if (!restoringAutoLogin) return;
    const controller = new AbortController();
    api
      .get('/v1/users/me', { signal: controller.signal })
      .then(() => api.get('/v1/owned-cards', { signal: controller.signal }))
      .then((ownedCards) => {
        if (!Array.isArray(ownedCards))
          throw new Error('Invalid owned cards response');
        if (controller.signal.aborted) return;
        setCards(ownedCards.map(toOwnedCardView));
        setStatus('complete');
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.response?.status === 401) {
          clearAuthSession();
          setStatus('idle');
          setError(
            '\uB85C\uADF8\uC778\uC774 \uB9CC\uB8CC\uB410\uC5B4\uC694. \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574\uC8FC\uC138\uC694.',
          );
        } else {
          setStatus('cards-error');
        }
      });
    return () => controller.abort();
  }, [restoringAutoLogin]);

  const isValid =
    form.id.trim() !== '' &&
    form.id.trim().length <= 254 &&
    form.password !== '' &&
    form.password.length <= 64;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(''); // 다시 입력하면 에러 해제
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || status !== 'idle') return;

    setError('');
    setStatus('authenticating');

    try {
      const result = await api.post('/v1/auth/login', {
        email: form.id.trim(),
        password: form.password,
      });

      if (!result?.accessToken) {
        setError('로그인 응답을 확인할 수 없습니다. 다시 시도해주세요.');
        setStatus('idle');
        return;
      }

      saveAuthSession(result, autoLogin);
    } catch (err) {
      const httpStatus = err.response?.status;

      setError(
        httpStatus === 401
          ? '이메일 또는 비밀번호가 맞지 않습니다.'
          : '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
      setStatus('idle');
      return;
    }

    setStatus('loading');

    try {
      const ownedCards = await api.get('/v1/owned-cards');

      if (!Array.isArray(ownedCards)) {
        throw new Error('Invalid owned cards response');
      }

      setCards(ownedCards.map(toOwnedCardView));
      setStatus('complete');
    } catch {
      setStatus('cards-error');
    }
  };
  if (status === 'cards-error') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-6 bg-neutral-100 px-5">
        <p role="alert" className="text-center text-[#4B4B4B]">
          로그인은 완료됐지만 카드 정보를 불러오지 못했어요.
          <br />
          홈에서 다시 확인해주세요.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-[#A3B1FF] px-6 py-3 text-[#3B426B]"
        >
          홈으로 가기
        </button>
      </div>
    );
  }
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
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => setError('현재 비밀번호 찾기는 제공하지 않아요.')}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button
          type="submit"
          disabled={!isValid || status !== 'idle'}
          className={cn(
            'mt-auto mb-11 h-12 h-[54px] cursor-pointer items-center justify-center rounded-[8px] p-[10px] text-[20px] font-semibold transition-colors group-has-[input[name]:focus]:rounded-[27px]',
            isValid
              ? 'bg-[#A3B1FF] text-[#3B426B]'
              : 'bg-[#DBE1FF] text-[#B2BEFF]',
          )}
        >
          {status === 'authenticating' ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}

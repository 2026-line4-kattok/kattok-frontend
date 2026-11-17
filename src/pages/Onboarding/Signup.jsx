import { useEffect, useRef, useState } from 'react';
import { toOnboardingCardView } from './onboardingCardImages';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeoff from '@/assets/onboarding/eyeclose.svg';
import warning from '@/assets/onboarding/Warning.svg';
//로고 이미지
import kb from '@/assets/onboarding/국민.png';
import wr from '@/assets/onboarding/우리은행.png';
import sh from '@/assets/onboarding/신한은행.png';
import hn from '@/assets/onboarding/하나은행.png';
import bc from '@/assets/onboarding/bc카드.png';
import ss from '@/assets/onboarding/삼성카드.png';
import hd from '@/assets/onboarding/현대.png';
import ts from '@/assets/onboarding/토스.png';

import search from '@/assets/onboarding/Search.svg';

import help from '@/assets/onboarding/help.svg';
import api from '@/api/axiosInstance';
import { getSpendingOptions, registerProduct } from './signupPerformance';
import { saveAuthSession } from './authSession';
import { dissolve } from './dissolve';
import PolicyService from '@/pages/Mypage/PolicyService';
import PolicyPrivacy from '@/pages/Mypage/PolicyPrivacy';
const STEPS = [1, 2, 3, 4];

// 로고 연결용 정보입니다. 카드사 목록과 순서는 서버 응답을 사용합니다.
const COMPANIES = [
  { id: 'kb', name: '국민은행', cardLabel: '국민카드', logo: kb },
  { id: 'woori', name: '우리은행', cardLabel: '우리카드', logo: wr },
  { id: 'shinhan', name: '신한은행', cardLabel: '신한카드', logo: sh },
  { id: 'hana', name: '하나은행', cardLabel: '하나카드', logo: hn },
  { id: 'bc', name: 'BC카드', cardLabel: 'BC카드', logo: bc },
  { id: 'samsung', name: '삼성카드', cardLabel: '삼성카드', logo: ss },
  { id: 'hyundai', name: '현대카드', cardLabel: '현대카드', logo: hd },
  { id: 'toss', name: '토스뱅크', cardLabel: '토스뱅크 카드', logo: ts },
];

const FILTERS = ['전체', '신용카드', '체크카드'];

const SHELL =
  'mx-auto flex min-h-screen max-w-[402px] flex-col bg-[#F1F1F1] px-[18px]';

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
      {/* 테두리 전용 레이어: legend 폭만큼 윗선이 자동으로 끊김 */}
      <fieldset
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-[-5px] bottom-0 m-0 rounded-[8px] border px-5 py-0 transition-colors',
          error
            ? 'border-[#F8C5C0]'
            : focused
              ? 'border-[#B3B3B3]'
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
          'h-12 w-full rounded-lg bg-[#EBEBEB] px-5 text-[16px] outline-none',
          right && 'pr-12',
        )}
      />
      {right}
    </div>
  );
}

/* 하단 고정 버튼 */
function Footer({ children }) {
  return (
    <div className="sticky bottom-0 mt-auto bg-[#F1F1F1] pb-11">{children}</div>
  );
}

function PrimaryButton({
  disabled,
  onClick,
  type = 'button',
  children,
  className,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-[54px] w-full cursor-pointer rounded-[27px] text-[20px] font-semibold transition-colors disabled:cursor-not-allowed',
        disabled
          ? 'bg-[#DBE1FF] text-[#B2BEFF]'
          : 'bg-[#A3B1FF] text-[#3B426B]',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* 로고/카드 이미지 자리 (이미지가 없으면 회색 박스) */
function Thumb({ src, text, className }) {
  return src ? (
    <img src={src} alt={text} className={cn('object-contain', className)} />
  ) : (
    <div
      className={cn(
        'flex items-center justify-center bg-[#D9D9D9] text-[10px] text-[#8E8E8E]',
        className,
      )}
    >
      {text}
    </div>
  );
}

/* 회원가입 완료 / 불러오기 완료 화면 공통 상단 */
function LandscapeCard({ src, text, className, isHorizontal = false }) {
  return (
    <div
      className={cn(
        'relative aspect-[148/94] overflow-hidden rounded-[8px]',
        className,
      )}
    >
      <Thumb
        src={src}
        text={text}
        className={isHorizontal ? 'h-full w-full' : 'absolute top-1/2 left-1/2 h-[157.45%] w-[63.51%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-270'}
      />
    </div>
  );
}

function DoneHead({ title, desc }) {
  return (
    <>
      <div className="flex size-16 items-center justify-center rounded-full bg-[#CDD3FF]">
        <Check className="size-8 text-[#F4F5FF]" strokeWidth={3} />
      </div>
      <h1 className="mt-6 text-[18px] font-semibold text-[#3B426B]">{title}</h1>
      <p className="mt-1 text-[12px] text-[#8E8E8E]">{desc}</p>
    </>
  );
}

/* ───────── 페이지 ───────── */

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setScreen] = useState('steps'); // steps | welcome | done
  const [step, setStep] = useState(location.state?.initialStep === 2 ? 2 : 1);
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  // 1단계
  const [form, setForm] = useState({ id: '', password: '' });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');
  // 2단계
  const [company, setCompany] = useState(null);
  // 3단계
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('전체');
  const [card, setCard] = useState(null);
  // 4단계
  const [spending, setSpending] = useState(null);
  const [performanceResult, setPerformanceResult] = useState(null);
  const [performanceRetry, setPerformanceRetry] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const registrationLock = useRef(false);
  const selectionLock = useRef(false);

  const pwFilled = form.password !== '';
  const pwValid =
    form.password.length >= 8 &&
    form.password.length <= 64 &&
    new TextEncoder().encode(form.password).length <= 72;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.id.trim());

  const isValid =
    emailValid &&
    form.id.trim().length <= 254 &&
    pwValid &&
    form.password.length <= 64 &&
    termsAgreed;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* 검색: 입력이 멈추고 0.5초 뒤 결과 반영 (그동안 로딩 화면) */
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(query);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query]);

  // 서버의 카드사 ID를 사용합니다. 기존 COMPANIES는 로고 연결용입니다.
  useEffect(() => {
    if (step !== 2) return;

    let cancelled = false;

    const normalizeIssuer = (value = '') =>
      value.toLowerCase().replace(/kb|은행|카드|\s/g, '');

    async function loadIssuers() {
      try {
        const issuers = await api.get('/v1/card-issuers');

        if (!Array.isArray(issuers)) {
          throw new Error('Invalid issuer response');
        }

        if (cancelled) return;

        setCatalogError('');
        setCompanies(
          issuers.map((issuer) => {
            const companyInfo = COMPANIES.find(
              (item) =>
                normalizeIssuer(item.name) === normalizeIssuer(issuer.name),
            );

            return {
              ...issuer,
              logo: companyInfo?.logo,
              cardLabel: issuer.name,
            };
          }),
        );
      } catch {
        if (!cancelled) {
          setCatalogError(
            '카드사 목록을 불러오지 못했어요. 다시 시도해주세요.',
          );
        }
      }
    }

    loadIssuers();

    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    if (step !== 3 || company == null) return;

    let cancelled = false;

    async function loadProducts() {
      await Promise.resolve();
      if (cancelled) return;
      setCardsLoading(true);
      setCatalogError('');
      setProducts([]);
      try {
        const result = await api.get('/v1/card-products', {
          params: {
            issuerId: company,
            ...(debounced.trim() && { keyword: debounced.trim() }),
            ...(filter !== '전체' && {
              cardType: filter === '신용카드' ? 'CREDIT' : 'CHECK',
            }),
          },
        });

        if (!Array.isArray(result)) {
          throw new Error('Invalid product response');
        }

        if (cancelled) return;

        setProducts(
          result.map((product) => {
            const view = toOnboardingCardView({
              id: product.id,
              product: {
                ...product,
                issuerName: product.issuer?.name ?? '',
              },
            });

            return {
              ...view,
              owned: product.owned,
            };
          }),
        );
      } catch {
        if (!cancelled) {
          setCatalogError('카드 목록을 불러오지 못했어요. 다시 시도해주세요.');
        }
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [step, company, debounced, filter]);

  useEffect(() => {
    if (step !== 4 || card == null) return;
    if (
      performanceResult?.productId === card &&
      (performanceResult.product || performanceResult.error)
    )
      return;
    const controller = new AbortController();
    api
      .get(`/v1/card-products/${card}`, { signal: controller.signal })
      .then((product) => {
        if (
          !product ||
          product.id !== card ||
          !Array.isArray(product.performanceTiers)
        ) {
          throw new Error('Invalid card product detail');
        }
        if (!controller.signal.aborted)
          setPerformanceResult({ productId: card, product });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setPerformanceResult({ productId: card, error });
      });
    return () => controller.abort();
  }, [step, card, performanceRetry, performanceResult]);

  const performanceProduct =
    performanceResult?.productId === card ? performanceResult.product : null;
  const performanceError =
    performanceResult?.productId === card && performanceResult.error;
  const performanceLoading =
    card != null && !performanceProduct && !performanceError;
  const spendingOptions = getSpendingOptions(performanceProduct);

  const searching = cardsLoading || query !== debounced;
  const typeFiltered = products;
  const searchResults = products;
  const selectedCard = products.find((item) => item.id === card);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setSignupError('');

    try {
      const result = await api.post(
        '/v1/auth/signup',
        {
          email: form.id.trim(),
          password: form.password,
          termsAgreed,
        },
        {
          transformRequest: [
            (data, headers) => {
              headers.delete('Authorization');
              return data;
            },
            ...api.defaults.transformRequest,
          ],
        },
      );

      if (!result?.accessToken) {
        setSignupError(
          '회원가입 응답을 확인하지 못했어요. 로그인 화면에서 가입 여부를 확인해주세요.',
        );
        return;
      }

      saveAuthSession(result);
      await dissolve(() => {
        setForm({ id: '', password: '' });
        setStep(2);
      });
    } catch (err) {
      setSignupError(
        err.response?.data?.message ||
          '회원가입하지 못했어요. 네트워크 상태를 확인하고 다시 시도해주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (submitting || registrationLock.current || selectionLock.current) return;

    if (step <= 2) {
      navigate('/onboarding', { state: { back: true } });
      return;
    }

    setStep((prev) => prev - 1);
  };

  const resetCard = () => {
    setCompany(null);
    setQuery('');
    setDebounced('');
    setFilter('전체');
    setCard(null);
    setSpending(null);
    setStep(2);
    setScreen('steps');
  };

  /* 건너뛰기 → 회원가입 완료 화면 */
  const handleSkip = () => {
    if (!registrationLock.current && !selectionLock.current) navigate('/');
  };

  const handleRegisterCard = async (
    product = performanceProduct,
    selection = spending,
  ) => {
    if (registrationLock.current) return;
    registrationLock.current = true;
    setRegistering(true);
    setCatalogError('');
    try {
      const registered = await registerProduct(api, product, selection);
      if (!registered?.id || registered.product?.id !== product.id)
        throw new Error('등록 결과를 확인하지 못했어요. 다시 시도해주세요.');
      await dissolve(() => setScreen('done'));
    } catch (error) {
      setCatalogError(
        error.response?.data?.message ||
          error.message ||
          '카드를 등록하지 못했어요. 다시 시도해주세요.',
      );
    } finally {
      registrationLock.current = false;
      setRegistering(false);
    }
  };

  const handleSelectCard = async (item) => {
    if (item.owned || registrationLock.current || selectionLock.current) return;
    selectionLock.current = true;
    setSelecting(true);
    setCard(item.id);
    setSpending(null);
    setPerformanceResult(null);
    setCatalogError('');
    try {
      const product = await api.get(`/v1/card-products/${item.id}`);
      if (product?.id !== item.id || !Array.isArray(product.performanceTiers))
        throw new Error('카드 정보를 다시 확인해주세요.');
      setPerformanceResult({ productId: item.id, product });
      if (['NONE', 'NEEDS_CHECK'].includes(product.performanceType)) {
        await handleRegisterCard(product);
      } else {
        setStep(4);
      }
    } catch (error) {
      setCatalogError(
        error.response?.data?.message ||
          '카드 정보를 불러오지 못했어요. 다시 선택해주세요.',
      );
    } finally {
      selectionLock.current = false;
      setSelecting(false);
    }
  };
  if (policy) {
    return (
      <div className={cn(SHELL, 'pb-8')}>
        <header className="mt-[62px] flex h-14 shrink-0 items-center">
          <button
            type="button"
            onClick={() => setPolicy(null)}
            aria-label="회원가입으로 돌아가기"
            className="cursor-pointer"
          >
            <ChevronLeft className="size-6 text-[#CACACA]" />
          </button>
        </header>
        {policy === 'terms' ? <PolicyService /> : <PolicyPrivacy />}
      </div>
    );
  }

  /* ── 회원가입 완료 (카드 등록 안내) ── */
  if (screen === 'welcome') {
    return (
      <div className={cn(SHELL, 'items-center pt-[200px]')}>
        <DoneHead title="회원가입 완료!" desc="이어서 카드를 등록해요" />
        <div className="mt-8 h-[160px] w-full animate-pulse rounded-[24px] bg-[#D6D6D6]" />
        <div className="mt-auto flex w-full flex-col items-center gap-3 pb-11">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-regular h-[22px] cursor-pointer text-[16px] text-[#B3B3B3]"
          >
            건너뛰기
          </button>
          <PrimaryButton onClick={resetCard}>카드 등록하기</PrimaryButton>
        </div>
      </div>
    );
  }

  /* ── 불러오기 완료 ── */
  if (screen === 'done') {
    return (
      <div className={cn(SHELL, 'items-center pt-[184px]')}>
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#CDD3FF]">
          <Check className="size-12 text-[#F4F5FF]" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-[22px] font-semibold text-[#3B426B]">
          불러오기 완료!
        </h1>
        <p className="mt-2 text-center text-[16px] text-[#8E8E8E]">
          홈에서 다음 결제의 유리한 카드를 확인해요
        </p>
        <LandscapeCard
          src={selectedCard?.image}
          isHorizontal={selectedCard?.isHorizontal}
          text={selectedCard?.name ?? '카드'}
          className="mt-6 w-[calc(100%-24px)] shrink-0 rounded-[14px]"
        />
        <div className="mt-auto flex w-full flex-col items-center gap-4 pt-8 pb-11">
          <button
            type="button"
            onClick={resetCard}
            className="h-12 cursor-pointer text-[18px] font-semibold text-[#3B426B]"
          >
            다른 카드 등록하기
          </button>
          <PrimaryButton
            className="rounded-[8px]"
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </PrimaryButton>
        </div>
      </div>
    );
  }

  /* ── 1~4단계 ── */
  return (
    <div
      className={cn(
        SHELL,
        step === 3 &&
          'h-dvh min-h-0 [scrollbar-width:none] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden',
      )}
    >
      {/* 상단: 뒤로가기 + 스텝 인디케이터 + 건너뛰기 */}
      <header className="relative mt-[62px] flex h-14 shrink-0 items-center">
        <button type="button" onClick={handleBack} aria-label="뒤로 가기">
          <ChevronLeft className="size-6 cursor-pointer text-[#CACACA]" />
        </button>

        <div className="absolute left-1/2 flex -translate-x-1/2 gap-2">
          {STEPS.map((n) => (
            <button
              key={n}
              type="button"
              disabled={submitting || registering || selecting}
              onClick={() => setStep(n)}
              className={cn(
                'flex size-6 cursor-pointer items-center justify-center rounded-full text-[16px] font-normal',
                step === n
                  ? 'bg-[#8C9EFF] text-[#F4F5FF]'
                  : 'bg-[#DBE1FF] text-[#A3B1FF]',
              )}
            >
              {n}
            </button>
          ))}
        </div>

        {step >= 2 && (
          <button
            type="button"
            onClick={handleSkip}
            className="ml-auto cursor-pointer text-[14px] text-[#8E8E8E]"
          >
            건너뛰기
          </button>
        )}
      </header>

      {catalogError && step !== 3 && (
        <p role="alert" className="my-4 text-[14px] text-[#EE695D]">{catalogError}</p>
      )}

      {/* 1단계: 아이디 / 비밀번호 */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="group flex flex-1 flex-col">
          <div className="mt-6">
            <h1 className="text-[24px] font-semibold text-[#121212]">
              만나서 반가워요!
            </h1>
            <p className="mt-2 text-[16px] font-normal text-[#4B4B4B]">
              아이디와 비밀번호를 입력해주세요
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-[18px]">
            <FloatingField
              label="아이디"
              name="id"
              value={form.id}
              onChange={handleChange}
            />

            <div>
              <FloatingField
                label="비밀번호"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={pwFilled && !pwValid}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="비밀번호 보기 전환"
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                  >
                    <img src={showPassword ? eye : eyeoff} alt="" />
                  </button>
                }
              />

              {/* 형식 안내: 에러(빨강) / 사용 가능(초록) */}
              {pwFilled && !pwValid && (
                <p className="mt-[3.5px] flex items-center gap-1 text-[12px] text-[#EE695D]">
                  <img src={warning} alt="" className="size-4 shrink-0" />
                  비밀번호는 8~64자, UTF-8 기준 72바이트 이내로 입력해주세요.
                </p>
              )}
              {pwFilled && pwValid && (
                <p className="mt-2 text-[12px] text-[#3FB179]">
                  사용 가능한 형식입니다.
                </p>
              )}
            </div>
          </div>
          <label className="mt-6 mb-2 flex items-center gap-2 font-[Pretendard] text-[16px] leading-[1.4] font-normal tracking-[0px] text-[#8E8E8E]">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              disabled={submitting || registering || selecting}
              className="peer sr-only"
            />
            <span className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[0.8px] border-[2.5px] border-[#CACACA] text-[#ffffff] text-transparent transition-colors peer-checked:bg-[#CACACA] peer-checked:text-[#FAFAFA]">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span className="flex min-w-0 items-baseline gap-1">
              <span className="shrink-0">[필수]</span>
              <span>서비스 약관 및 개인정보 처리 동의</span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2 text-[14px] leading-[1.4] text-[#B3B3B3]">
            <button
              type="button"
              onClick={() => setPolicy('terms')}
              className="cursor-pointer"
            >
              서비스 이용약관 보기
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setPolicy('privacy')}
              className="cursor-pointer"
            >
              개인정보 처리 동의
            </button>
          </div>

          {signupError && (
            <p role="alert" className="mb-4 text-[14px] text-[#EE695D]">
              {signupError}
            </p>
          )}

          <Footer>
            <PrimaryButton
              type="submit"
              disabled={!isValid || submitting}
              className="rounded-[8px] group-has-[input[name]:focus]:rounded-[27px]"
            >
              {submitting ? '가입 중...' : '회원가입'}
            </PrimaryButton>
          </Footer>
        </form>
      )}

      {/* 2단계: 카드사 선택 */}
      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <div className="mt-6">
            <h1 className="text-[24px] font-semibold text-[#121212]">
              어떤 카드사를 사용하시나요?
            </h1>
            <p className="font-regualr mt-2 mb-6 text-[16px] text-[#4B4B4B]">
              사용 중인 카드사를 선택해주세요
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {companies.map((c) => {
              const selected = company === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCompany(c.id);
                    setQuery('');
                    setDebounced('');
                    setFilter('전체');
                    setCard(null);
                    setSpending(null);
                    setProducts([]);
                    setCatalogError('');
                    setStep(3);
                  }}
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded-lg border transition-colors',
                      selected
                        ? 'border-[#3B426B] bg-[#DBE1FF]'
                        : 'border-transparent bg-[#EBEBEB]',
                    )}
                  >
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt=""
                        className="size-[114px] object-contain"
                      />
                    ) : (
                      <span className="text-[12px] text-[#8E8E8E]">
                        {c.name[0]}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[16px]',
                      selected ? 'text-[#7F90E8]' : 'text-[#8E8E8E]',
                    )}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3단계: 카드 선택 (검색) */}
      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <div className="mt-6">
            <h1 className="text-[24px] font-semibold text-[#121212]">
              어떤{' '}
              {companies.find((c) => c.id === company)?.cardLabel ?? '카드'}를
              사용하시나요?
            </h1>
            <p className="font-regular mt-2 mb-6 text-[16px] text-[#4B4B4B]">
              카드 이름을 검색하거나 목록에서 선택해주세요.
            </p>
          </div>

          {/* 검색창 */}
          <div className="relative mt-6">
            <input
              value={query}
              onChange={handleSearch}
              placeholder="검색"
              className="h-12 w-full rounded-[8px] border border-transparent bg-[#EBEBEB] py-[3px] pr-2 pl-5 text-[16px] text-[#6E6E6E] outline-none placeholder:text-[#8E8E8E] focus:border-[#E1E1E1]"
            />
            <img
              src={search}
              className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2"
            />
          </div>

          {/* 필터 칩 */}
          <div className="mt-4 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'h-9 cursor-pointer rounded-[27px] border px-3 text-[16px] transition-colors',
                  filter === f
                    ? 'border-[#8C9EFF] bg-[#8C9EFF] text-[#F4F5FF]'
                    : 'border-[#CACACA] text-[#8E8E8E]',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {(selecting || registering || catalogError) && (
            <div className="sticky top-0 z-10 bg-[#F1F1F1] py-3 text-[14px]">
              {catalogError ? (
                <p role="alert" className="text-[#EE695D]">{catalogError}</p>
              ) : (
                <p role="status" className="text-[#4B4B4B]">
                  {registering ? '카드를 등록하고 있어요...' : '카드의 실적 조건을 확인하고 있어요...'}
                </p>
              )}
            </div>
          )}

          <div className="mt-[30px] pb-6">
            {query.trim() === '' && (
              <div className="grid grid-cols-3 gap-x-3 gap-y-[18px]">
                {typeFiltered.map((c) => {
                  const isSelected = card === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={c.owned || registering || selecting}
                      onClick={() => handleSelectCard(c)}
                      className="flex w-full min-w-0 cursor-pointer flex-col gap-1"
                    >
                      <div
                        className={cn(
                          'relative aspect-[114/180] w-full overflow-hidden rounded-[8px] border',
                          isSelected
                            ? 'border-[#3B426B]'
                            : 'border-transparent',
                        )}
                      >
                        <Thumb
                          src={c.image}
                          text=""
                          className={c.isHorizontal ? 'absolute top-1/2 left-1/2 h-[63.33%] w-[157.89%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90' : 'h-full w-full'}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#3B426BBF]" />
                        )}
                        {isSelected && (selecting || registering) && (
                          <span className="absolute inset-0 flex items-center justify-center text-[14px] text-white">
                            {registering ? '등록 중...' : '확인 중...'}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'w-full text-center text-[16px] whitespace-pre-line',
                          isSelected ? 'text-[#7F90E8]' : 'text-[#8E8E8E]',
                        )}
                      >
                        {c.name.replace(' ', '\n')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {/* 검색 중*/}
            {searching && (
              <div className="flex flex-col gap-3">
                <div className="h-[96px] rounded-[8px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2]" />
                <div className="h-[96px] rounded-[8px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2]" />
              </div>
            )}

            {/* 검색 결과 */}
            {query.trim() !== '' && !searching && searchResults.length > 0 && (
              <div className="flex flex-col gap-3">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={c.owned || registering || selecting}
                    onClick={() => handleSelectCard(c)}
                    className={cn(
                      'flex h-[96px] w-full cursor-pointer items-stretch overflow-hidden rounded-[8px] bg-[#EBEBEB] text-left transition-colors',
                    )}
                  >
                    <div className="relative h-full w-[148px] shrink-0 overflow-hidden rounded-[8px]">
                      <img
                        src={c.image}
                        alt=""
                        className={c.isHorizontal ? 'h-full w-full object-contain' : 'absolute top-1/2 left-1/2 h-[148px] w-[94px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-270 object-contain'}
                      />
                    </div>
                    <span className="flex min-w-0 flex-1 items-center justify-center px-3 text-center text-[14px] text-[#8E8E8E]">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 검색 결과 없음 */}
            {query.trim() !== '' &&
              !searching &&
              !catalogError &&
              searchResults.length === 0 && (
                <div className="mt-[155.5px] flex flex-col items-center">
                  <img src={help} className="h-20 w-20" />
                  <p className="mt-7 text-[20px] font-semibold text-[#3B426B]">
                    일치하는 카드 상품이 없어요
                  </p>
                  <p className="mt-2 text-[16px] text-[#8E8E8E]">
                    &apos;{debounced}&apos;에 대한 검색 결과가 없어요.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* 4단계: 전월 실적 확인 */}
      {step === 4 && (
        <div className="flex flex-1 flex-col">
          <div className="mt-6">
            <h1 className="text-[24px] font-semibold text-[#121212]">
              지난달 얼마나 사용하셨나요?
            </h1>
            <p className="font-regular mt-2 text-[16px] text-[#4B4B4B]">
              카드사 앱의 전월 실적을 확인해주세요
            </p>
          </div>

          {/* 선택한 카드 */}
          <div className="mt-12 flex h-[96px] shrink-0 items-center overflow-hidden rounded-[8px] bg-[#EBEBEB]">
            <LandscapeCard
              src={selectedCard?.image}
              isHorizontal={selectedCard?.isHorizontal}
              text=""
              className="w-[152px] shrink-0"
            />
            <span className="flex min-w-0 flex-1 items-center justify-center px-3 text-center text-[16px] text-[#8E8E8E]">
              {selectedCard?.name ?? '선택한 카드'}
            </span>
          </div>

          {card == null && (
            <p role="alert" className="mt-6 text-[14px] text-[#EE695D]">
              {
                '\uBA3C\uC800 \uCE74\uB4DC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.'
              }
            </p>
          )}
          {performanceLoading && (
            <p role="status" className="mt-6 text-[14px] text-[#8E8E8E]">
              {
                '\uC2E4\uC801 \uC870\uAC74\uC744 \uBD88\uB7EC\uC624\uACE0 \uC788\uC5B4\uC694...'
              }
            </p>
          )}
          {performanceError && (
            <div className="mt-6 text-[14px] text-[#EE695D]" role="alert">
              <p>
                {
                  '\uC2E4\uC801 \uC870\uAC74\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.'
                }
              </p>
              <button
                type="button"
                className="mt-2 underline"
                onClick={() => {
                  setPerformanceResult(null);
                  setPerformanceRetry((value) => value + 1);
                }}
              >
                {'\uB2E4\uC2DC \uC2DC\uB3C4'}
              </button>
            </div>
          )}
          {performanceProduct?.performanceType === 'NONE' && (
            <p className="mt-6 text-[14px] text-[#8E8E8E]">
              {
                '\uC774 \uCE74\uB4DC\uB294 \uC804\uC6D4 \uC2E4\uC801 \uC785\uB825 \uC5C6\uC774 \uB4F1\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.'
              }
            </p>
          )}

          {/* 실적 선택 (라디오) */}
          <div className="mt-6 mb-8 divide-y divide-[#DCDCDC] rounded-[8px] bg-[#EBEBEB]">
            {spendingOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={spending === s.id}
                onClick={() => setSpending(s.id)}
                className="flex min-h-[96px] w-full cursor-pointer items-center justify-between gap-3 px-[18px] py-6 text-left"
              >
                <div>
                  <p className="text-[16px] font-medium text-[#3B426B]">
                    {s.title}
                  </p>
                  <p className="mt-1 text-[14px] text-[#8E8E8E]">{s.desc}</p>
                </div>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-[3px]',
                    spending === s.id ? 'border-[#CACACA]' : 'border-[#CACACA]',
                  )}
                >
                  {spending === s.id && (
                    <span className="size-3 rounded-full bg-[#CACACA]" />
                  )}
                </span>
              </button>
            ))}
          </div>

          <Footer>
            <PrimaryButton
              className="rounded-[8px]"
              disabled={
                registering ||
                card == null ||
                performanceLoading ||
                Boolean(performanceError) ||
                (!spending &&
                  !['NONE', 'NEEDS_CHECK'].includes(
                    performanceProduct?.performanceType,
                  ))
              }
              onClick={() => handleRegisterCard()}
            >
              {registering ? '등록 중...' : '카드 등록하기'}
            </PrimaryButton>
          </Footer>
        </div>
      )}
    </div>
  );
}

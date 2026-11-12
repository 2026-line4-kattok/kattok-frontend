import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import eye from '@/assets/onboarding/eye.svg';
import eyeoff from '@/assets/onboarding/eyeclose.svg';
import warning from '@/assets/onboarding/Warning.svg';
import kb from '@/assets/onboarding/국민.png';
import wr from '@/assets/onboarding/우리은행.png';
import sh from '@/assets/onboarding/신한은행.png';
import hn from '@/assets/onboarding/하나은행.png';
import bc from '@/assets/onboarding/bc카드.png';
import ss from '@/assets/onboarding/삼성카드.png';
import hd from '@/assets/onboarding/현대.png';
import ts from '@/assets/onboarding/토스.png';
import search from '@/assets/onboarding/search.svg';
import card1 from '@/assets/onboarding/card/eco-plan.png';
import card2 from '@/assets/onboarding/card/bbig.png';
import card3 from '@/assets/onboarding/card/simple-plan.png';
import card4 from '@/assets/onboarding/card/hey-young.png';
import card5 from '@/assets/onboarding/card/sol.png';
import card6 from '@/assets/onboarding/card/mega.png';
import help from '@/assets/onboarding/help.svg';

const STEPS = [1, 2, 3, 4];

// 영문 + 숫자 + 특수문자 포함 8자 이상 (시안 문구 확인 후 규칙 조정)
const PW_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// TODO: 로고 이미지를 받으면 logo에 import한 이미지를 넣으세요
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

// TODO: 카드 목록/검색 API 연동 시 교체 (임시 데이터)
const MOCK_CARDS = [
  { id: 1, name: '신한카드 ECO Plan', type: '신용카드', image: card1 },
  { id: 2, name: '신한카드 B.Big', type: '신용카드', image: card2 },
  { id: 3, name: '신한카드 Simple Plan', type: '신용카드', image: card3 },
  { id: 4, name: '신한카드 Hachiware', type: '체크카드', image: card4 },
  { id: 5, name: '신한카드 Seoul', type: '체크카드', image: card5 },
  { id: 6, name: '신한카드 Mr.Life', type: '신용카드', image: card6 },
];

const FILTERS = ['전체', '신용카드', '체크카드'];

const SPENDING = [
  {
    id: 'under',
    title: '30만 원 미만',
    desc: '이번 달 Mr.Life 혜택을 받을 수 없어요',
  },
  {
    id: 'over',
    title: '30만 원 이상',
    desc: '카페, 편의점에서 10% 할인 받을 수 있어요',
  },
  {
    id: 'unknown',
    title: '모르겠어요.',
    desc: '이번 달 Mr.Life 혜택을 받을 수 없어요',
  },
];

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
function LandscapeCard({ src, text, className }) {
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
        className="absolute top-1/2 left-1/2 h-[157.45%] w-[63.51%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-270"
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

  // 1단계
  const [form, setForm] = useState({ id: '', password: '' });
  // 2단계
  const [company, setCompany] = useState(null);
  // 3단계
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('전체');
  const [card, setCard] = useState(null);
  // 4단계
  const [spending, setSpending] = useState(null);

  const pwFilled = form.password !== '';
  const pwValid = PW_RULE.test(form.password);
  const isValid = form.id.trim() !== '' && pwValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* 검색: 입력이 멈추고 0.5초 뒤 결과 반영 (그동안 로딩 화면) */
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(handleSearch.timer);
    handleSearch.timer = setTimeout(() => setDebounced(value), 500);
  };

  const searching = query.trim() !== '' && query !== debounced;
  const typeFiltered = MOCK_CARDS.filter(
    (c) => filter === '전체' || c.type === filter,
  );
  const searchResults = typeFiltered.filter((c) =>
    c.name.toLowerCase().includes(debounced.trim().toLowerCase()),
  );
  const visibleCards = query.trim() === '' ? typeFiltered : searchResults;
  const selectedCard = MOCK_CARDS.find((c) => c.id === card);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: 회원가입 API 연동 (성공 시 다음 단계로)
    setStep(2);
  };

  const handleBack = () => {
    if (step === 1) navigate('/onboarding', { state: { back: true } });
    else setStep((prev) => prev - 1);
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
  const handleSkip = () => navigate('/');

  const handleRegisterCard = () => {
    // TODO: 카드 등록 API 연동 (company, card, spending)
    setScreen('done');
  };

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
                  대문자, 숫자, 특수문자를 포함하여 8자가 되어야 합니다.
                </p>
              )}
              {pwFilled && pwValid && (
                <p className="mt-2 text-[12px] text-[#3FB179]">
                  사용 가능한 형식입니다.
                </p>
              )}
            </div>
          </div>

          <Footer>
            <PrimaryButton
              type="submit"
              disabled={!isValid}
              className="rounded-[8px] group-has-[input[name]:focus]:rounded-[27px]"
            >
              회원가입
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
            {COMPANIES.map((c) => {
              const selected = company === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCompany(c.id);
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
              {COMPANIES.find((c) => c.id === company)?.cardLabel ?? '카드'}를
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

          <div className="mt-[30px] pb-6">
            {/* 검색 중*/}
            {searching && (
              <div className="flex flex-col gap-3">
                <div className="h-[96px] rounded-[8px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2]" />
                <div className="h-[96px] rounded-[8px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2]" />
              </div>
            )}

            {/* 검색 결과 */}
            {!searching && visibleCards.length > 0 && (
              <div className="flex flex-col gap-3">
                {visibleCards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCard(c.id);
                      setStep(4);
                    }}
                    className={cn(
                      'flex h-[96px] w-full cursor-pointer items-stretch overflow-hidden rounded-[8px] bg-[#EBEBEB] text-left transition-colors',
                    )}
                  >
                    <div className="relative h-full w-[148px] shrink-0 overflow-hidden rounded-[8px]">
                      <img
                        src={c.image}
                        alt=""
                        className="absolute top-1/2 left-1/2 h-[148px] w-[94px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-270 object-contain"
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
              text=""
              className="w-[152px] shrink-0"
            />
            <span className="flex min-w-0 flex-1 items-center justify-center px-3 text-center text-[16px] text-[#8E8E8E]">
              {selectedCard?.name ?? '선택한 카드'}
            </span>
          </div>

          {/* 실적 선택 (라디오) */}
          <div className="mt-6 mb-8 divide-y divide-[#DCDCDC] rounded-[8px] bg-[#EBEBEB]">
            {SPENDING.map((s) => (
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
              disabled={!spending}
              onClick={handleRegisterCard}
            >
              카드 등록하기
            </PrimaryButton>
          </Footer>
        </div>
      )}
    </div>
  );
}

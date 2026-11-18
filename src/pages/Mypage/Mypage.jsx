import info from '@/assets/mypage/error.svg';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/utils/cn';
import { useCallback, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toastTrash from '@/assets/mypage/trash_red.svg';
import change from '@/assets/mypage/Change_red.svg';
import Toast from '@/components/common/Toast';
import { getCategoryIcon } from '@/constants/categories';
import {
  currentMonth,
  moveMonth,
  won,
  kstDate,
  paymentView,
  paymentRequest,
  requestError,
} from './mypageApi';
import useMypageApi from './mypageApi';
import MypageRecord, { EditPayment, RequestState } from './MypageRecord';
import MypageLogic from './MypageLogic';
import MypageAccount, { LogoutDialog } from './MypageAccount';
import DeleteAccount from './DeleteAccount';
import Policy from './Policy';
import PolicyService from './PolicyService';
import PolicyPrivacy from './PolicyPrivacy';
import gobtn from '@/assets/mypage/go.svg';
import backbtn from '@/assets/mypage/back.svg';
import { slideBack } from '@/pages/Onboarding/backTransition';

function Dashboard({ summary, resolveCard, onOpen }) {
  const total = summary.savedBenefit.amount;
  const cardTotals = summary.byCard.map((item) => ({
    ...resolveCard(item.userCardId, item.productName),
    total: item.amount,
  }));
  const largestCardSaving = Math.max(
    ...cardTotals.map((card) => card.total),
    0,
  );
  return (
    <>
      <h1 className="mb-6 text-[24px] leading-[1.2] font-semibold text-[#121212]">
        마이페이지
      </h1>
      <section
        className="rounded-[8px] bg-[#FFFFFF] px-6 py-4"
        aria-label="절약 현황"
      >
        <div className="flex items-center gap-[8px] text-[16px] text-[#6E6E6E]">
          {Number(summary.month.slice(5))}월 카똑으로 챙긴 혜택
          <button
            type="button"
            onClick={() => onOpen('calculation')}
            aria-label="카똑 계산 방식 안내"
            className="inline-flex size-4 shrink-0 items-center justify-center"
          >
            <img src={info} alt="" className="size-4" />
          </button>
        </div>
        <div className="mt-[5px] flex items-baseline justify-between [&>span]:text-[14px] [&>span]:text-[#8E8E8E] [&>strong]:text-[36px] [&>strong]:leading-[1.2] [&>strong]:font-semibold [&>strong]:text-[#121212]">
          <strong>{won(total)}</strong>
          <span>결제 {summary.savedBenefit.paymentCount}건</span>
        </div>
        <div className="mt-[32px] flex flex-col gap-5">
          {cardTotals.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-[10px] [&>div]:min-w-0 [&>div]:flex-1"
            >
              <CardImage card={card} landscape className="h-12 w-[76.21px]" />
              <div>
                <div className="flex items-center justify-between gap-1.5 text-[16px] text-[#4B4B4B] [&_strong]:shrink-0 [&_strong]:text-[20px] [&_strong]:font-semibold [&_strong]:text-[#121212] max-[361px]:[&_strong]:text-[16px]">
                  <span>{card.name}</span>
                  <strong>{won(card.total)}</strong>
                </div>
                <div className="mt-[10px] h-[8px] overflow-hidden rounded-[12px] bg-[#EBEBEB]">
                  <span
                    className={`block h-full rounded-[inherit] transition-[width] duration-200 motion-reduce:transition-none ${largestCardSaving > 0 && card.total === largestCardSaving ? 'bg-[#DBE1FF]' : 'bg-[#8C9EFF]'}`}
                    style={{
                      width: `${largestCardSaving ? (card.total / largestCardSaving) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <nav className="-mx-[18px] mt-6 mb-[120px]" aria-label="마이페이지 메뉴">
        <MenuRow onClick={() => onOpen('history')}>결제 기록</MenuRow>
        <MenuRow onClick={() => onOpen('calculation')}>
          카똑은 이렇게 계산해요
        </MenuRow>
        <MenuRow onClick={() => onOpen('account')}>계정</MenuRow>
        <MenuRow onClick={() => onOpen('policies')}>약관 및 정책</MenuRow>
      </nav>
      <BottomNav />
    </>
  );
}

export default function Mypage() {
  const [screen, setScreen] = useState('dashboard');
  const [month, setMonth] = useState(currentMonth);
  const [editingId, setEditingId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const mutationLock = useRef(false);
  const data = useMypageApi(screen, month, editingId);
  const contentRef = useRef(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeEditor = useCallback(() => {
    if (mutationLock.current) return;
    setEditingId(null);
    setMutationError('');
  }, []);
  const closeToast = useCallback(() => setToast(null), []);
  const titles = {
    history: `${Number(month.slice(5))}월 결제 기록`,
    calculation: '',
    account: '계정',
    policies: '약관 및 정책',
    terms: '',
    privacy: '',
    withdrawal: '',
  };

  const open = (next) => {
    if (mutationLock.current) return;
    setMutationError('');
    setScreen(next);
    if (next === 'history') setMonth(currentMonth());
    contentRef.current?.scrollTo({ top: 0 });
  };
  const back = () => {
    if (mutationLock.current) return;
    slideBack(
      () =>
        open(
          screen === 'terms' || screen === 'privacy'
            ? 'policies'
            : screen === 'withdrawal'
              ? 'account'
              : 'dashboard',
        ),
      () => contentRef.current,
    );
  };
  const persistPayment = async (
    payment,
    body,
    editing = false,
    excluded = false,
  ) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setSaving(true);
    setMutationError('');
    try {
      const result = await data.savePayment(payment.recommendationId, body);
      if (!data.isCurrent()) return;
      setEditingId(null);
      const date = kstDate(payment.recommendedAt);
      const place = payment.merchant?.name ?? `${payment.category.name} 업종`;
      const unregistered = result.result === 'PAID_UNREGISTERED';
      const editedCard =
        editing && ['PAID_RECOMMENDED', 'PAID_OTHER'].includes(result.result)
          ? data.resolveCard(
              result.userCard?.userCardId,
              result.userCard?.productName,
            )
          : null;
      const notice = excluded
        ? {
            title: `${place} 결제건 제외됨`,
            description: `${Number(date.slice(5, 7))}월 ${date.slice(8)}일 ${place} 결제건이 미결제 상태로 변경되었어요.`,
          }
        : unregistered
          ? {
              title: `${won(payment.amount)} 기록`,
              description: '미등록 카드로 혜택 정보가 확인되지 않아요.',
            }
        : editedCard
          ? {
              title: '결제 기록이 수정되었어요',
              description: `${place} 결제 기록이 ${editedCard.name}로 수정되었어요`,
            }
          : {
              title: '결제 안 함으로 기록했어요',
              description: '결제하지 않은 것으로 기록했어요',
            };
      setToast(
        (unregistered || excluded || editedCard || body.result === 'NOT_PAID')
          ? {
              ...notice,
              category: payment.category?.name ?? payment.category,
              card: editedCard,
              excluded,
              unregistered,
              rejected: body.result === 'NOT_PAID',
            }
          : null,
      );
      await data.refreshPayments();
    } catch (error) {
      if (data.isCurrent()) setMutationError(requestError(error));
    } finally {
      mutationLock.current = false;
      if (data.isCurrent()) setSaving(false);
    }
  };
  const save = (selection, excluded = false) => {
    try {
      const payment = data.payment.data;
      const body = paymentRequest(payment, selection);
      void persistPayment(
        payment,
        body,
        payment.result !== 'PENDING',
        excluded,
      );
    } catch (error) {
      setMutationError(requestError(error));
    }
  };
  const confirmPayment = (payment) => {
    if (payment.recommendedCard?.deleted) {
      setMutationError(
        '추천 카드가 삭제됐어요. 다른 카드나 미등록 카드를 선택해주세요.',
      );
      return;
    }
    void persistPayment(payment, { result: 'PAID_RECOMMENDED' });
  };
  const rejectPayment = (payment) =>
    void persistPayment(payment, { result: 'NOT_PAID' });
  const withdraw = async () => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setSaving(true);
    setMutationError('');
    try {
      await data.deleteAccount();
      await data.endSession();
    } catch (error) {
      if (data.isCurrent()) setMutationError(requestError(error));
    } finally {
      mutationLock.current = false;
      if (data.isCurrent()) setSaving(false);
    }
  };

  return (
    <main
      className="mx-auto box-border h-dvh w-full max-w-[402px] [scrollbar-width:none] overflow-x-hidden overflow-y-auto bg-[#F1F1F1] px-[18px] pt-[62px] pb-9 font-['Pretendard',sans-serif] text-[14px] leading-[1.4] text-[#121212] max-[361px]:px-[14px] [&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_button:disabled]:opacity-35 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:outline-[#7F90E8] [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-offset-[3px] [&_input:focus-visible]:outline-[#7F90E8] [&::-webkit-scrollbar]:hidden"
      ref={contentRef}
    >
      {screen === 'dashboard' ? (
        <RequestState query={data.summary}>
          {data.summary.data && (
            <Dashboard
              summary={data.summary.data}
              resolveCard={data.resolveCard}
              onOpen={open}
            />
          )}
        </RequestState>
      ) : (
        <>
          <Header
            title={titles[screen]}
            onBack={back}
            record={screen === 'history'}
          >
            {screen === 'history' && (
              <>
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={saving}
                  className="flex size-9 shrink-0 items-center justify-center"
                  onClick={() => setMonth(moveMonth(month, -1))}
                >
                  <img src={backbtn} alt="" className="block size-9" />
                </button>
                <span
                  aria-hidden="true"
                  className="h-9 w-0.5 shrink-0 bg-[#E1E1E1]"
                />
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={month >= currentMonth() || saving}
                  onClick={() => setMonth(moveMonth(month, 1))}
                  className="flex size-9 shrink-0 items-center justify-center disabled:cursor-pointer! disabled:opacity-100!"
                >
                  <img src={gobtn} alt="" className="block size-9" />
                </button>
              </>
            )}
          </Header>
          {screen === 'history' && (
            <RequestState query={data.records}>
              {mutationError && editingId == null && (
                <p
                  role="alert"
                  className="sticky top-0 z-10 bg-[#F1F1F1] py-3 text-[14px] text-[#EE695D]"
                >
                  {mutationError}
                </p>
              )}
              {data.records.data && (
                <MypageRecord
                  summary={data.records.data.savedBenefit}
                  payments={data.records.data.records.map((record) =>
                    paymentView(record, data.resolveCard),
                  )}
                  pending={(data.pending.data ?? []).map((record) =>
                    paymentView(record, data.resolveCard),
                  )}
                  pendingCount={data.records.data.pendingCount}
                  pendingQuery={data.pending}
                  saving={saving}
                  onEdit={(item) => {
                    setMutationError('');
                    setEditingId(item.id);
                  }}
                  onConfirm={confirmPayment}
                  onReject={rejectPayment}
                />
              )}
            </RequestState>
          )}
          {screen === 'calculation' && <MypageLogic />}
          {screen === 'account' && (
            <RequestState query={data.profile}>
              {data.profile.data && (
                <MypageAccount
                  profile={data.profile.data}
                  onLogout={() => setDialog('logout')}
                  onWithdraw={() => open('withdrawal')}
                />
              )}
            </RequestState>
          )}
          {screen === 'policies' && <Policy onOpen={open} />}
          {screen === 'terms' && <PolicyService />}
          {screen === 'privacy' && <PolicyPrivacy />}
          {screen === 'withdrawal' && (
            <RequestState query={data.deletion}>
              {data.deletion.data && (
                <DeleteAccount
                  summary={data.deletion.data}
                  submitting={saving}
                  error={mutationError}
                  onContinue={() => open('account')}
                  onWithdraw={withdraw}
                />
              )}
            </RequestState>
          )}
        </>
      )}
      {mutationError &&
        editingId == null &&
        !['history', 'withdrawal'].includes(screen) && (
          <p role="alert" className="mt-4 text-[14px] text-[#EE695D]">
            {mutationError}
          </p>
        )}
      {editingId != null && (
        <EditPayment
          key={editingId}
          query={data.payment}
          resolveCard={data.resolveCard}
          saving={saving}
          error={mutationError}
          onClose={closeEditor}
          onSave={save}
        />
      )}
      {dialog === 'logout' && (
        <LogoutDialog
          onClose={closeDialog}
          onConfirm={() => data.endSession()}
        />
      )}
      {toast && (
        <div
          className={cn(
            (toast.excluded || toast.card || toast.unregistered) &&
              '[&_[role=status]>span:nth-child(2)>span:last-child]:whitespace-normal',
            toast.excluded &&
              '[&_[role=status]>span:nth-child(2)>span:last-child]:line-clamp-2',
            toast.excluded &&
              '[&_[role=status]]:h-[76px] [&_[role=status]]:justify-between [&_[role=status]]:gap-3 [&_[role=status]]:p-1 [&_[role=status]]:pr-4 [&_[role=status]]:backdrop-blur-[24px] [&>div]:px-[18px]',
            toast.card &&
              '[&_[role=status]]:h-[92px] [&_[role=status]]:justify-between [&_[role=status]]:p-1 [&_[role=status]]:backdrop-blur-[24px] [&_[role=status]>span:nth-child(2)]:h-[84px] [&_[role=status]>span:nth-child(2)]:gap-1 [&_[role=status]>span:nth-child(2)]:py-2 [&_[role=status]>span:nth-child(2)]:pr-5 [&_[role=status]>span:nth-child(2)>span:last-child]:line-clamp-2 [&>div]:px-[18px]',
            toast.unregistered && '[&>div]:px-[18px] [&_[role=status]]:h-[76px] [&_[role=status]]:p-1 [&_[role=status]]:pr-4 [&_[role=status]]:backdrop-blur-[24px] [&_[role=status]>span:nth-child(2)>span:last-child]:line-clamp-2',
            toast.deleted &&
              '[&_[role=status]>span:first-child]:bg-transparent [&_[role=status]>span:first-child]:bg-none',
          )}
        >
          <Toast
            key={toast.title + toast.description}
            title={
              <span
                className={
                  toast.deleted || toast.rejected
                    ? 'text-[#EE695D]'
                    : 'text-[#A3B1FF]'
                }
              >
                {toast.title}
              </span>
            }
            description={toast.description}
            categoryIcon={
              toast.excluded || toast.card || toast.unregistered
                ? undefined
                : getCategoryIcon(toast.category)
            }
            iconClassName={
              toast.excluded || toast.unregistered
                ? 'size-[68px] bg-transparent'
                : toast.card
                  ? 'h-[84px] w-[102px] bg-transparent'
                  : undefined
            }
            hasArrow={!toast.excluded && !toast.card}
            icon={
              toast.excluded ? (
                <>
                  {getCategoryIcon(toast.category) && (
                    <img src={getCategoryIcon(toast.category)} alt="" className="size-[64px] object-contain" />
                  )}
                  <img src={change} alt="" className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 object-contain" />
                </>
              ) : toast.unregistered ? (
                <>
                  {getCategoryIcon(toast.category) && (
                    <img src={getCategoryIcon(toast.category)} alt="" className="size-[64px] object-contain" />
                  )}
                  <span className="absolute top-1/2 left-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#A3B1FF]">
                    <Check className="size-[24px] text-[#3B426B]" strokeWidth={3} />
                  </span>
                </>
              ) : toast.card ? (
                <>
                  <CardImage
                    card={toast.card}
                    landscape
                    fill
                    className="h-full w-full"
                  />
                  <span className="absolute top-1/2 left-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#CDD3FF]">
                    <Check className="size-5 text-[#7F90E8]" strokeWidth={3} />
                  </span>
                </>
              ) : toast.rejected ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-[#EE695D]">
                  <X className="size-5 text-[#FAFAFA]" strokeWidth={2} />
                </span>
              ) : toast.deleted ? (
                <img
                  src={toastTrash}
                  alt=""
                  className="size-6 object-contain"
                />
              ) : (
                <Check className="text-[#8C9EFF]" />
              )
            }
            onClose={closeToast}
          />
        </div>
      )}
    </main>
  );
}

function Header({ title, onBack, children, record = false }) {
  return (
    <header
      className={cn(
        'relative -mx-1.5 mb-0 flex min-h-10 items-center justify-between',
        record && 'h-12',
      )}
    >
      <button
        type="button"
        className="inline-flex h-8 w-9 items-center justify-center text-[#CACACA]"
        aria-label="뒤로 가기"
        onClick={onBack}
      >
        {record ? (
          <svg
            width="11.68"
            height="19.57"
            viewBox="0 0 11.68 19.57"
            fill="none"
            aria-hidden="true"
            className="h-[19.57px] w-[11.68px] shrink-0"
          >
            <path
              d="M10.18 1.5L1.5 9.785L10.18 18.07"
              stroke="#CACACA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <ChevronLeft size={24} />
        )}
      </button>
      <h1
        className={cn(
          'absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[#4B4B4B]',
          record
            ? 'text-[18px] leading-[1.2] font-semibold tracking-normal'
            : 'text-[16px] font-medium',
        )}
      >
        {title}
      </h1>
      <div
        className={
          record
            ? 'flex h-9 w-[74px] shrink-0 items-center gap-0 overflow-hidden rounded-full bg-[#EBEBEB]'
            : 'flex gap-1'
        }
      >
        {children}
      </div>
    </header>
  );
}

function CardImage({ card, landscape = false, fill = false, className = '' }) {
  if (!card.image) {
    return (
      <span
        className={cn(
          'relative inline-flex h-16 w-[100px] shrink-0 overflow-hidden rounded-md bg-[#D6D6D6]',
          className,
        )}
        aria-hidden="true"
      >
        <span className="absolute top-3 h-2.5 w-full bg-[#EBEBEB]" />
      </span>
    );
  }
  const rotation = fill
    ? card.isHorizontal
      ? 'h-full w-full'
      : 'h-[121.43%] w-[82.35%] rotate-270'
    : landscape
      ? card.isHorizontal
        ? 'h-full w-full'
        : 'h-[158.33%] w-[63.16%] rotate-270'
      : card.isHorizontal
        ? 'h-[66.67%] w-[150%] rotate-90'
        : 'h-full w-full';
  return (
    <span
      className={cn(
        'relative inline-block h-[60px] w-10 shrink-0 overflow-hidden rounded-[5px]',
        className,
      )}
    >
      <img
        src={card.image}
        alt=""
        className={cn(
          'absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2',
          fill ? 'object-cover' : 'object-contain',
          rotation,
        )}
      />
    </span>
  );
}

function MenuRow({ children, onClick, muted = false }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between gap-3 border-b border-[#CACACA] px-[18px] py-[13px] text-left text-[16px] font-medium text-[#3B426B] [&>svg]:size-[30px] [&>svg]:text-[#CACACA] ${muted ? 'text-[#8E8E8E]' : ''}`}
      onClick={onClick}
    >
      <span>{children}</span>
      <ChevronRight size={20} aria-hidden="true" />
    </button>
  );
}

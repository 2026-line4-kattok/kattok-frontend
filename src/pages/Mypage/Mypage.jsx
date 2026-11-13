import { useNavigate } from 'react-router-dom';
import info from '@/assets/mypage/error.svg';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/utils/cn';
import { useCallback, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toastTrash from '@/assets/mypage/trash_red.svg';
import Toast from '@/components/common/Toast';
import {
  INITIAL_CARD_SAVINGS,
  INITIAL_MONTH,
  INITIAL_PAYMENTS,
  estimateSaving,
  findCard,
  moveMonth,
  totalSaving,
  won,
} from './mypageData';
import MypageRecord, { EditPayment, DeletePaymentDialog } from './MypageRecord';
import MypageLogic from './MypageLogic';
import MypageAccount, { LogoutDialog } from './MypageAccount';
import DeleteAccount from './DeleteAccount';
import Policy from './Policy';
import PolicyService from './PolicyService';
import PolicyPrivacy from './PolicyPrivacy';
import gobtn from '@/assets/mypage/go.svg';
import backbtn from '@/assets/mypage/back.svg';

function Dashboard({ payments, onOpen }) {
  const confirmed = payments.filter((item) => !item.pending && !item.unpaid);
  const total = totalSaving(payments);
  const cardTotals = ['shinhan', 'kb', 'hana'].map((id) => {
    const card = findCard(id);
    return {
      ...card,
      total: Math.max(
        0,
        INITIAL_CARD_SAVINGS[id] +
          totalSaving(confirmed.filter((item) => item.cardId === id)) -
          totalSaving(INITIAL_PAYMENTS.filter((item) => item.cardId === id)),
      ),
    };
  });
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
          11월 카똑으로 챙긴 혜택 <img src={info} className="size-4" />
        </div>
        <div className="mt-[5px] flex items-baseline justify-between [&>span]:text-[14px] [&>span]:text-[#8E8E8E] [&>strong]:text-[36px] [&>strong]:leading-[1.2] [&>strong]:font-semibold [&>strong]:text-[#121212]">
          <strong>{won(total)}</strong>
          <span>결제 {confirmed.length}건</span>
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
  const navigate = useNavigate();
  const [screen, setScreen] = useState('dashboard');
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [month, setMonth] = useState(INITIAL_MONTH);
  const [editingId, setEditingId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const contentRef = useRef(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeEditor = useCallback(() => setEditingId(null), []);
  const closeToast = useCallback(() => setToast(null), []);
  const editing = payments.find((payment) => payment.id === editingId);
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
    setScreen(next);
    contentRef.current?.scrollTo({ top: 0 });
  };
  const back = () =>
    open(
      screen === 'terms' || screen === 'privacy'
        ? 'policies'
        : screen === 'withdrawal'
          ? 'account'
          : 'dashboard',
    );
  const notify = (title, description, deleted = false) =>
    setToast({ title, description, deleted });
  const save = (cardId) => {
    const card = findCard(cardId);
    setPayments((previous) =>
      previous.map((item) =>
        item.id === editing.id
          ? {
              ...item,
              cardId,
              saving: estimateSaving(item, card),
              pending: false,
              unpaid: false,
            }
          : item,
      ),
    );
    setEditingId(null);
    notify(
      '결제 기록이 수정되었어요',
      `${editing.place} 결제 기록이 ${card.name}로 변경되었어요`,
    );
  };
  const remove = () => {
    setPayments((previous) =>
      previous.filter((item) => item.id !== editing.id),
    );
    setDialog(null);
    setEditingId(null);
    notify(
      `${findCard(editing.cardId).name} 삭제됨`,
      `${editing.place} 결제 기록이 삭제되었어요`,
      true,
    );
  };
  const confirmPayment = (payment) => {
    setPayments((previous) =>
      previous.map((item) =>
        item.id === payment.id
          ? {
              ...item,
              pending: false,
              unpaid: false,
              saving: estimateSaving(item, findCard(item.cardId)),
            }
          : item,
      ),
    );
    setToast(null);
  };

  const rejectPayment = (payment) => {
    setPayments((previous) =>
      previous.map((item) =>
        item.id === payment.id
          ? { ...item, pending: false, unpaid: true, saving: 0 }
          : item,
      ),
    );
    setToast({
      title: '결제 기록 거부됨',
      description: '추후에 일괄로 등록할 수 있어요',
      rejected: true,
    });
  };

  return (
    <main
      className="mx-auto box-border h-dvh w-full max-w-[402px] [scrollbar-width:none] overflow-x-hidden overflow-y-auto bg-[#F1F1F1] px-[18px] pt-[62px] pb-9 font-['Pretendard',sans-serif] text-[14px] leading-[1.4] text-[#121212] max-[361px]:px-[14px] [&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_button:disabled]:opacity-35 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:outline-[#7F90E8] [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-offset-[3px] [&_input:focus-visible]:outline-[#7F90E8] [&::-webkit-scrollbar]:hidden"
      ref={contentRef}
    >
      {screen === 'dashboard' ? (
        <Dashboard payments={payments} onOpen={open} />
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
                  disabled={month >= INITIAL_MONTH}
                  onClick={() => setMonth(moveMonth(month, 1))}
                  className="flex size-9 shrink-0 items-center justify-center disabled:cursor-pointer! disabled:opacity-100!"
                >
                  <img src={gobtn} alt="" className="block size-9" />
                </button>
              </>
            )}
          </Header>
          {screen === 'history' && (
            <MypageRecord
              payments={payments}
              month={month}
              onEdit={(item) => setEditingId(item.id)}
              onConfirm={confirmPayment}
              onReject={rejectPayment}
            />
          )}
          {screen === 'calculation' && <MypageLogic />}
          {screen === 'account' && (
            <MypageAccount
              onLogout={() => setDialog('logout')}
              onWithdraw={() => open('withdrawal')}
            />
          )}
          {screen === 'policies' && <Policy onOpen={open} />}
          {screen === 'terms' && <PolicyService />}
          {screen === 'privacy' && <PolicyPrivacy />}
          {screen === 'withdrawal' && (
            <DeleteAccount
              payments={payments}
              onContinue={() => open('account')}
              onWithdraw={() =>
                navigate('/onboarding', {
                  replace: true,
                  state: { back: true },
                })
              }
            />
          )}
        </>
      )}
      {editing && dialog !== 'delete' && (
        <EditPayment
          key={editing.id}
          payment={editing}
          onClose={closeEditor}
          onSave={save}
          onDelete={() => setDialog('delete')}
        />
      )}
      {dialog === 'delete' && (
        <DeletePaymentDialog onClose={closeDialog} onConfirm={remove} />
      )}
      {dialog === 'logout' && <LogoutDialog onClose={closeDialog} />}
      {toast && (
        <div
          className={
            toast.deleted
              ? '[&_[role=status]>span:first-child]:bg-transparent [&_[role=status]>span:first-child]:bg-none'
              : ''
          }
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
            icon={
              toast.rejected ? (
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
            onClick={() => {
              closeToast();
              open('history');
            }}
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

function CardImage({ card, landscape = false, className = '' }) {
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
  const rotation = landscape
    ? card.id === 'kb'
      ? 'h-full w-full'
      : 'h-[158.33%] w-[63.16%] rotate-270'
    : card.id === 'kb'
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
          'absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain',
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

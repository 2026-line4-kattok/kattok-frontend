import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  won,
  kstDate,
  paymentSelection,
  paymentOptions,
  requestError,
} from './mypageApi';
import info from '@/assets/mypage/error.svg';
import empty from '@/assets/onboarding/card/empty.png';
import suggest from '@/assets/mypage/suggest.svg';
import change from '@/assets/mypage/Change.svg';

function PaymentHistory({
  payments,
  summary,
  pending,
  pendingCount,
  pendingQuery,
  saving,
  onEdit,
  onConfirm,
  onReject,
}) {
  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  const visible = payments;
  const days = [...new Set(visible.map((item) => item.date))].sort().reverse();
  return (
    <>
      <div className="mt-7 mb-6 flex h-[61px] w-full items-center justify-between gap-2.5 rounded-[8px] bg-[#FAFAFA] px-6 py-4 shadow-[0_4px_12px_rgba(18,18,18,0.03)] max-[361px]:px-4 [&>span]:text-[14px] [&>span]:leading-[1.4] [&>span]:whitespace-nowrap [&>span]:text-[#6E6E6E] max-[361px]:[&>span]:text-[12px] [&>strong]:shrink-0 [&>strong]:text-[24px] [&>strong]:leading-[1.2] [&>strong]:font-semibold [&>strong]:whitespace-nowrap [&>strong]:text-[#8C9EFF] max-[361px]:[&>strong]:text-[22px]">
        <span>이번 달 카똑으로 챙긴 혜택</span>
        <strong>{won(summary.amount)}</strong>
      </div>
      {pendingCount > 0 && (
        <p className="mb-4 text-[14px] text-[#8E8E8E]">
          확인할 결제 {pendingCount}건
        </p>
      )}
      <RequestState query={pendingQuery} />
      {pending.map((item) => (
        <section
          className="-mt-3 mb-[26px] overflow-hidden rounded-lg bg-[#EBEBEB] pt-3 [&>p]:mx-[18px] [&>p]:mt-3 [&>p]:font-semibold [&>span]:mx-[18px] [&>span]:mt-0.5 [&>span]:mb-3 [&>span]:block"
          key={item.id}
        >
          <div className="flex items-center justify-between px-[16px] text-[16px] text-[#8E8E8E] [&>button]:text-[14px] [&>span]:flex [&>span]:items-center [&>span]:gap-1">
            <span>
              <img src={info} className="size-5" /> 확인
            </span>
            <button
              type="button"
              onClick={() => onEdit(item)}
              disabled={saving}
            >
              더보기
            </button>
          </div>
          <p className="text-[18px] font-semibold text-[#121212]">
            {item.chosenCard?.productName ??
              item.recommendedCard?.productName ??
              '추천 카드'}
            로 결제하셨나요?
          </p>
          <span className="text-[14px] text-[#8E8E8E]">
            {item.place} · {won(item.amount)}
          </span>

          <div className="flex h-9 [&>button]:grid [&>button]:flex-1 [&>button]:place-items-center [&>button:first-child]:bg-[#F8C5C0] [&>button:first-child]:text-[#EE695D] [&>button:last-child]:bg-[#CDD3FF] [&>button:last-child]:text-[#7F90E8]">
            <button
              type="button"
              aria-label="결제하지 않았어요"
              disabled={saving}
              onClick={() => onReject(item)}
            >
              <X size={20} />
            </button>
            <button
              type="button"
              aria-label={
                item.chosenCard
                  ? '고른 카드로 결제했어요'
                  : '추천 카드로 결제했어요'
              }
              disabled={
                saving || (!item.chosenCard && item.recommendedCard?.deleted)
              }
              onClick={() => onConfirm(item)}
            >
              <Check size={20} />
            </button>
          </div>
          {!item.chosenCard && item.recommendedCard?.deleted && (
            <p className="pb-3 text-[14px] text-[#8E8E8E]">
              추천 카드가 삭제됐어요. 더보기에서 결제한 카드를 선택해주세요.
            </p>
          )}
        </section>
      ))}

      {days.map((day) => (
        <section
          className="mt-[12px] [&>h2]:mb-2 [&>h2]:text-[16px] [&>h2]:font-medium [&>h2]:text-[#6E6E6E]"
          key={day}
        >
          <h2>
            {Number(day.slice(5, 7))}월 {day.slice(8)}일
          </h2>
          {visible
            .filter((item) => item.date === day)
            .map((item) => (
              <button
                type="button"
                className="flex min-h-[80px] w-full items-center gap-3 text-left"
                key={item.id}
                disabled={saving}
                onClick={() => onEdit(item)}
              >
                <CardImage card={item.card} />
                <span className="flex min-w-0 flex-1 flex-col gap-1 [&>span]:text-[14px] [&>span]:text-[#8E8E8E] [&>strong]:text-[16px] [&>strong]:font-medium [&>strong]:text-[#3B426B]">
                  <strong>{item.place}</strong>
                  <span>
                    {won(item.amount)} · {item.card.name}
                  </span>
                  {item.result === 'PAID_OTHER' && (
                    <span>추천: {item.recommendedCard?.productName}</span>
                  )}
                </span>
                <strong
                  className={
                    item.unpaid
                      ? 'text-[18px] font-semibold text-[#EE695D]'
                      : 'text-[18px] font-semibold text-[#121212]'
                  }
                >
                  {item.unpaid
                    ? '미결제 상태'
                    : item.saving == null
                      ? null
                      : `+${won(item.saving)}`}
                </strong>
              </button>
            ))}
        </section>
      ))}
      {visible.length === 0 && (
        <p className="mt-6 text-center text-[14px] text-[#8E8E8E]">
          이 달의 결제 기록이 없어요.
        </p>
      )}
    </>
  );
}

function EditPayment({ query, resolveCard, saving, error, onClose, onSave }) {
  const [excluding, setExcluding] = useState(false);
  const [selected, setSelected] = useState(null);
  const cancelExclude = useCallback(() => {
    if (!saving) setExcluding(false);
  }, [saving]);
  if (excluding)
    return (
      <Modal title="결제 항목 제외" onClose={cancelExclude}>
        <p>
          미결제 상태로 전환하시겠어요?
          <br />
          나중에 결제 항목에 다시 포함할 수 있어요.
        </p>
        {error && (
          <div role="alert" className="px-6 pt-3 text-[14px] text-[#EE695D]">
            {error}
          </div>
        )}
        <div className="mt-6 flex h-12 shrink-0 [&>button]:flex [&>button]:h-12 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center">
          <button
            type="button"
            aria-label="제외 취소"
            disabled={saving}
            onClick={cancelExclude}
            className="bg-[#F8C5C0] text-[#EE695D]"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            aria-label="제외 확인"
            disabled={saving}
            onClick={() => onSave('not-paid', true)}
            className="bg-[#CAD2FF] text-[#8C9EFF]"
          >
            <Check size={20} />
          </button>
        </div>
      </Modal>
    );
  return (
    <Modal title="결제 기록 수정" onClose={onClose} sheet>
      <RequestState query={query}>
        {query.data && (
          <PaymentForm
            key={query.data.recommendationId}
            payment={query.data}
            resolveCard={resolveCard}
            saving={saving}
            error={error}
            onSave={onSave}
            selected={selected ?? paymentSelection(query.data)}
            onSelect={setSelected}
            onExclude={() => setExcluding(true)}
          />
        )}
      </RequestState>
    </Modal>
  );
}

function PaymentForm({
  payment,
  resolveCard,
  saving,
  error,
  onSave,
  selected,
  onSelect,
  onExclude,
}) {
  const options = paymentOptions(payment, resolveCard);
  const date = kstDate(payment.recommendedAt);
  const place = payment.merchant?.name ?? `${payment.category.name} 업종`;
  return (
    <>
      <div className="flex items-center justify-between gap-2 [&>h3]:text-[22px] [&>h3]:font-semibold max-[361px]:[&>h3]:text-[20px]">
        <p className="text-[24px] font-semibold text-[#121212]">
          어떤 카드로 결제하셨나요?
        </p>
        <button
          type="button"
          aria-label="결제 항목 제외"
          title="결제 항목 제외"
          disabled={saving || payment.result === 'NOT_PAID'}
          onClick={onExclude}
        >
          <img src={change} alt="" className="size-6" />
        </button>
      </div>
      <p className="mt-2 mb-8 text-[16px] text-[#8E8E8E]">
        {Number(date.slice(5, 7))}월 {date.slice(8)}일 · {place}{' '}
        {won(payment.amount)}
      </p>
      <div
        className="flex flex-col gap-4"
        role="radiogroup"
        aria-label="결제한 카드"
      >
        {options.map((card) => (
          <label
            key={card.id}
            className="flex h-20 w-full cursor-pointer items-center gap-3 [&_small]:text-[14px] [&_small]:leading-[1.4] [&_small]:text-[#8E8E8E] [&_strong]:text-[16px] [&_strong]:leading-[1.2] [&_strong]:font-medium [&_strong]:text-[#3B426B] [&>span:nth-child(2)]:flex [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:flex-1 [&>span:nth-child(2)]:flex-col [&>span:nth-child(2)]:gap-2"
          >
            <CardImage
              card={card}
              landscape
              recommended={card.recommended}
              className="h-16 w-[102px] shrink-0"
            />
            <span>
              <strong>
                {card.name}
                {card.deleted && ' (삭제된 카드)'}
              </strong>
              <small>
                {card.id === 'other'
                  ? '챙긴 혜택에 넣지 않아요'
                  : card.expectedBenefit == null
                    ? '계산 안 됨'
                    : card.expectedBenefit === 0
                      ? `${payment.category?.name ? `${payment.category.name} ` : ''}혜택 없음 · 0원`
                      : `예상 혜택 · ${won(card.expectedBenefit)}`}
              </small>
            </span>
            <input
              type="radio"
              className="size-6 shrink-0 appearance-none rounded-full border-[3px] border-[#C9C9C9] bg-transparent checked:border-[#8C9EFF] checked:bg-[#8C9EFF] checked:shadow-[inset_0_0_0_2px_#FAFAFA]"
              name="payment-card"
              value={card.value}
              disabled={saving || card.disabled}
              checked={selected === card.value}
              onChange={() => onSelect(card.value)}
            />
          </label>
        ))}
      </div>
      <p className="mt-8 mb-2 text-center text-[14px] text-[#6E6E6E]">
        바꾸면 챙긴 혜택과 카드 한도를 다시 계산해요
      </p>
      {error && (
        <p role="alert" className="mb-3 text-[14px] text-[#EE695D]">
          {error}
        </p>
      )}
      <button
        type="button"
        className="block h-[54px] w-full rounded-[27px] bg-[#121212] text-[20px] font-semibold text-[#FAFAFA]"
        onClick={() => onSave(selected)}
        disabled={
          saving ||
          !options.some(
            (option) => option.value === selected && !option.disabled,
          )
        }
      >
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </>
  );
}

// description을 넘기면 다른 삭제 확인(예: 카드 삭제)에도 재사용할 수 있습니다.
export function DeletePaymentDialog({
  onClose,
  onConfirm,
  description = '삭제하면 결제 정보를 다시 되돌릴 수 없어요',
}) {
  return (
    <Modal title="정말 삭제할까요?" onClose={onClose}>
      <p>{description}</p>
      <div className="mt-6 flex h-12 shrink-0 [&>button]:flex [&>button]:h-12 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center">
        <button
          type="button"
          className="bg-[#F8C5C0] !text-[#EE695D]"
          aria-label="삭제 취소"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <button
          type="button"
          className="bg-[#CAD2FF] text-[#8C9EFF]"
          aria-label="삭제 확인"
          onClick={onConfirm}
        >
          <Check size={20} />
        </button>
      </div>
    </Modal>
  );
}

export { EditPayment };
export default PaymentHistory;

function CardImage({
  card,
  landscape = false,
  recommended = false,
  className = '',
}) {
  if (card.id === 'other' && !landscape) {
    return (
      <span
        className="relative inline-block h-[60px] w-10 shrink-0 overflow-hidden rounded-[5px] bg-[#D6D6D6]"
        aria-hidden="true"
      >
        <img
          src={empty}
          alt=""
          className="absolute top-1/2 left-1/2 h-[66.67%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 object-contain"
        />
      </span>
    );
  }
  if (!card.image) {
    return (
      <span
        className={cn(
          'relative inline-flex h-16 w-[100px] shrink-0 overflow-hidden rounded-md bg-[#D6D6D6]',
          className,
        )}
        aria-hidden="true"
      >
        <img src={empty} alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  const rotation = landscape
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
          'absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain',
          rotation,
        )}
      />
      {recommended && (
        <span className="absolute inset-0 flex items-center justify-center bg-[#121212]/50">
          <img
            src={suggest}
            alt="추천"
            className="h-[27px] w-[51px] object-contain"
          />
        </span>
      )}
    </span>
  );
}

// 카드 페이지의 마지막 카드 삭제 안내 모달에서도 재사용합니다.
export function Modal({ title, children, onClose, sheet = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    const getFocusable = () => [
      ...dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
      ),
    ];
    (getFocusable()[0] ?? dialog).focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const items = getFocusable();
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener('keydown', handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [onClose]);
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,18,18,0.45)] font-['Pretendard',sans-serif] text-[#121212] backdrop-blur-[4px] [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:outline-[#7F90E8] [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-offset-[3px] [&_input:focus-visible]:outline-[#7F90E8]"
      onClick={onClose}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          sheet
            ? 'absolute bottom-0 left-1/2 max-h-[90dvh] w-[calc(100%-8px)] max-w-[394px] -translate-x-1/2 [scrollbar-width:none] overflow-y-auto rounded-t-[28px] bg-[#FAFAFA] px-[18px] pt-2 pb-[44px] outline-none [&::-webkit-scrollbar]:hidden'
            : 'flex w-[349px] max-w-[calc(100%-32px)] flex-col overflow-hidden rounded-[8px] bg-[#FAFAFA] shadow-[0_0_20px_rgba(18,18,18,0.12)] outline-none [&>h2]:px-6 [&>h2]:pt-6 [&>h2]:text-[24px] [&>h2]:leading-[1.2] [&>h2]:font-[600] [&>p]:px-[24px] [&>p]:pt-[12px] [&>p]:text-[16px] [&>p]:leading-[1.4] [&>p]:text-[#8E8E8E]'
        }
        onClick={(event) => event.stopPropagation()}
      >
        {sheet && (
          <div className="mx-auto mb-7 h-1 w-[60px] rounded bg-[#CACACA]" />
        )}
        <h2 id={titleId} className={sheet ? 'sr-only' : ''}>
          {title}
        </h2>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export function RequestState({ query, children }) {
  if (query.isError)
    return (
      <div className="my-6 text-[14px] text-[#EE695D]" role="alert">
        <p>{requestError(query.error)}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-2 underline"
        >
          다시 시도
        </button>
      </div>
    );
  if (!query.data)
    return (
      <p className="my-6 text-[14px] text-[#8E8E8E]" role="status">
        정보를 불러오고 있어요...
      </p>
    );
  return children;
}

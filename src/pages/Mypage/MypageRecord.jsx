import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { useEffect, useId, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  CARDS,
  estimateSaving,
  findCard,
  monthlyPayments,
  totalSaving,
  won,
} from './mypageData';
import info from '@/assets/mypage/error.svg';
import empty from '@/assets/onboarding/card/empty.png';
import suggest from '@/assets/mypage/suggest.svg';
import trash from '@/assets/mypage/trash.svg';

function PaymentHistory({ payments, month, onEdit, onConfirm, onReject }) {
  const [expandedId, setExpandedId] = useState(null);
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

  const items = monthlyPayments(payments, month);
  const pending = items.filter((item) => item.pending);
  const visible = items.filter((item) => !item.pending);
  const days = [...new Set(visible.map((item) => item.date))].sort().reverse();
  return (
    <>
      <div className="mt-7 mb-6 flex h-[61px] w-full items-center justify-between gap-2.5 rounded-[8px] bg-[#FAFAFA] px-6 py-4 shadow-[0_4px_12px_rgba(18,18,18,0.03)] max-[361px]:px-4 [&>span]:text-[14px] [&>span]:leading-[1.4] [&>span]:whitespace-nowrap [&>span]:text-[#6E6E6E] max-[361px]:[&>span]:text-[12px] [&>strong]:shrink-0 [&>strong]:text-[24px] [&>strong]:leading-[1.2] [&>strong]:font-semibold [&>strong]:whitespace-nowrap [&>strong]:text-[#8C9EFF] max-[361px]:[&>strong]:text-[22px]">
        <span>이번 달 카똑으로 챙긴 혜택</span>
        <strong>{won(totalSaving(items))}</strong>
      </div>
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
              aria-expanded={expandedId === item.id}
              onClick={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            >
              더보기
            </button>
          </div>
          <p className="text-[18px] font-semibold text-[#121212]">
            {findCard(item.cardId).name}로 결제하셨나요?
          </p>
          <span className="text-[14px] text-[#8E8E8E]">
            {item.place} · {won(item.amount)}
          </span>

          <div className="flex h-9 [&>button]:grid [&>button]:flex-1 [&>button]:place-items-center [&>button:first-child]:bg-[#F8C5C0] [&>button:first-child]:text-[#EE695D] [&>button:last-child]:bg-[#CDD3FF] [&>button:last-child]:text-[#7F90E8]">
            <button
              type="button"
              aria-label="팝업창 엑스"
              onClick={() => onReject(item)}
            >
              <X size={20} />
            </button>
            <button
              type="button"
              aria-label="팝업창 체크"
              onClick={() => onConfirm(item)}
            >
              <Check size={20} />
            </button>
          </div>
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
                onClick={() => onEdit(item)}
              >
                <CardImage card={findCard(item.cardId)} />
                <span className="flex min-w-0 flex-1 flex-col gap-1 [&>span]:text-[14px] [&>span]:text-[#8E8E8E] [&>strong]:text-[16px] [&>strong]:font-medium [&>strong]:text-[#3B426B]">
                  <strong>{item.place}</strong>
                  <span>
                    {won(item.amount)} · {findCard(item.cardId).name}
                  </span>
                </span>
                <strong
                  className={
                    item.unpaid
                      ? 'text-[20px] font-semibold text-[#EE695D]'
                      : 'text-[20px] font-semibold text-[#121212]'
                  }
                >
                  {item.unpaid ? '결제 안 함' : `+${won(item.saving)}`}
                </strong>
              </button>
            ))}
        </section>
      ))}
    </>
  );
}

function EditPayment({ payment, onClose, onSave, onDelete }) {
  const [selected, setSelected] = useState(payment.cardId);
  return (
    <Modal title="결제 기록 수정" onClose={onClose} sheet>
      <div className="flex items-center justify-between gap-2 [&>h3]:text-[22px] [&>h3]:font-semibold max-[361px]:[&>h3]:text-[20px]">
        <p className="text-[24px] font-semibold text-[#121212]">
          어떤 카드로 결제하셨나요?
        </p>
        <button type="button" aria-label="결제 기록 삭제" onClick={onDelete}>
          <img src={trash} className="size-6" />
        </button>
      </div>
      <p className="mt-2 mb-8 text-[16px] text-[#8E8E8E]">
        {Number(payment.date.slice(5, 7))}월 {payment.date.slice(8)}일 ·{' '}
        {payment.place} {won(payment.amount)}
      </p>
      <div
        className="flex flex-col gap-4"
        role="radiogroup"
        aria-label="결제한 카드"
      >
        {CARDS.map((card, index) => (
          <label
            key={card.id}
            className="flex h-20 w-full cursor-pointer items-center gap-3 [&_small]:text-[14px] [&_small]:leading-[1.4] [&_small]:text-[#8E8E8E] [&_strong]:text-[16px] [&_strong]:leading-[1.2] [&_strong]:font-medium [&_strong]:text-[#3B426B] [&>span:nth-child(2)]:flex [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:flex-1 [&>span:nth-child(2)]:flex-col [&>span:nth-child(2)]:gap-2"
          >
            <CardImage
              card={card}
              landscape
              recommended={index === 0}
              className="h-16 w-[102px] shrink-0"
            />
            <span>
              <strong>{card.name}</strong>
              <small>
                {card.id === 'other'
                  ? '챙긴 혜택에 넣지 않아요'
                  : estimateSaving(payment, card) === 0
                    ? `${payment.category ? `${payment.category} ` : ''}혜택 없음 · 0원`
                    : `예상 혜택 · ${won(estimateSaving(payment, card))}`}
              </small>
            </span>
            <input
              type="radio"
              className="size-6 shrink-0 appearance-none rounded-full border-[3px] border-[#C9C9C9] bg-transparent checked:border-[#8C9EFF] checked:bg-[#8C9EFF] checked:shadow-[inset_0_0_0_2px_#FAFAFA]"
              name="payment-card"
              value={card.id}
              checked={selected === card.id}
              onChange={() => setSelected(card.id)}
            />
          </label>
        ))}
      </div>
      <p className="mt-8 mb-2 text-center text-[14px] text-[#6E6E6E]">
        바꾸면 챙긴 혜택과 카드 한도를 다시 계산해요
      </p>
      <button
        type="button"
        className="block h-[54px] w-full rounded-[27px] bg-[#121212] text-[20px] font-semibold text-[#FAFAFA]"
        onClick={() => onSave(selected)}
      >
        저장하기
      </button>
    </Modal>
  );
}

export function DeletePaymentDialog({ onClose, onConfirm }) {
  return (
    <Modal title="정말 삭제할까요?" onClose={onClose}>
      <p>삭제하면 결제 정보를 다시 되돌릴 수 없어요</p>
      <div className="mt-6 flex h-12 shrink-0 [&>button]:flex [&>button]:h-12 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center">
        <button
          type="button"
          className="bg-[#F8C5C0] !text-[#EE695D]"
          aria-label="삭제 취소"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <button
          type="button"
          className="bg-[#CAD2FF] text-[#8C9EFF]"
          aria-label="삭제 확인"
          onClick={onConfirm}
        >
          <Check size={16} />
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

function Modal({ title, children, onClose, sheet = false }) {
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
            ? 'absolute bottom-0 left-1/2 h-[673px] w-[calc(100%-8px)] max-w-[394px] -translate-x-1/2 [scrollbar-width:none] overflow-y-auto rounded-t-[28px] bg-[#FAFAFA] px-[18px] pt-2 outline-none [&::-webkit-scrollbar]:hidden'
            : 'flex w-[349px] max-w-[calc(100%-32px)] flex-col overflow-hidden rounded-[8px] bg-[#FAFAFA] shadow-[0_0_20px_rgba(18,18,18,0.12)] outline-none [&>h2]:px-6 [&>h2]:pt-6 [&>h2]:text-[20px] [&>h2]:leading-[1.2] [&>h2]:font-semibold [&>p]:px-6 [&>p]:pt-3 [&>p]:text-[14px] [&>p]:leading-[1.4] [&>p]:text-[#8E8E8E]'
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

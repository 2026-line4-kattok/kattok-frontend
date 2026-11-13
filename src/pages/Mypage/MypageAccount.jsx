import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Account({ onLogout, onWithdraw }) {
  return (
    <div className="[&_dt]:text-4 mt-6 flex min-h-[calc(100dvh-168px)] flex-col [&_dt]:font-medium [&_dt]:text-[#3B426B] [&>button:first-of-type]:border-0 [&>button:first-of-type]:px-0 [&>dl]:pb-[12px] [&>dl>div]:flex [&>dl>div]:h-[64px] [&>dl>div]:justify-between [&>dl>div]:py-3">
      <dl>
        <div>
          <dt>이메일</dt>
          <dd>Kattok@mail.com</dd>
        </div>
        <div>
          <dt>가입일</dt>
          <dd>2026년 11월 01일</dd>
        </div>
      </dl>
      <div className="-mx-[18px] mb-3 h-2 bg-[#EBEBEB]" />
      <MenuRow onClick={onLogout}>로그아웃</MenuRow>
      <button
        type="button"
        className="mx-auto mt-auto mb-3 p-3 text-[14px] text-[#8E8E8E] underline"
        onClick={onWithdraw}
      >
        회원 탈퇴
      </button>
    </div>
  );
}

export function LogoutDialog({ onClose }) {
  const navigate = useNavigate();
  return (
    <Modal title="로그아웃할까요?" onClose={onClose}>
      <p>
        다시 로그인하면 등록한 카드와
        <br />
        결제 기록을 그대로 볼 수 있어요.
      </p>
      <div className="[&>button]:font-regular flex min-h-12 [&>button]:flex [&>button]:min-h-12 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center [&>button]:text-[16px] [&>button]:text-[#3B426B]">
        <button type="button" onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className="bg-[#A3B1FF] text-[#7F90E8]"
          onClick={() =>
            navigate('/onboarding', { replace: true, state: { back: true } })
          }
        >
          로그아웃
        </button>
      </div>
    </Modal>
  );
}

export default Account;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,18,18,0.45)] font-['Pretendard',sans-serif] text-[#121212] backdrop-blur-[2px] [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:outline-[#7F90E8] [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-offset-[3px] [&_input:focus-visible]:outline-[#7F90E8]"
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
            ? 'absolute bottom-0 max-h-[90dvh] w-full max-w-[402px] overflow-y-auto rounded-t-[28px] bg-[#FAFAFA] px-[18px] pt-2.5 pb-[max(24px,env(safe-area-inset-bottom))] outline-none motion-safe:animate-[sheet-up_200ms_ease-out]'
            : 'w-[calc(100%-48px)] max-w-[354px] overflow-hidden rounded-[8px] bg-[#FAFAFA] outline-none [&>h2]:px-[24px] [&>h2]:pt-6 [&>h2]:text-[24px] [&>h2]:font-semibold [&>p]:px-[24px] [&>p]:pt-3 [&>p]:pb-6 [&>p]:text-[16px] [&>p]:leading-[1.6] [&>p]:text-[#8E8E8E]'
        }
        onClick={(event) => event.stopPropagation()}
      >
        {sheet && <div className="rounded bg-[#CACACA]" />}
        <h2 id={titleId} className={sheet ? 'sr-only' : ''}>
          {title}
        </h2>
        {children}
      </section>
    </div>,
    document.body,
  );
}

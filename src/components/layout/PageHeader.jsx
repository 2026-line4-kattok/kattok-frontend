import { ChevronLeft, X } from 'lucide-react';

function HeaderIconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-[40px] shrink-0 items-center justify-center text-[#CACACA]"
    >
      {children}
    </button>
  );
}

// 결제·혜택 흐름에서 쓰는 공통 상단 헤더 (뒤로 가기 · 제목 · 닫기)
export default function PageHeader({ title, subtitle, onBack, onClose }) {
  return (
    <div className="mx-auto w-full max-w-[402px] shrink-0 px-4 pt-[71px] max-phone-xs:px-3">
      <header className="flex min-h-[40px] w-full items-center justify-between gap-2">
        <HeaderIconButton label="뒤로 가기" onClick={onBack}>
          <ChevronLeft
            className="size-[40px]"
            strokeWidth={2.5}
            absoluteStrokeWidth
          />
        </HeaderIconButton>
        <div className="flex min-w-0 flex-col items-center gap-[2px]">
          <h1 className="max-w-full truncate font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            {title}
          </h1>
          {subtitle}
        </div>
        <HeaderIconButton label="닫기" onClick={onClose}>
          <X className="size-[40px]" strokeWidth={2.5} absoluteStrokeWidth />
        </HeaderIconButton>
      </header>
    </div>
  );
}

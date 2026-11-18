import { ChevronRight } from 'lucide-react';

export default function Policy({ onOpen }) {
  return (
    <div className="-mx-[18px] mt-6 [&>button]:border-0">
      <MenuRow onClick={() => onOpen('terms')}>서비스 이용약관</MenuRow>
      <MenuRow onClick={() => onOpen('privacy')}>개인정보 처리방침</MenuRow>
      <div className="mt-3 flex justify-between px-[18px] py-3 text-[16px] text-[#8E8E8E]">
        <span>앱 버전</span>
        <span className="text-[#B3B3B3]!">1.0.0</span>
      </div>
    </div>
  );
}

function MenuRow({ children, onClick, muted = false }) {
  return (
    <button
      type="button"
      className={`flex h-[64px] w-full items-center justify-between px-[18px] py-[12px] text-left text-[16px] font-medium text-[#3B426B] [&>svg]:size-[24px] [&>svg]:text-[#CACACA] ${muted ? 'text-[#8E8E8E]' : ''}`}
      onClick={onClick}
    >
      <span>{children}</span>
      <ChevronRight size={20} aria-hidden="true" />
    </button>
  );
}

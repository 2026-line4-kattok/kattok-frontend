import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { HomeIcon, PayIcon, UserIcon, SearchIcon } from '@/assets/icons/icons';

// path가 없는 탭은 이동할 화면이 정해지기 전까지 비활성화합니다.
const TABS = [
  { label: 'Home', icon: HomeIcon, path: '/' },
  { label: 'Card', icon: PayIcon, path: '/card' },
  { label: 'My', icon: UserIcon, path: '/mypage' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] items-center justify-between px-4 pb-[max(28px,env(safe-area-inset-bottom))] max-phone-s:px-3 max-phone-xs:px-2">
      <nav className="flex h-[72px] items-center gap-2 rounded-[32px] bg-[rgba(18,18,18,0.8)] p-[6px] backdrop-blur-[0px] max-phone-s:gap-1">
        {TABS.map(({ label, icon: Icon, path }) => {
          const isActive = path === pathname;

          return (
            <button
              key={label}
              type="button"
              disabled={!path}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigate(path)}
              className={cn(
                'flex h-[60px] items-center justify-center gap-[10px] rounded-[28px] p-[14px] text-[#F1F1F1] max-phone-s:gap-[6px] max-phone-s:p-[10px] max-phone-xs:gap-1 max-phone-xs:p-[6px]',
                isActive
                  ? 'w-[94px] bg-[#4B4B4B] backdrop-blur-[0px] max-phone-s:w-[84px] max-phone-xs:w-[72px]'
                  : 'w-[60px] rounded-[26px] bg-[#2C2C2C] text-[#6E6E6E] max-phone-s:w-[52px] max-phone-xs:w-[44px]',
              )}
            >
              <Icon />
              {isActive && (
                <span className="text-center font-['Pretendard'] text-[12px] leading-[140%] font-medium text-[#F1F1F1]">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label="결제 장소 검색"
        onClick={() => navigate('/search')}
        className="flex w-[72px] shrink-0 flex-col items-start gap-[10px] rounded-[32px] bg-[#8C9EFF] p-6 backdrop-blur-[0px] max-phone-s:w-[64px] max-phone-s:px-5 max-phone-xs:w-[56px] max-phone-xs:px-4"
      >
        <SearchIcon className="size-[24px] text-[#FAFAFA]" />
      </button>
    </div>
  );
}

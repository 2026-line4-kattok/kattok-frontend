import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

const TOAST_DURATION = 4000;

// 하단 내비게이션 위에 떠서 일정 시간 후 사라지는 토스트
export default function Toast({
  icon,
  title,
  description,
  onClick,
  onClose,
  // 누르면 이동하는 화면이 없을 때는 오른쪽 화살표를 숨깁니다.
  hasArrow = true,
  // 아이콘 영역 크기 등을 바꿀 때 사용합니다. (기본 60×60 정사각형)
  iconClassName,
  // 업종 3D 아이콘. 있으면 아이콘 영역에 크게 보여주고 icon은 오른쪽 아래 뱃지로 올립니다.
  categoryIcon,
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 bottom-[calc(72px+max(28px,env(safe-area-inset-bottom))+12px)] z-20 mx-auto w-full max-w-[402px] px-4 max-phone-s:px-3 max-phone-xs:px-2">
      <button
        type="button"
        role="status"
        onClick={onClick}
        className="flex w-full animate-[toast-in_200ms_ease-out] items-center gap-3 rounded-[8px] bg-[rgba(18,18,18,0.75)] p-[6px] pr-4 text-left"
      >
        <span
          className={cn(
            'relative flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#FAFAFA]',
            iconClassName,
          )}
        >
          {categoryIcon ? (
            <>
              <img
                src={categoryIcon}
                alt=""
                className="size-[48px] object-contain"
              />
              {icon && (
                <span className="absolute right-[2px] bottom-[2px] flex">
                  {icon}
                </span>
              )}
            </>
          ) : (
            icon
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className="truncate font-['Pretendard'] text-[20px] leading-[120%] font-semibold">
            {title}
          </span>
          <span className="truncate font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]">
            {description}
          </span>
        </span>
        {hasArrow && (
          <ChevronRight className="size-[24px] shrink-0 text-[#8E8E8E]" />
        )}
      </button>
    </div>
  );
}

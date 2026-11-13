import { useEffect, useState } from 'react';
import EditIcon from '@/assets/icons/Edit.svg?react';
import TrashIcon from '@/assets/mypage/trash.svg?react';
import { cn } from '@/utils/cn';

const SHEET_DURATION = '300ms';

function MenuItem({
  title,
  description,
  icon,
  isSelected,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // 누르는 동안, 그리고 선택된 메뉴는 배경을 Neutral-75로 바꿉니다.
      className={cn(
        'flex h-[96px] w-full items-center justify-between gap-[12px] px-[18px] py-[13px] text-left transition-colors max-phone-xs:px-3',
        isSelected ? 'bg-[#F1F1F1]' : 'bg-[#FAFAFA] active:bg-[#F1F1F1]',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-[4px]">
        <span className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#3B426B]">
          {title}
        </span>
        {description && (
          <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]">
            {description}
          </span>
        )}
      </span>
      {icon}
    </button>
  );
}

// 카드 페이지 더보기(···) 바텀시트: 전월 실적 입력/수정, 카드 삭제
export default function CardMoreSheet({
  card,
  // 마지막으로 남은 카드면 메뉴 설명을 숨깁니다. (삭제할 수 없는 카드)
  isLastCard,
  onClose,
  onEditPerformance,
  onDelete,
}) {
  const [isClosing, setIsClosing] = useState(false);
  // 선택한 메뉴 (시트는 열린 채로 두고, 이동·삭제 처리는 부모가 맡습니다.)
  const [selectedMenu, setSelectedMenu] = useState(null);
  // 시트가 내려가고 배경이 옅어진 뒤에 화면에서 빠집니다.
  const close = () => setIsClosing(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsClosing(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-30">
      <div
        aria-hidden="true"
        onClick={() => close()}
        className="absolute inset-0 bg-[rgba(18,18,18,0.5)] backdrop-blur-[4px]"
        style={{
          animation: `${isClosing ? 'dim-out' : 'dim-in'} ${SHEET_DURATION} ease-out forwards`,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-more-sheet-title"
        onAnimationEnd={(e) => {
          if (isClosing && e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="absolute inset-x-0 bottom-0 mx-auto flex w-[calc(100%-8px)] max-w-[394px] flex-col overflow-hidden rounded-t-[24px] bg-[#FAFAFA] pt-[12px] pb-[max(24px,env(safe-area-inset-bottom))]"
        style={{
          animation: `${isClosing ? 'sheet-down' : 'sheet-up'} ${SHEET_DURATION} ease-out forwards`,
        }}
      >
        <span
          aria-hidden="true"
          className="mx-auto h-[4px] w-[52px] shrink-0 rounded-full bg-[#D9D9D9]"
        />

        <div className="mt-[28px] flex items-center gap-[10px] px-[24px] max-phone-xs:px-4">
          <span className="relative h-[32px] w-[50px] shrink-0 overflow-hidden rounded-[2px]">
            <img
              src={card.image}
              alt=""
              className={cn(
                'absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
                card.isHorizontal
                  ? 'size-full'
                  : 'h-[50px] w-[32px] -rotate-90',
              )}
            />
          </span>
          <h2
            id="card-more-sheet-title"
            className="truncate font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]"
          >
            {card.name}
          </h2>
        </div>

        <div className="mt-[20px] flex flex-col gap-px bg-[#E3E3E3] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)]">
          <MenuItem
            title="전월 실적 입력 및 수정"
            description={
              !isLastCard && '이번 달 혜택을 받을 수 있는지 판단할 때 써요'
            }
            icon={<EditIcon className="size-[20px] shrink-0" />}
            isSelected={selectedMenu === 'performance'}
            onClick={() => {
              setSelectedMenu('performance');
              onEditPerformance?.();
            }}
            className="border-b-[1px] border-b-[#CACACA]"
          />
          <MenuItem
            title="카드 삭제"
            description={
              !isLastCard && `이번 달 ${card.name} 혜택을 받을 수 없어요`
            }
            icon={<TrashIcon className="size-[20px] shrink-0" />}
            isSelected={selectedMenu === 'delete'}
            onClick={() => {
              setSelectedMenu('delete');
              onDelete?.();
            }}
          />
        </div>

        <div className="px-[20px] max-phone-xs:px-3">
          <button
            type="button"
            onClick={() => close()}
            className="mt-[32px] flex h-[54px] w-full items-center justify-center rounded-[27px] bg-[#121212] font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#FAFAFA]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

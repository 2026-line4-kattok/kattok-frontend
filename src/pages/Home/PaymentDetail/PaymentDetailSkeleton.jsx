import { cn } from '@/utils/cn';

// 빛이 왼쪽에서 오른쪽으로 지나가는 회색 자리 표시
function Bone({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-shimmer bg-[linear-gradient(90deg,#E6E6E6_25%,#F8F8F8_50%,#E6E6E6_75%)] bg-size-[200%_100%]',
        className,
      )}
    />
  );
}

function OtherCardSkeleton() {
  return (
    <li className="flex w-full items-start gap-[10px]">
      <Bone className="h-[76px] w-[48px] shrink-0 rounded-[8px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <div className="flex flex-col gap-[6px]">
          <Bone className="h-[20px] w-[110px] rounded-full" />
          <Bone className="h-[14px] w-[130px] rounded-full" />
        </div>
        <Bone className="h-[8px] w-full rounded-full" />
      </div>
    </li>
  );
}

// 혜택 금액 확인 화면이 로딩 중일 때 보여주는 본문 (헤더·하단 버튼은 그대로 둡니다)
export default function PaymentDetailSkeleton({ otherCardsTitle }) {
  return (
    <div
      role="status"
      aria-label="혜택 금액을 계산하고 있어요"
      className="mx-auto flex w-full max-w-[402px] flex-col items-center gap-[24px] px-[18px] pt-[24px] pb-[calc(104px+max(20px,env(safe-area-inset-bottom)))] max-phone-xs:px-3"
    >
      <div className="mb-[12px] flex flex-col items-center gap-[20px]">
        <Bone className="h-[176px] w-[280px] rounded-[8px]" />
        <Bone className="h-[36px] w-[172px] rounded-full" />
      </div>

      <div className="flex w-full flex-col gap-[12px] pt-[34px]">
        <div className="flex w-full flex-col gap-[16px] rounded-[8px] bg-[#FAFAFA] px-[24px] py-[20px] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-m:px-4">
          <Bone className="h-[20px] w-full rounded-full" />
          <div className="flex flex-col gap-[8px]">
            <Bone className="h-[20px] w-[78%] rounded-full" />
            <Bone className="h-[20px] w-[78%] rounded-full" />
          </div>
        </div>
      </div>

      <section className="flex w-full flex-col gap-[16px]">
        <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#6E6E6E]">
          {otherCardsTitle}
        </h2>
        <ul className="flex w-full flex-col gap-[20px]">
          <OtherCardSkeleton />
          <OtherCardSkeleton />
        </ul>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Check } from 'lucide-react';
import { totalSaving, won } from './mypageData';

function Withdrawal({ payments, onContinue, onWithdraw }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex min-h-[calc(100dvh-168px)] flex-col [&>h2]:my-2 [&>h2]:text-[24px] [&>h2]:leading-[1.2] [&>h2]:font-semibold [&>h2]:text-[#121212]">
      <h2 className="mt-6!">
        탈퇴하면 회원님의
        <br />
        정보가 모두 사라져요
      </h2>
      <p className="text-[16px] text-[#4B4B4B]">
        삭제된 정보는 다시 되돌릴 수 없어요
      </p>
      <dl className="mt-[32px] flex flex-col gap-4 rounded-[8px] bg-[#FAFAFA] px-6 py-4 [&_dd]:text-[20px] [&_dd]:font-semibold [&_dd]:text-[#8C9EFF] [&_dt]:text-[16px] [&_dt]:font-medium [&_dt]:text-[#8E8E8E] [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:py-0 [&>div]:leading-6">
        <div>
          <dt>등록한 카드</dt>
          <dd>3장</dd>
        </div>
        <div>
          <dt>결제 기록</dt>
          <dd>{payments.filter((item) => !item.pending).length}건</dd>
        </div>
        <div>
          <dt>카똑으로 챙긴 혜택</dt>
          <dd>{won(totalSaving(payments))}</dd>
        </div>
        <div>
          <dt>입력한 실적·입력한 실적</dt>
        </div>
      </dl>
      <label className="mt-[21px] flex cursor-pointer items-center gap-3 text-[16px] leading-[1.4] font-medium text-[#3B426B]">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-none border-[3px] border-[#CACACA] bg-transparent transition-colors duration-300 ease-in-out peer-checked:bg-[#CACACA] motion-reduce:transition-none peer-checked:[&>svg]:opacity-100"
        >
          <Check
            className="size-[18px] text-[#FAFAFA] opacity-0 transition-opacity duration-300 ease-in-out motion-reduce:transition-none"
            strokeWidth={3}
          />
        </span>
        <span>위 내용을 확인했어요</span>
      </label>
      <div className="mt-auto flex w-full gap-2.5 pt-12">
        {checked && (
          <button
            type="button"
            className="flex h-[54px] min-w-0 flex-1 items-center justify-center rounded-[8px] bg-transparent p-2.5 text-[20px] leading-[1.2] font-semibold text-[#3B426B]"
            onClick={onWithdraw}
          >
            탈퇴하기
          </button>
        )}
        <button
          type="button"
          className="flex h-[54px] min-w-0 flex-1 items-center justify-center rounded-[8px] bg-[#A3B1FF] p-2.5 text-[20px] leading-[1.2] font-semibold text-[#3B426B]"
          onClick={onContinue}
        >
          계속 쓸게요
        </button>
      </div>
    </div>
  );
}

export default Withdrawal;

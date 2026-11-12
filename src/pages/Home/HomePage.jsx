import { Check, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';
import Toast from '@/components/common/Toast';
import BottomNav from '@/components/layout/BottomNav';

const CATEGORIES = [
  '카페',
  '편의점',
  '음식점',
  '마트',
  '온라인 쇼핑',
  '약국',
  '택시',
  '백화점',
];

// TODO: API 연동 시 서버 데이터로 교체합니다.
const MONTHLY_BENEFIT = 12400;
const RECENT_PAYMENTS = [
  {
    id: 1,
    place: '카카오 택시',
    category: '택시',
    date: '11월 04일',
    cardName: '신한카드 Mr.Life',
    cardImage: mrLifeImage,
  },
  {
    id: 2,
    place: '스타벅스',
    category: '카페',
    date: '11월 02일',
    cardName: '하나 K패스 체크카드',
    cardImage: hanaKPassCheckImage,
  },
];

// 이전에 카드 추천을 받았지만 결제 완료 기록을 하지 않은 건
// TODO: API 연동 시 서버 데이터로 교체합니다. (개발 중이라 기본으로 노출)
const PENDING_PAYMENT = {
  id: 1,
  cardName: 'KB 국민 노리2',
  place: '스타벅스',
  amount: 30000,
};

const AMOUNT_PATH = '/payment/amount';

// 결제 완료 여부 확인 카드
function PendingPaymentCard({ payment, onMore, onReject, onConfirm }) {
  const { cardName, place, amount } = payment;

  return (
    <div className="-mt-3 w-full overflow-hidden rounded-b-[8px] bg-[#EBEBEB]">
      <div className="flex flex-col gap-3 px-[24px] pt-[27px] pb-[16px] max-phone-m:px-4 max-phone-xs:px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <span className="flex size-[20px] items-center justify-center rounded-full bg-[#C4C4C4] text-[14px] leading-none font-bold text-[#FAFAFA]">
              !
            </span>
            <span className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
              확인
            </span>
          </div>
          <button
            type="button"
            onClick={onMore}
            className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]"
          >
            더보기
          </button>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-['Pretendard'] text-[18px] leading-[120%] font-semibold text-[#121212]">
            {cardName}로 결제하셨나요?
          </p>
          <p className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]">
            {place} · {amount.toLocaleString('ko-KR')}원
          </p>
        </div>
      </div>
      <div className="flex h-[36px]">
        <button
          type="button"
          onClick={onReject}
          aria-label="결제하지 않았어요"
          className="flex flex-1 items-center justify-center bg-[#F8C5C0]"
        >
          <X className="size-[22px] text-[#D53D30]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onConfirm}
          aria-label="결제했어요"
          className="flex flex-1 items-center justify-center bg-[#CAD2FF]"
        >
          <Check className="size-[22px] text-[#7F90E8]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

// 하단 최근 결제 카드 목록
function RecentPaymentCard({ payment, onClick }) {
  const { place, category, date, cardName, cardImage } = payment;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[180px] w-[280px] shrink-0 flex-wrap content-start items-start gap-y-1 overflow-hidden rounded-[8px] bg-[#FAFAFA] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)]"
    >
      <div className="flex h-[180px] w-[113px] shrink-0 flex-col items-center justify-center gap-4 overflow-hidden rounded-[8px]">
        {cardImage && (
          <img
            src={cardImage}
            alt={cardName}
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="flex h-[180px] flex-[1_0_0] flex-col items-start justify-between p-4">
        <div className="flex flex-col items-start gap-1">
          <p className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#3B426B]">
            {place}
          </p>
          <p className="font-['Pretendard'] text-[14px] leading-[140%] font-normal text-[#8E8E8E]">
            {category} · {date}
          </p>
        </div>
        <span className="flex h-[36px] shrink-0 items-center justify-center gap-1 self-stretch rounded-[27px] bg-[#A3B1FF] px-3 py-[10px] text-center font-['Pretendard'] text-[16px] leading-[140%] font-normal text-[#3B426B]">
          바로 입력
        </span>
      </div>
    </button>
  );
}

// 최근 결제 내역이 없는 경우
function EmptyRecentCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[174px] w-full items-center justify-center rounded-xl bg-[#FAFAFA] font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#8E8E8E]"
    >
      최근 결제 내역이 없어요
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [pendingPayment, setPendingPayment] = useState(PENDING_PAYMENT);
  const [isRejectToastOpen, setIsRejectToastOpen] = useState(false);
  const closeRejectToast = useCallback(() => setIsRejectToastOpen(false), []);

  const handleRejectPayment = () => {
    // TODO: API 연동 시 결제 거부 여부를 서버에 기록합니다.
    setPendingPayment(null);
    setIsRejectToastOpen(true);
  };

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-[1_0_0] flex-col items-start gap-[24px] self-stretch px-[18px] pt-[86px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))] max-phone-xs:px-3">
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-['Pretendard'] text-[24px] leading-[120%] font-semibold text-[#121212]">
            어디서 결제하세요?
          </h1>
          <p className="font-['Pretendard'] text-[16px] leading-[140%] font-normal break-keep text-[#8E8E8E] max-phone-s:text-[14px]">
            내 카드 중 가장 혜택 좋은 카드를 알려드려요
          </p>
        </div>

        <div className="flex w-full flex-col">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="relative z-10 flex min-h-[60px] w-full items-center justify-between gap-2 rounded-[8px] bg-[#fafafa] px-[24px] py-3 shadow-[0_4px_12px_0_rgba(0,0,0,0.04)] max-phone-m:px-4 max-phone-xs:px-3"
          >
            <span className="min-w-0 text-left font-['Pretendard'] text-[16px] leading-[140%] font-medium break-keep text-[#6E6E6E] max-phone-s:text-[14px]">
              이번 달 카똑으로 챙긴 혜택
            </span>
            <span className="shrink-0 font-['Pretendard'] text-[24px] leading-[120%] font-semibold whitespace-nowrap text-[#8C9EFF] max-phone-m:text-[20px] max-phone-s:text-[18px]">
              {MONTHLY_BENEFIT.toLocaleString('ko-KR')}원
            </span>
          </button>
          {pendingPayment && (
            <PendingPaymentCard
              payment={pendingPayment}
              // TODO: 결제 내역 상세 화면 연결
              onMore={() => {}}
              // TODO: API 연동 시 결제 여부를 서버에 기록합니다.
              onReject={handleRejectPayment}
              onConfirm={() => setPendingPayment(null)}
            />
          )}
        </div>

        <section className="flex w-full flex-col gap-[12px]">
          <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
            업종으로 고르기
          </h2>
          <ul className="grid min-h-[200px] w-full grid-cols-4 content-start justify-items-center gap-y-1 rounded-[8px] bg-[#FAFAFA] px-3 pt-2 pb-3 shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-xs:px-1">
            {CATEGORIES.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(AMOUNT_PATH, { state: { category: label } })
                  }
                  className="flex w-full flex-col items-center gap-y-[4px]"
                >
                  <span className="size-[64px] bg-[repeating-conic-gradient(#efefef_0_25%,#fafafa_0_50%)] bg-size-[16px_16px] max-phone-xs:size-[52px]" />
                  <span className="text-center font-['Pretendard'] text-[14px] leading-[140%] font-normal break-keep text-[#8E8E8E] max-phone-s:text-[13px] max-phone-xs:text-[12px]">
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full">
          <h2 className="font-['Pretendard'] text-[16px] leading-[140%] font-medium text-[#6E6E6E]">
            최근 결제
          </h2>
          {RECENT_PAYMENTS.length > 0 ? (
            <div className="-mx-[18px] mt-[12px] flex [scrollbar-width:none] gap-3 overflow-x-auto px-[18px] max-phone-xs:-mx-3 max-phone-xs:px-3 [&::-webkit-scrollbar]:hidden">
              {RECENT_PAYMENTS.map((payment) => (
                <RecentPaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() =>
                    navigate(AMOUNT_PATH, {
                      state: {
                        category: payment.category,
                        place: payment.place,
                      },
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-[12px]">
              <EmptyRecentCard onClick={() => navigate('/search')} />
            </div>
          )}
        </section>
      </main>

      {isRejectToastOpen && (
        <Toast
          icon={
            <span className="flex size-[24px] items-center justify-center rounded-full bg-[#E46A5E]">
              <X className="size-[18px] text-[#FAFAFA]" strokeWidth={2} />
            </span>
          }
          title={<span className="text-[#EE695D]">결제 기록 거부됨</span>}
          description="추후에 일괄로 등록할 수 있어요"
          // TODO: 일괄 등록 화면이 정해지면 연결합니다.
          onClick={closeRejectToast}
          onClose={closeRejectToast}
        />
      )}

      <BottomNav />
    </div>
  );
}

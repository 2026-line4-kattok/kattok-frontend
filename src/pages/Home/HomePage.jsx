import { useNavigate } from 'react-router-dom';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';
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

const AMOUNT_PATH = '/payment/amount';

// 하단 최근 결제 카드 목록
function RecentPaymentCard({ payment, onClick }) {
  const { place, category, date, cardName, cardImage } = payment;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-wrap shrink-0 content-start items-start gap-y-1 h-[180px] w-[280px] overflow-hidden rounded-[8px] bg-[#FAFAFA] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)]"
    >
      <div className="w-[113px] h-[180px] flex flex-col justify-center items-center gap-4 shrink-0 overflow-hidden rounded-[8px]">
        {cardImage && (
          <img
            src={cardImage}
            alt={cardName}
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-between items-start h-[180px] p-4 flex-[1_0_0]">
        <div className="flex flex-col items-start gap-1">
          <p className="text-[#3B426B] font-['Pretendard'] text-[16px] font-medium leading-[140%]">{place}</p>
          <p className="text-[#8E8E8E] font-['Pretendard'] text-[14px] font-normal leading-[140%]">
            {category} · {date}
          </p>
        </div>
        <span className="flex h-[36px] px-3 py-[10px] justify-center items-center gap-1 shrink-0 self-stretch rounded-[27px] bg-[#A3B1FF] text-[#3B426B] text-center font-['Pretendard'] text-[16px] font-normal leading-[140%]">
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
      className="flex h-[174px] w-full items-center justify-center rounded-xl bg-[#FAFAFA] text-[#8E8E8E] font-['Pretendard'] text-[16px] font-medium leading-[140%]"
    >
      최근 결제 내역이 없어요
    </button>
  );
}


export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto w-full max-w-[402px] pt-[86px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))] px-[18px] flex flex-col items-start gap-[24px] flex-[1_0_0] self-stretch max-phone-xs:px-3">
        <div className='flex flex-col gap-[6px]'>
          <h1 className="text-[#121212] font-['Pretendard'] text-[24px] font-semibold leading-[120%]">어디서 결제하세요?</h1>
          <p className="text-[#8E8E8E] font-['Pretendard'] text-[16px] font-normal leading-[140%] break-keep max-phone-s:text-[14px]">
            내 카드 중 가장 혜택 좋은 카드를 알려드려요
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/mypage')}
          className="px-[24px] py-3 flex min-h-[60px] w-full items-center justify-between gap-2 rounded-xl bg-[#fafafa] max-phone-m:px-4 max-phone-xs:px-3"
        >
          <span className="min-w-0 text-left break-keep text-[#6E6E6E] font-['Pretendard'] text-[16px] font-medium leading-[140%] max-phone-s:text-[14px]">
            이번 달 카똑으로 챙긴 혜택
          </span>
          <span className="shrink-0 whitespace-nowrap text-[#8C9EFF] font-['Pretendard'] text-[24px] font-semibold leading-[120%] max-phone-m:text-[20px] max-phone-s:text-[18px]">
            {MONTHLY_BENEFIT.toLocaleString('ko-KR')}원
          </span>
        </button>

        <section className='flex w-full flex-col gap-[12px]'>
          <h2 className="text-[#6E6E6E] font-['Pretendard'] text-[16px] font-medium leading-[140%]">
            업종으로 고르기
          </h2>
          <ul className="w-full min-h-[200px] grid grid-cols-4 justify-items-center content-start gap-y-1 pt-2 px-3 pb-3 rounded-[8px] bg-[#FAFAFA] shadow-[0_0_12px_2px_rgba(0,0,0,0.02)] max-phone-xs:px-1">
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
                  <span className="text-[#8E8E8E] text-center font-['Pretendard'] text-[14px] font-normal leading-[140%] break-keep max-phone-s:text-[13px] max-phone-xs:text-[12px]">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full">
          <h2 className="text-[#6E6E6E] font-['Pretendard'] text-[16px] font-medium leading-[140%]">최근 결제</h2>
          {RECENT_PAYMENTS.length > 0 ? (
            <div className="-mx-[18px] mt-[12px] flex [scrollbar-width:none] gap-3 overflow-x-auto px-[18px] [&::-webkit-scrollbar]:hidden max-phone-xs:-mx-3 max-phone-xs:px-3">
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

      <BottomNav />
    </div>
  );
}

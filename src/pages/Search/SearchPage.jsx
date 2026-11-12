import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '@/assets/icons/icons';
import hiPointPlanPlusImage from '@/assets/card/신한카드 Hi Point Plan+.png';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import simplePlanPlusImage from '@/assets/card/신한카드 Simple Plan+.png';
import noriImage from '@/assets/card/KB 국민은행 노리2.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';

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
const RECENT_PLACES = [
  {
    id: 1,
    place: '스타벅스',
    category: '카페',
    date: '11월 04일',
    cardImage: noriImage,
  },
  {
    id: 2,
    place: 'GS25',
    category: '편의점',
    date: '11월 03일',
    cardImage: mrLifeImage,
  },
  {
    id: 3,
    place: '쿠팡',
    category: '온라인 쇼핑',
    date: '11월 03일',
    cardImage: noriImage,
  },
  {
    id: 4,
    place: '카카오 택시',
    category: '택시',
    date: '11월 03일',
    cardImage: hanaKPassCheckImage,
  },
  {
    id: 5,
    place: '아이파크몰',
    category: '마트',
    date: '10월 28일',
    cardImage: simplePlanPlusImage,
  },
  {
    id: 6,
    place: '스타필드 하남',
    category: '마트',
    date: '10월 28일',
    cardImage: hiPointPlanPlusImage,
  },
];

const AMOUNT_PATH = '/payment/amount';

// 세로형 카드 이미지를 가로로 돌려서 보여줍니다.
function CardThumbnail({ image }) {
  return (
    <span className="relative h-[64px] w-[102px] shrink-0 overflow-hidden rounded-[8px] bg-[#CACACA]">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute top-1/2 left-1/2 h-[102px] w-[64px] -translate-x-1/2 -translate-y-1/2 -rotate-90 object-cover"
        />
      )}
    </span>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const trimmed = keyword.trim();
  const places = trimmed
    ? RECENT_PLACES.filter(
        ({ place, category }) =>
          place.includes(trimmed) || category.includes(trimmed),
      )
    : RECENT_PLACES;

  const goToAmount = (state) => navigate(AMOUNT_PATH, { state });

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col px-[18px] pt-[86px] pb-[max(28px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <div className="flex items-center gap-[10px]">
          <label className="flex h-[48px] min-w-0 flex-1 items-center gap-[4px] rounded-[8px] bg-[#EBEBEB] px-[8px]">
            <SearchIcon className="size-[20px] m-[8px] shrink-0 text-[#B0B0B0]" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search"
              aria-label="결제 장소 검색"
              autoFocus
              className="min-w-0 flex-1 bg-transparent font-['Pretendard'] text-[16px] leading-[140%] text-[#121212] caret-[#A3B1FF] outline-none placeholder:indent-[4px] placeholder:text-[#8E8E8E] [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="닫기"
            className="flex size-[34px] shrink-0 items-center justify-center text-[#CACACA]"
          >
            <X className="size-[24px]" strokeWidth={2} />
          </button>
        </div>

        <section className="mt-[32px] flex flex-col">
          <h2 className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            업종으로 고르기
          </h2>
          <p className="mt-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#B3B3B3]">
            매장 전용 혜택은 빼고 계산해요
          </p>
          <ul className="-mx-[18px] mt-[20px] flex [scrollbar-width:none] gap-[22px] overflow-x-auto px-[18px] max-phone-xs:-mx-3 max-phone-xs:px-3 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((label) => (
              <li key={label} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goToAmount({ category: label })}
                  className="flex w-[60px] flex-col items-center gap-[4px]"
                >
                  <span className="size-[64px] bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f6f6f6_0_50%)] bg-size-[15px_15px]" />
                  <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] whitespace-nowrap text-[#8E8E8E]">
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-[48px] flex flex-col">
          <h2 className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            최근 결제한 곳
          </h2>
          {places.length > 0 ? (
            <ul className="mt-[24px] flex flex-col">
              {places.map(({ id, place, category, date, cardImage }) => (
                <li key={id} className='py-[8px]'>
                  <button
                    type="button"
                    onClick={() => goToAmount({ category, place })}
                    className="flex w-full items-center gap-[12px] text-left"
                  >
                    <CardThumbnail image={cardImage} />
                    <span className="flex min-w-0 flex-col gap-[4px]">
                      <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
                        {place}
                      </span>
                      <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                        {category} · {date}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-[28px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              검색 결과가 없어요
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

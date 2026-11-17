import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '@/assets/icons/icons';
import { getCategoryIcon } from '@/constants/categories';
import useMerchantCategories from '@/hooks/useMerchantCategories';
import useRecentMerchants from '@/hooks/useRecentMerchants';
import { cn } from '@/utils/cn';

const AMOUNT_PATH = '/payment/amount';

// 최근 결제한 곳의 업종 아이콘
function CategoryThumbnail({ category }) {
  const icon = getCategoryIcon(category);
  return (
    <span className="flex h-[64px] w-[102px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#EBEBEB]">
      {icon ? (
        <img src={icon} alt="" className="size-[48px] object-contain" />
      ) : (
        <span className="size-[48px] bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f6f6f6_0_50%)] bg-size-[12px_12px]" />
      )}
    </span>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  // 업종 칩 (개수·순서·ID는 서버 응답 기준)
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useMerchantCategories();

  const {
    data: recentMerchants = [],
    isPending: isRecentPending,
    isError: isRecentError,
    refetch: refetchRecent,
  } = useRecentMerchants();

  // TODO: 4-4 결제처 검색 API 연동 전까지는 최근 결제한 곳 안에서만 걸러 봅니다.
  const trimmed = keyword.trim();
  const places = trimmed
    ? recentMerchants.filter(
        ({ place, category }) =>
          place.includes(trimmed) || category.includes(trimmed),
      )
    : recentMerchants;

  const goToAmount = (state) => navigate(AMOUNT_PATH, { state });

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col px-[18px] pt-[86px] pb-[max(28px,env(safe-area-inset-bottom))] max-phone-xs:px-3">
        <div className="flex items-center gap-[10px]">
          <label className="flex h-[48px] min-w-0 flex-1 items-center gap-[4px] rounded-[8px] bg-[#EBEBEB] px-[8px]">
            <SearchIcon className="m-[8px] size-[20px] shrink-0 text-[#B0B0B0]" />
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
          {isCategoriesPending ? (
            <p className="mt-[20px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              업종을 불러오는 중이에요
            </p>
          ) : isCategoriesError ? (
            <div className="mt-[20px] flex flex-col items-center gap-[12px] font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              <p>업종을 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => refetchCategories()}
                className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
              >
                다시 시도
              </button>
            </div>
          ) : categories.length === 0 ? (
            <p className="mt-[20px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              선택할 수 있는 업종이 없어요
            </p>
          ) : (
            <ul className="-mx-[18px] mt-[20px] flex [scrollbar-width:none] gap-[22px] overflow-x-auto px-[18px] max-phone-xs:-mx-3 max-phone-xs:px-3 [&::-webkit-scrollbar]:hidden">
              {categories.map(({ id, name, icon }) => (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    // 업종만 고르면 merchantId 없이 categoryId만 보냅니다.
                    onClick={() =>
                      goToAmount({ categoryId: id, category: name })
                    }
                    className="flex w-[60px] flex-col items-center gap-[4px]"
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="size-[64px] object-contain"
                      />
                    ) : (
                      <span className="size-[64px] bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f6f6f6_0_50%)] bg-size-[12px_12px]" />
                    )}
                    <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] whitespace-nowrap text-[#8E8E8E]">
                      {name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-[48px] flex flex-col">
          <h2 className="font-['Pretendard'] text-[18px] leading-[120%] font-[600] text-[#4B4B4B]">
            최근 결제한 곳
          </h2>
          {isRecentPending ? (
            <p className="mt-[28px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              최근 결제한 곳을 불러오는 중이에요
            </p>
          ) : isRecentError ? (
            <div className="mt-[28px] flex flex-col items-center gap-[12px] font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              <p>최근 결제한 곳을 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => refetchRecent()}
                className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
              >
                다시 시도
              </button>
            </div>
          ) : places.length > 0 ? (
            <ul className="mt-[24px] flex flex-col">
              {places.map((merchant) => (
                <li key={merchant.id} className="py-[8px]">
                  <button
                    type="button"
                    disabled={!merchant.supported}
                    onClick={() =>
                      goToAmount({
                        merchantId: merchant.id,
                        categoryId: merchant.categoryId,
                        category: merchant.category,
                        place: merchant.place,
                      })
                    }
                    className={cn(
                      'flex w-full items-center gap-[12px] text-left',
                      !merchant.supported && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <CategoryThumbnail category={merchant.category} />
                    <span className="flex min-w-0 flex-col gap-[4px]">
                      <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
                        {merchant.place}
                      </span>
                      <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                        {merchant.supported
                          ? `${merchant.category} · ${merchant.date}`
                          : (merchant.unsupportedReason ??
                            '카똑이 아직 계산하지 않는 곳')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-[28px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
              {trimmed ? '검색 결과가 없어요' : '최근 결제한 곳이 없어요'}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

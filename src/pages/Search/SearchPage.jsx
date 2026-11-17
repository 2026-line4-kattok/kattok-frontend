import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '@/assets/icons/icons';
import { getCategoryIcon } from '@/constants/categories';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useMerchantCategories from '@/hooks/useMerchantCategories';
import useMerchantSearch from '@/hooks/useMerchantSearch';
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

// 결제처 이름에서 검색어와 일치하는 부분을 강조합니다. (영문 대소문자 무시)
// 별칭에만 일치해 대표 이름에 일치하는 부분이 없으면 강조하지 않습니다.
function HighlightedName({ name, keyword }) {
  const index = keyword
    ? name.toLowerCase().indexOf(keyword.toLowerCase())
    : -1;
  if (index < 0) return name;
  return (
    <>
      {name.slice(0, index)}
      <mark className="bg-transparent text-[#8C9EFF]">
        {name.slice(index, index + keyword.length)}
      </mark>
      {name.slice(index + keyword.length)}
    </>
  );
}

const STATUS_TEXT =
  "mt-[28px] text-center font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]";

// 조회 실패 안내 (빈 결과로 숨기지 않습니다)
function RetryMessage({ message, onRetry }) {
  return (
    <div className="mt-[28px] flex flex-col items-center gap-[12px] font-['Pretendard'] text-[14px] leading-[140%] text-[#8E8E8E]">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
      >
        다시 시도
      </button>
    </div>
  );
}

// 결제처 목록 (최근 결제한 곳·검색 결과 공용). 미지원 결제처는 흐리게 보여 주고 선택을 막습니다.
function MerchantList({ merchants, keyword, onSelect }) {
  return (
    <ul className="mt-[24px] flex flex-col">
      {merchants.map((merchant) => (
        <li key={merchant.id} className="py-[8px]">
          <button
            type="button"
            disabled={!merchant.supported}
            onClick={() => onSelect(merchant)}
            className={cn(
              'flex w-full items-center gap-[12px] text-left',
              !merchant.supported && 'cursor-not-allowed opacity-50',
            )}
          >
            <CategoryThumbnail category={merchant.category} />
            <span className="flex min-w-0 flex-col gap-[4px]">
              <span className="truncate font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
                <HighlightedName name={merchant.place} keyword={keyword} />
              </span>
              <span className="font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                {merchant.supported
                  ? [merchant.category, merchant.date]
                      .filter(Boolean)
                      .join(' · ')
                  : (merchant.unsupportedReason ??
                    '카똑이 아직 계산하지 않는 곳')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
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

  // 앞뒤 공백을 뺀 검색어가 있으면 검색 결과, 없으면 최근 결제한 곳을 보여 줍니다.
  const trimmed = keyword.trim();
  const debouncedKeyword = useDebouncedValue(trimmed);
  const {
    data: searchResults = [],
    isPending: isSearchPending,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useMerchantSearch(debouncedKeyword);
  // 디바운스 대기 중에도 '검색 결과가 없어요'가 잠깐 보이지 않도록 검색 중으로 봅니다.
  const isSearching = trimmed !== debouncedKeyword || isSearchPending;

  const goToAmount = (state) => navigate(AMOUNT_PATH, { state });
  const selectMerchant = (merchant) =>
    goToAmount({
      merchantId: merchant.id,
      categoryId: merchant.categoryId,
      category: merchant.category,
      place: merchant.place,
    });

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
            {trimmed ? '검색 결과' : '최근 결제한 곳'}
          </h2>
          {trimmed ? (
            isSearching && searchResults.length === 0 ? (
              <p className={STATUS_TEXT}>검색 중이에요</p>
            ) : isSearchError ? (
              <RetryMessage
                message="검색하지 못했어요"
                onRetry={() => refetchSearch()}
              />
            ) : searchResults.length > 0 ? (
              <MerchantList
                merchants={searchResults}
                keyword={debouncedKeyword}
                onSelect={selectMerchant}
              />
            ) : (
              <p className={STATUS_TEXT}>
                검색 결과가 없어요
                <br />
                위의 업종으로 골라 보세요
              </p>
            )
          ) : isRecentPending ? (
            <p className={STATUS_TEXT}>최근 결제한 곳을 불러오는 중이에요</p>
          ) : isRecentError ? (
            <RetryMessage
              message="최근 결제한 곳을 불러오지 못했어요"
              onRetry={() => refetchRecent()}
            />
          ) : recentMerchants.length > 0 ? (
            <MerchantList
              merchants={recentMerchants}
              onSelect={selectMerchant}
            />
          ) : (
            <p className={STATUS_TEXT}>최근 결제한 곳이 없어요</p>
          )}
        </section>
      </main>
    </div>
  );
}

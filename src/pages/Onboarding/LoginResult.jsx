import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import login_check from '@/assets/onboarding/login_check.svg';
import login_help from '@/assets/onboarding/login-help.svg';
import empty from '@/assets/onboarding/card/empty.png';
function CardCarousel({ cards, loading }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (
      loading ||
      !track ||
      cards.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const timer = window.setInterval(() => {
      if (track.matches(':hover') || track.contains(document.activeElement))
        return;
      const firstCard = track.firstElementChild;
      const nextCard = firstCard?.nextElementSibling;
      if (!nextCard) return;
      const distance = nextCard.offsetLeft - firstCard.offsetLeft;
      const atEnd =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + distance,
        behavior: 'smooth',
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [cards.length, loading]);

  return (
    <div
      ref={trackRef}
      role="region"
      aria-label="등록된 카드 목록"
      tabIndex={loading ? -1 : 0}
      aria-busy={loading}
      className="relative mt-12 flex max-h-[340px] min-h-0 w-full flex-1 snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-[18px] [&::-webkit-scrollbar]:hidden"
    >
      {(loading
        ? [{ id: 'loading-1' }, { id: 'loading-2' }, { id: 'loading-3' }]
        : cards
      ).map((card) => (
        <div
          key={card.id}
          className="aspect-[215/340] h-full shrink-0 snap-start scroll-ml-[18px]"
        >
          {loading ? (
            <div className="h-full w-full rounded-[14px] bg-gradient-to-b from-[#E2E2E2] via-[#FAFAFA] to-[#E2E2E2]" />
          ) : (
            <img
              src={card.image}
              alt={card.name}
              draggable={false}
              className="h-full w-full rounded-[14px] object-contain"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function LoginResult({ cards, loading = false }) {
  const navigate = useNavigate();
  const hasCards = loading || cards.length > 0;
  const buttonClass =
    'h-[54px] w-full cursor-pointer rounded-[8px] bg-[#A3B1FF] text-[20px] font-semibold text-[#3B426B]';

  return (
    <div className="mx-auto flex h-dvh max-w-[402px] [scrollbar-width:none] flex-col items-center overflow-x-hidden overflow-y-auto bg-[#F1F1F1] pt-[190px] [&::-webkit-scrollbar]:hidden">
      <img
        src={hasCards ? login_check : login_help}
        alt=""
        className="size-20 shrink-0 object-contain"
      />
      <h1 className="mt-7 shrink-0 text-[24px] font-semibold text-[#3B426B]">
        {loading
          ? '로그인 완료!'
          : hasCards
            ? '불러오기 완료!'
            : '등록된 카드가 없어요'}
      </h1>
      <p className="mt-2 shrink-0 px-[18px] text-center text-[16px] leading-6 text-[#8E8E8E]">
        {loading ? (
          '카드 정보를 불러오고 있어요...'
        ) : hasCards ? (
          '홈에서 다음 결제의 유리한 카드를 확인해요'
        ) : (
          <>
            사용중인 카드를 등록하고
            <br />
            이번 혜택을 받을 수 있는지 확인해봐요
          </>
        )}
      </p>
      {hasCards ? (
        <CardCarousel cards={cards} loading={loading} />
      ) : (
        <div className="mt-6 flex max-h-[340px] min-h-0 w-full flex-1 justify-center">
          <img
            src={empty}
            alt=""
            className="h-full min-h-0 w-auto max-w-full object-contain"
          />
        </div>
      )}
      <div className="mt-auto flex w-full shrink-0 flex-col items-center gap-3 px-[18px] pt-8 pb-11">
        {!hasCards && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-[54px] cursor-pointer text-[20px] font-semibold text-[#3B426B]"
          >
            홈으로 가기
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            hasCards
              ? navigate('/')
              : navigate('/signup', { state: { initialStep: 2 } })
          }
          disabled={loading}
          aria-hidden={loading || undefined}
          tabIndex={loading ? -1 : 0}
          style={loading ? { visibility: 'hidden' } : undefined}
          className={buttonClass}
        >
          {hasCards ? '홈으로 가기' : '카드 등록하기'}
        </button>
      </div>
    </div>
  );
}

import { Check, Ellipsis, Plus, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '@/components/common/Toast';
import { DeletePaymentDialog, Modal } from '@/pages/Mypage/MypageRecord';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/utils/cn';
import CardUsageAmountScreen from '@/pages/Home/PaymentDetail/CardUsageAmountScreen';
import CardUsageSheet from '@/pages/Home/PaymentDetail/CardUsageSheet';
import CardMoreSheet from './CardMoreSheet';
import useOwnedCards from '@/hooks/useOwnedCards';
import useOwnedCardDetail from '@/hooks/useOwnedCardDetail';
import useOwnedCardState from '@/hooks/useOwnedCardState';
import useUpdateOwnedCardState from '@/hooks/useUpdateOwnedCardState';
import useDeleteOwnedCard, {
  isLastOwnedCardError,
} from '@/hooks/useDeleteOwnedCard';
import { toOwnedCardStateRequest } from './ownedCardMapper';
import { EditIcon } from '@/assets/icons/icons';

// 캐러셀 카드 크기 (px) — 스크롤 위치로 현재 카드를 계산할 때 사용합니다.
const CARD_WIDTH = 216;
const CARD_HEIGHT = 136;
const CARD_GAP = 24;

const formatWon = (value) => `${value.toLocaleString('ko-KR')}원`;

// 카드 이미지 (세로형 이미지는 가로로 눕혀서 표시, 실적 미확인 카드는 뿌옇게 표시)
function CardImage({ card }) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <img
        src={card.image}
        alt={card.name}
        draggable={false}
        className={cn(
          'absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
          card.isHorizontal ? 'size-full' : '-rotate-90',
        )}
        style={
          card.isHorizontal
            ? undefined
            : { width: CARD_HEIGHT, height: CARD_WIDTH }
        }
      />
      {/* 실적 확인이 필요한 카드는 비활성화된 것처럼 뿌옇게 덮습니다. */}
      {card.needsPerformance && (
        <span className="absolute inset-0 bg-[#F1F1F1]/50" />
      )}
    </div>
  );
}

// 한도 단위별 표기 (금액 한도 / 횟수 한도)
const formatCap = (value, unit) =>
  unit === 'COUNT' ? `${value.toLocaleString('ko-KR')}회` : formatWon(value);

// 혜택 한 줄 (사용량 / 한도 + 진행 바). 한도가 없는 혜택은 이름만 보여줍니다.
function BenefitItem({ benefit, onEdit, onEnterLimit }) {
  const { name, cap, usedInRecommendation, isLimitEntered, isEstimated } =
    benefit;
  const used = cap?.used ?? 0;
  const isExhausted = Boolean(cap) && isLimitEntered && used >= cap.limit;
  const ratio = cap && cap.limit > 0 ? Math.min(used / cap.limit, 1) : 0;

  return (
    <li
      className={cn(
        'flex items-center gap-[24px]',
        // 추천 계산에 쓰이지 않는 혜택은 회색으로 흐리게 표시합니다.
        !usedInRecommendation && 'opacity-50 grayscale',
      )}
    >
      <span className="size-[64px] shrink-0 bg-[repeating-conic-gradient(#e6e6e6_0_25%,#f1f1f1_0_50%)] bg-size-[14px_14px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex items-start justify-between gap-2">
          <p className="font-['Pretendard'] text-[16px] leading-[140%] font-[500] break-keep text-[#3B426B]">
            {name}
          </p>
          {!usedInRecommendation && (
            <span className="shrink-0 rounded-[27px] bg-[#EBEBEB] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
              추천 미반영
            </span>
          )}
        </div>
        {cap && (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-[6px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]">
                <span>
                  {isLimitEntered ? formatCap(used, cap.unit) : '확인 전'}
                </span>
                <span className="h-[10px] w-px bg-[#C4C4C4]" />
                <span>{formatCap(cap.limit, cap.unit)}</span>
              </p>
              {!usedInRecommendation ? null : !isLimitEntered ? (
                <div className="flex shrink-0 items-center gap-[4px]">
                  <button
                    type="button"
                    onClick={onEnterLimit}
                    className="flex items-center gap-[4px] rounded-[27px] bg-[#FAFAFA] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
                  >
                    <Plus
                      className="size-[16px] text-[#C4C4C4]"
                      strokeWidth={2}
                    />
                    한도 입력
                  </button>
                </div>
              ) : isExhausted ? (
                <span className="shrink-0 rounded-[27px] bg-[#F8C5C0] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#EE695D]">
                  한도 소진
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-[4px]">
                  {/* 결제 확인으로 차감해 추정한 값 (직접 입력한 값은 태그 없음) */}
                  {isEstimated && (
                    <span className="rounded-[27px] bg-[#DBE1FF] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8C9EFF]">
                      추정
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-[4px] rounded-[27px] bg-[#FAFAFA] px-[8px] py-[2px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] text-[#8E8E8E]"
                  >
                    <EditIcon
                      className="size-[12px] fill-[#8E8E8E] text-[#8E8E8E]"
                      strokeWidth={1.5}
                    />
                    수정
                  </button>
                </div>
              )}
            </div>
            <div className="mt-[4px] h-[8px] w-full overflow-hidden rounded-full bg-[#EBEBEB] shadow-[inset_0_0_4px_0_rgba(0,0,0,0.08)]">
              <div
                className={cn(
                  'h-full rounded-full',
                  isExhausted ? 'bg-[#DBE1FF]' : 'bg-[#8C9EFF]',
                )}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </li>
  );
}

// 카드 토스트 종류별 문구·아이콘
const CARD_TOAST = {
  registered: {
    title: '카드 실적이 등록되었어요',
    description: '더 정확하게 카드를 추천받을 수 있어요',
  },
  edited: {
    title: '카드 실적이 수정되었어요',
    description: '더 정확하게 카드를 추천받을 수 있어요',
  },
  deleted: {
    title: (card) => `${card.name} 삭제됨`,
    description: '결제 내역은 My에서 확인할 수 있어요.',
    isNegative: true,
  },
  deleteFailed: {
    title: '카드를 삭제하지 못했어요',
    description: '잠시 후 다시 시도해 주세요',
    isNegative: true,
  },
  saveFailed: {
    title: '카드 사용 현황을 저장하지 못했어요',
    description: '잠시 후 다시 시도해 주세요',
    isNegative: true,
  },
};

// 카드 이미지 위에 체크(완료) 또는 X(삭제) 아이콘을 얹은 토스트
function CardToast({ toast, onClose }) {
  const { card, type } = toast;
  const { title, description, isNegative } = CARD_TOAST[type];
  const StatusIcon = isNegative ? X : Check;

  return (
    <Toast
      icon={
        <span className="relative size-full">
          <img
            src={card.image}
            alt=""
            className={cn(
              'absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
              card.isHorizontal
                ? 'h-[60px] w-[95px]'
                : 'h-[95px] w-[60px] -rotate-90',
            )}
          />
          <span className="absolute inset-0 flex items-center justify-center bg-[rgba(18,18,18,0.2)]">
            <span
              className={cn(
                'flex size-[28px] items-center justify-center rounded-full',
                isNegative ? 'bg-[#E46A5E]' : 'bg-[#A3B1FF]',
              )}
            >
              <StatusIcon
                className="size-[18px] text-[#FAFAFA]"
                strokeWidth={2.5}
              />
            </span>
          </span>
        </span>
      }
      title={
        <span className={isNegative ? 'text-[#EE695D]' : 'text-[#A3B1FF]'}>
          {typeof title === 'function' ? title(card) : title}
        </span>
      }
      description={description}
      hasArrow={false}
      // 카드 전체가 보이도록 아이콘 영역을 카드 비율(가로형)로 넓힙니다.
      iconClassName="w-[95px] rounded-[4px]"
      onClick={onClose}
      onClose={onClose}
    />
  );
}

// 마지막으로 남은 카드를 삭제하려 할 때 띄우는 안내 모달
function LastCardDialog({ onClose, onAddCard }) {
  return (
    <Modal title="마지막 카드는 삭제할 수 없어요" onClose={onClose}>
      <p>다른 카드를 먼저 등록한 뒤 삭제해 주세요.</p>
      <div className="mt-6 flex min-h-12 [&>button]:flex [&>button]:min-h-12 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center [&>button]:text-[16px] [&>button]:font-normal [&>button]:text-[#3B426B]">
        <button type="button" onClick={onClose}>
          취소
        </button>
        <button type="button" className="bg-[#A3B1FF]" onClick={onAddCard}>
          카드 추가하기
        </button>
      </div>
    </Modal>
  );
}

export default function CardPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { data: cards = [], isPending, isError, refetch } = useOwnedCards();
  const { mutate: deleteCard, isPending: isDeleting } = useDeleteOwnedCard();
  // 스크롤 위치를 카드 단위로 환산한 값 (0 = 첫 카드가 가운데, 1.5 = 두 번째와 세 번째 카드 사이)
  const [scrollPosition, setScrollPosition] = useState(0);
  const activeIndex = Math.min(
    Math.max(Math.round(scrollPosition), 0),
    cards.length - 1,
  );
  const activeListCard = cards[activeIndex];
  // 가운데 카드의 상세(혜택·한도)를 받아 목록 정보에 합칩니다.
  const {
    data: detail,
    isPending: isDetailPending,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useOwnedCardDetail(activeListCard?.id);
  const activeCard =
    activeListCard && detail?.id === activeListCard.id
      ? {
          ...activeListCard,
          benefits: detail.benefits,
          performanceRequirement: detail.performanceRequirement,
          savedBenefit: detail.savedBenefit,
          isAssumedTier: detail.isAssumedTier,
        }
      : activeListCard;
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // 서버가 마지막 카드라고 거절한 경우(409) 화면 목록과 상관없이 안내 모달을 띄웁니다.
  const [isLastCardBlocked, setIsLastCardBlocked] = useState(false);
  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setIsLastCardBlocked(false);
  }, [setIsDeleteDialogOpen, setIsLastCardBlocked]);
  const showLastCardDialog = cards.length === 1 || isLastCardBlocked;
  // 카드 토스트: { type: 'registered' | 'edited' | 'deleted', card }
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);
  // 카드 사용 현황 입력: null | 'sheet'(바텀시트) | 'amount'(금액 직접 입력 화면)
  const [usageInput, setUsageInput] = useState(null);
  // 카드별로 직접 입력한 금액
  const [usageAmounts, setUsageAmounts] = useState({});
  // 사용 현황 시트를 열 때 저장된 실적·남은 한도를 받아 시트 질문과 선택값을 채웁니다.
  const { data: cardState, isLoading: isStateLoading } = useOwnedCardState(
    activeCard?.id,
    { enabled: usageInput !== null },
  );
  const { mutate: saveCardState } = useUpdateOwnedCardState();

  // 시트 입력(선택값 또는 직접 입력한 금액)을 서버에 저장합니다.
  const handleSaveUsage = (card, input) => {
    const isAmountInput = Boolean(usageAmounts[card.id]);
    // 상태를 받지 못했으면 어떤 한도·구간인지 알 수 없어 저장할 수 없습니다.
    if (!cardState) {
      setToast({ type: 'saveFailed', card });
      return;
    }
    const body = toOwnedCardStateRequest(cardState, input, { isAmountInput });
    if (!body) return; // 바뀐 내용이 없습니다.

    saveCardState(
      { id: card.id, body },
      {
        onSuccess: () => {
          // 저장한 금액은 서버 값으로 대신하므로 직접 입력값을 비웁니다.
          setUsageAmounts((prev) => {
            const next = { ...prev };
            delete next[card.id];
            return next;
          });
          setToast({
            // 저장 전에 실적이 확인되지 않은 카드면 처음 등록, 이미 확인된 카드면 수정
            type:
              cardState.performanceStatus === 'CONFIRMED'
                ? 'edited'
                : 'registered',
            card,
          });
        },
        onError: () => setToast({ type: 'saveFailed', card }),
      },
    );
  };

  // 상태 조회에 실패하면 목록·상세 정보만으로 시트를 엽니다.
  const usageCard =
    cardState && activeCard
      ? {
          ...activeCard,
          performanceOptions: cardState.performanceOptions,
          usageCaps: cardState.usageCaps,
          // 실적 구간을 바꾸면 한도 질문도 그 구간 기준으로 바뀝니다.
          usageCapsByAnswer: cardState.usageCapsByAnswer,
          tierOptions: cardState.tierOptions,
          initialAnswers: cardState.initialAnswers,
        }
      : activeCard;

  const handleScroll = () => {
    setScrollPosition(scrollRef.current.scrollLeft / (CARD_WIDTH + CARD_GAP));
  };

  const scrollToCard = (index) => {
    scrollRef.current?.scrollTo({
      left: index * (CARD_WIDTH + CARD_GAP),
      behavior: 'smooth',
    });
  };

  const handleDeleteCard = () => {
    if (isDeleting) return; // 확인 버튼을 여러 번 눌러도 한 번만 요청합니다.
    const card = activeCard;
    deleteCard(card.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setToast({ type: 'deleted', card });
      },
      onError: (error) => {
        if (isLastOwnedCardError(error)) {
          setIsLastCardBlocked(true);
          return;
        }
        setIsDeleteDialogOpen(false);
        // 404는 이미 없는 카드라 목록에서 빠지므로 삭제된 것으로 안내합니다.
        setToast({
          type: error?.response?.status === 404 ? 'deleted' : 'deleteFailed',
          card,
        });
      },
    });
  };

  if (isPending || isError || !activeCard) {
    return (
      <div className="min-h-dvh bg-[#F1F1F1]">
        <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center gap-[12px] px-[18px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))] text-center font-['Pretendard'] text-[16px] leading-[140%] text-[#8E8E8E]">
          {isPending ? (
            <p>카드를 불러오는 중이에요</p>
          ) : isError ? (
            <>
              <p>카드를 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <p>등록된 카드가 없어요</p>
              <button
                type="button"
                onClick={() =>
                  navigate('/signup', { state: { initialStep: 2 } })
                }
                className="rounded-[27px] bg-[#121212] px-[16px] py-[8px] text-[#FAFAFA]"
              >
                카드 추가하기
              </button>
            </>
          )}
        </main>
        {toast && <CardToast toast={toast} onClose={closeToast} />}
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F1F1F1]">
      <main className="mx-auto flex w-full max-w-[402px] flex-col pt-[72px] pb-[calc(80px+max(28px,env(safe-area-inset-bottom)))]">
        <header className="flex items-start justify-between px-[18px] max-phone-xs:px-3">
          <div className="flex flex-col gap-[2px]">
            <h1 className="font-['Pretendard'] text-[24px] leading-[120%] font-[600] text-[#121212]">
              {activeCard.name}
            </h1>
            <p className="font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8E8E8E]">
              {activeCard.type}
            </p>
          </div>
          <button
            type="button"
            aria-label="카드 더보기"
            onClick={() => setIsMoreSheetOpen(true)}
            className="p-1"
          >
            <Ellipsis className="size-[24px] text-[#C4C4C4]" />
          </button>
        </header>

        {/* 내 카드 캐러셀 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-[36px] flex snap-x snap-mandatory [scrollbar-width:none] items-end overflow-x-auto px-[calc(50%-108px)] [&::-webkit-scrollbar]:hidden"
          style={{ gap: CARD_GAP }}
        >
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            // 가운데에서 멀어질수록(0~1) 작고 흐려집니다. 스크롤에 맞춰 연속으로 변해 카드가 튀지 않습니다.
            const offset = index - scrollPosition;
            const distance = Math.min(Math.abs(offset), 1);
            return (
              <button
                key={card.id}
                type="button"
                aria-label={card.name}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollToCard(index)}
                // 스냅 기준은 크기가 변하지 않는 바깥 버튼에 두어야 카드가 정확히 가운데에 멈춥니다.
                className="shrink-0 snap-center snap-always"
              >
                {/* 옆 카드는 아래 기준으로 줄이고, 가운데 카드 쪽 모서리를 기준으로 삼아 간격을 유지합니다. */}
                <div
                  style={{
                    scale: 1 - 0.3 * distance,
                    opacity: 1 - 0.5 * distance,
                    transformOrigin:
                      offset < 0 ? 'right bottom' : 'left bottom',
                  }}
                >
                  <CardImage card={card} />
                </div>
              </button>
            );
          })}
        </div>

        {/* statusChip이 null(NEEDS_CHECK 등)이면 칩을 표시하지 않습니다. */}
        <div className="mt-[16px] flex min-h-[34px] justify-center">
          {activeCard.statusChip === 'ALL_CONFIRMED' && (
            <span className="rounded-[27px] bg-[#DBE1FF] px-[12px] py-[6px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8C9EFF]">
              {activeCard.performanceMonth}월 카드 실적 확인 완료
            </span>
          )}
          {activeCard.statusChip === 'NEEDS_PERFORMANCE' && (
            <button
              type="button"
              onClick={() => setUsageInput('sheet')}
              className="flex items-center gap-[6px] rounded-[27px] bg-[#F8C5C0] px-[12px] py-[6px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#EE695D]"
            >
              <span className="flex size-[18px] items-center justify-center rounded-full bg-[#D53D30] text-[12px] leading-none font-bold text-[#FAFAFA]">
                !
              </span>
              {activeCard.performanceMonth}월 카드 실적 확인 필요
            </button>
          )}
          {activeCard.statusChip === 'LIMIT_EXHAUSTED' && (
            <span className="rounded-[27px] bg-[#F8C5C0] px-[12px] py-[6px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#EE695D]">
              한도를 다 쓴 혜택이 있어요
            </span>
          )}
        </div>

        <section className="mt-[36px] flex flex-col px-[18px] max-phone-xs:px-3">
          <h2 className="font-['Pretendard'] text-[20px] leading-[120%] font-[600] text-[#4B4B4B]">
            이 카드의 혜택
          </h2>
          <p className="mt-[1px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8E8E8E]">
            추천에 포함되는 혜택만 모았어요. 다 받아가세요.
            <br />
            카똑에서 확인된 결제 내역만 입력돼요.
          </p>
          {/* 실적 미확인 카드의 한도는 가장 낮은 혜택 구간을 가정한 값입니다. */}
          {activeCard.isAssumedTier && (
            <p className="mt-[8px] font-['Pretendard'] text-[14px] leading-[140%] font-[400] break-keep text-[#8C9EFF]">
              실적 확인 전이라 가장 낮은 실적 구간 기준 한도로 보여드려요.
            </p>
          )}

          {isDetailPending ? (
            <p className="mt-[24px] font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8E8E8E]">
              혜택을 불러오는 중이에요
            </p>
          ) : isDetailError ? (
            <div className="mt-[24px] flex items-center justify-between gap-2 font-['Pretendard'] text-[16px] leading-[140%] font-[400] text-[#8E8E8E]">
              <p>혜택을 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => refetchDetail()}
                className="shrink-0 rounded-[27px] bg-[#121212] px-[12px] py-[4px] text-[14px] text-[#FAFAFA]"
              >
                다시 시도
              </button>
            </div>
          ) : activeCard.benefits.length === 0 ? (
            <p className="mt-[24px] font-['Pretendard'] text-[16px] leading-[140%] font-[500] text-[#3B426B]">
              적용할 수 있는 혜택이 없어요
            </p>
          ) : (
            <ul className="mt-[24px] flex flex-col gap-[16px]">
              {activeCard.benefits.map((benefit) => (
                <BenefitItem
                  key={benefit.id}
                  benefit={benefit}
                  onEdit={() => setUsageInput('sheet')}
                  // 남은 한도는 사용 현황 시트에서 입력합니다.
                  onEnterLimit={() => setUsageInput('sheet')}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {toast && <CardToast toast={toast} onClose={closeToast} />}

      <BottomNav />

      {isMoreSheetOpen && (
        <CardMoreSheet
          card={activeCard}
          isLastCard={cards.length === 1}
          onClose={() => setIsMoreSheetOpen(false)}
          onEditPerformance={() => {
            setIsMoreSheetOpen(false);
            setUsageInput('sheet');
          }}
          onDelete={() => {
            setIsMoreSheetOpen(false);
            setIsDeleteDialogOpen(true);
          }}
        />
      )}

      {isDeleteDialogOpen && showLastCardDialog && (
        <LastCardDialog
          onClose={closeDeleteDialog}
          // 하단 + 버튼과 같은 온보딩의 카드사 선택 단계로 이동합니다.
          onAddCard={() => navigate('/signup', { state: { initialStep: 2 } })}
        />
      )}
      {isDeleteDialogOpen && !showLastCardDialog && (
        <DeletePaymentDialog
          description={
            <>
              삭제하면 이 카드는 앞으로 추천에서 빠져요.
              <br />
              지난 추천과 결제 기록은 그대로 남아요.
            </>
          }
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteCard}
        />
      )}

      {usageInput === 'sheet' && !isStateLoading && (
        <CardUsageSheet
          card={usageCard}
          submitLabel="저장하기"
          onClose={() => setUsageInput(null)}
          onDirectInput={() => setUsageInput('amount')}
          amounts={usageAmounts[activeCard.id]}
          // 저장에 성공하면 목록·상세·상태를 다시 받아 혜택 현황을 갱신합니다.
          onSubmit={(input) => handleSaveUsage(activeCard, input)}
        />
      )}
      {usageInput === 'amount' && (
        <CardUsageAmountScreen
          card={usageCard}
          // 이번에 입력한 금액이 없으면 저장된 남은 한도로 채웁니다.
          initialAmounts={
            usageAmounts[activeCard.id] ?? cardState?.initialAmounts
          }
          onBack={() => setUsageInput('sheet')}
          // 입력을 마치면 바텀시트로 돌아가 입력한 금액을 보여줍니다.
          onSubmit={(amounts) => {
            setUsageAmounts((prev) => ({ ...prev, [activeCard.id]: amounts }));
            setUsageInput('sheet');
          }}
        />
      )}
    </div>
  );
}

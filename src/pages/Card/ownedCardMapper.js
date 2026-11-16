import emptyCardImage from '@/assets/onboarding/card/empty.png';

// 카드 이미지: 파일 이름(카드명)으로 찾아 씁니다. 서버가 이미지 URL을 주면 교체합니다.
const CARD_IMAGES = import.meta.glob('@/assets/card/*.png', {
  eager: true,
  import: 'default',
});

// 가로형 이미지 (나머지 카드 이미지는 세로형이라 가로로 눕혀서 보여줍니다.)
const HORIZONTAL_IMAGE_KEYS = new Set(['kb국민은행노리2']);

// 공백·기호를 지워 이름 비교를 느슨하게 합니다.
const normalize = (value = '') =>
  value.toLowerCase().replace(/[^0-9a-z가-힣]/g, '');

const CARD_IMAGE_ENTRIES = Object.entries(CARD_IMAGES).map(([path, src]) => ({
  key: normalize(
    decodeURIComponent(path)
      .split('/')
      .pop()
      .replace(/\.png$/, ''),
  ),
  src,
}));

const findCardImage = ({ name, issuerName }) => {
  const candidates = [normalize(name), normalize(`${issuerName}${name}`)];
  const found =
    CARD_IMAGE_ENTRIES.find(({ key }) => candidates.includes(key)) ??
    CARD_IMAGE_ENTRIES.find(({ key }) =>
      candidates.some((c) => c && (key.includes(c) || c.includes(key))),
    );
  if (!found) return { image: emptyCardImage, isHorizontal: true };
  return {
    image: found.src,
    isHorizontal: HORIZONTAL_IMAGE_KEYS.has(found.key),
  };
};

const CARD_TYPE_LABEL = {
  CREDIT: '신용카드',
  CHECK: '체크카드',
};

// 지난달 실적은 매월 1일 00:00(한국 시간)에 초기화되므로, 한국 시간 기준 지난달을 씁니다.
export const getPerformanceMonth = (now = new Date()) => {
  const kstMonth = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      month: 'numeric',
    }).format(now),
  );
  return kstMonth === 1 ? 12 : kstMonth - 1;
};

// GET /api/v1/owned-cards 응답 한 건 → 내 카드 화면 모델
export const toOwnedCardView = (ownedCard) => {
  const { product, performanceStatus } = ownedCard;
  const { image, isHorizontal } = findCardImage(product);
  // SINGLE·MULTIPLE + UNKNOWN일 때만 실적 입력이 필요합니다. (UNKNOWN만으로 판단하지 않음)
  const needsPerformance =
    ['SINGLE', 'MULTIPLE'].includes(product.performanceType) &&
    performanceStatus === 'UNKNOWN';

  return {
    id: ownedCard.id,
    productId: product.id,
    name: product.name,
    issuerName: product.issuerName,
    type: CARD_TYPE_LABEL[product.cardType] ?? product.cardType,
    image,
    isHorizontal,
    dataStatus: product.dataStatus,
    performanceType: product.performanceType,
    performanceStatus,
    performanceTier: ownedCard.performanceTier,
    performanceMonth: getPerformanceMonth(),
    needsPerformance,
    representativeBenefit: ownedCard.representativeBenefit,
    statusChip: ownedCard.statusChip,
    createdAt: ownedCard.createdAt,
    // 혜택·한도·실적 기준 금액은 3-2 카드 상세 응답(toOwnedCardDetailView)으로 채웁니다.
    benefits: [],
    benefitCategories: [],
    performanceRequirement: undefined,
  };
};

// ---------------------------------------------------------------------------
// 3-2. 보유 카드 상세
// ---------------------------------------------------------------------------

// 숫자로 쓸 수 있는 첫 번째 값을 고릅니다. (null·undefined는 '확인 안 됨'으로 남깁니다.)
const pickNumber = (...values) =>
  values.find((value) => typeof value === 'number' && Number.isFinite(value));

// 한도 항목 한 건 → { used, limit, unit }
// 한도 항목 형식은 3-3 계약을 따릅니다. 필드 이름이 확정되면 여기만 고치면 됩니다.
const toCapView = (cap) => {
  const amountLimit = pickNumber(
    cap.limitAmount,
    cap.amountLimit,
    cap.maxAmount,
  );
  const countLimit = pickNumber(cap.limitCount, cap.countLimit, cap.capCount);

  if (amountLimit !== undefined) {
    const remaining = pickNumber(cap.remainingAmount);
    return {
      unit: 'AMOUNT',
      limit: amountLimit,
      used: pickNumber(
        cap.usedAmount,
        cap.amountUsed,
        remaining !== undefined ? amountLimit - remaining : undefined,
      ),
    };
  }
  if (countLimit !== undefined) {
    const remaining = pickNumber(cap.remainingCount);
    return {
      unit: 'COUNT',
      limit: countLimit,
      used: pickNumber(
        cap.usedCount,
        cap.countUsed,
        remaining !== undefined ? countLimit - remaining : undefined,
      ),
    };
  }
  return null;
};

// performance.options에서 혜택이 시작되는 최소 실적 금액 (사용 현황 바텀시트 질문에 사용)
const getMinRequirement = (options = []) => {
  const amounts = options
    .map((option) => option.minAmount)
    .filter((amount) => typeof amount === 'number' && amount > 0);
  return amounts.length > 0 ? Math.min(...amounts) : undefined;
};

// GET /api/v1/owned-cards/{id} 응답 → 카드 상세 화면 모델
export const toOwnedCardDetailView = (detail) => {
  const {
    product,
    performance,
    benefits = [],
    caps = [],
    savedBenefit,
  } = detail;
  const capsById = new Map(caps.map((cap) => [cap.capGroupId ?? cap.id, cap]));
  // 실적 미확인(SINGLE·MULTIPLE + UNKNOWN)이면 서버가 최소 혜택 구간을 가정한 한도라 '추정'으로 표시합니다.
  const isAssumedTier =
    ['SINGLE', 'MULTIPLE'].includes(product.performanceType) &&
    performance?.status === 'UNKNOWN';

  return {
    id: detail.id,
    product,
    performanceStatus: performance?.status,
    performanceTier: performance?.tier ?? null,
    performanceOptions: performance?.options ?? [],
    baseMonth: performance?.baseMonth,
    performanceRequirement: getMinRequirement(performance?.options),
    savedBenefit: savedBenefit ?? { amount: 0, paymentCount: 0 },
    benefits: benefits.map((benefit) => {
      const cap =
        benefit.capGroupId != null && capsById.has(benefit.capGroupId)
          ? toCapView(capsById.get(benefit.capGroupId))
          : null;
      return {
        id: benefit.ruleId,
        name: benefit.description,
        usedInRecommendation: benefit.usedInRecommendation,
        cap,
        // 확인하지 않은 사용량은 서버가 채우지 않으므로 '한도 입력' 상태로 보여줍니다.
        isLimitEntered: cap ? cap.used !== undefined : true,
        isEstimated: Boolean(cap) && isAssumedTier,
      };
    }),
  };
};

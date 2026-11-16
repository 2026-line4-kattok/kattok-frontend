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

// 한도 항목(3-3 caps 형식) 한 건 → { unit, limit, remaining, used, source }
// 금액 한도가 있으면 금액 기준, 없으면 횟수 기준으로 보여줍니다.
// remaining이 null이면 '확인 전'입니다. 전체 한도로 채우지 않습니다.
const toCapView = (cap) => {
  const base =
    cap.capAmount != null
      ? {
          unit: 'AMOUNT',
          limit: cap.capAmount,
          remaining: cap.remainingLimitAmount,
          source: cap.amountSource,
        }
      : cap.capCount != null
        ? {
            unit: 'COUNT',
            limit: cap.capCount,
            remaining: cap.remainingCount,
            source: cap.countSource,
          }
        : null;
  if (!base) return null;
  return {
    ...base,
    used:
      base.remaining == null
        ? undefined
        : Math.max(base.limit - base.remaining, 0),
  };
};

// performance.options에서 혜택이 시작되는 최소 실적 금액 (사용 현황 바텀시트 질문에 사용)
const getMinRequirement = (options = []) => {
  const amounts = options
    .map((option) => option.minAmount)
    .filter((amount) => typeof amount === 'number' && amount > 0);
  return amounts.length > 0 ? Math.min(...amounts) : undefined;
};

// 상세 응답의 benefits에는 실적 구간별 규칙이 모두 들어 있어, 같은 혜택이 구간 수만큼 반복됩니다.
// (예: '주말 마트 10% 할인'이 30만·50만·100만원 구간마다 하나씩)
// 같은 설명끼리 묶어 하나만 보여줍니다. 우선순위: 적용 중인 한도(caps)가 있는 규칙
// → 추천에 반영되는 규칙 → 먼저 온 규칙. 순서는 각 설명이 처음 나온 위치를 따릅니다.
const dedupeBenefits = (benefits, capsById) => {
  const score = (benefit) =>
    (capsById.has(benefit.capGroupId) ? 2 : 0) +
    (benefit.usedInRecommendation ? 1 : 0);
  const byDescription = new Map();
  benefits.forEach((benefit) => {
    const current = byDescription.get(benefit.description);
    if (!current || score(benefit) > score(current))
      byDescription.set(benefit.description, benefit);
  });
  return [...byDescription.values()];
};

const isAssumedTier = (performanceType, performanceStatus) =>
  ['SINGLE', 'MULTIPLE'].includes(performanceType) &&
  performanceStatus === 'UNKNOWN';

// GET /api/v1/owned-cards/{id} 응답 → 카드 상세 화면 모델
export const toOwnedCardDetailView = (detail) => {
  const {
    product,
    performance,
    benefits = [],
    caps = [],
    savedBenefit,
  } = detail;
  const capsById = new Map(caps.map((cap) => [cap.capGroupId, cap]));
  return {
    id: detail.id,
    product,
    performanceStatus: performance?.status,
    performanceTier: performance?.tier ?? null,
    performanceOptions: performance?.options ?? [],
    baseMonth: performance?.baseMonth,
    performanceRequirement: getMinRequirement(performance?.options),
    // 실적 미확인(SINGLE·MULTIPLE + UNKNOWN)이면 서버가 최소 혜택 구간을 가정한 한도입니다.
    isAssumedTier: isAssumedTier(product.performanceType, performance?.status),
    savedBenefit: savedBenefit ?? { amount: 0, paymentCount: 0 },
    benefits: dedupeBenefits(benefits, capsById).map((benefit) => {
      const cap =
        benefit.capGroupId != null && capsById.has(benefit.capGroupId)
          ? toCapView(capsById.get(benefit.capGroupId))
          : null;
      return {
        id: benefit.ruleId,
        name: benefit.description,
        usedInRecommendation: benefit.usedInRecommendation,
        cap,
        // 남은 값이 null이면 '확인 전' → '한도 입력' 버튼으로 보여줍니다.
        isLimitEntered: cap ? cap.remaining != null : true,
        // 결제 확인으로 차감해 추정한 값이면 [추정]을 붙입니다.
        isEstimated: cap?.source === 'ESTIMATED',
      };
    }),
  };
};

// ---------------------------------------------------------------------------
// 3-3. 카드 상태 조회 → 카드 사용 현황 시트(CARD-04A·04B) 입력값
// ---------------------------------------------------------------------------

const formatManWon = (value) => `${value / 10000}만원`;

// 시트 질문 이름 (시트·금액 입력 화면·저장 값에서 같은 이름을 씁니다.)
export const capQuestionName = (capGroupId) => `cap-${capGroupId}`;

// GET /api/v1/owned-cards/{id}/state 응답 → 시트에 넘길 카드 필드
export const toOwnedCardStateView = (state) => {
  const options = state.performanceTierOptions ?? [];
  const hasTiers =
    ['SINGLE', 'MULTIPLE'].includes(state.performanceType) &&
    options.length > 0;
  // 금액 또는 횟수 제한이 있는 한도마다 질문을 하나씩 만듭니다.
  // 금액 제한이 있으면 금액(원), 횟수 제한만 있으면 횟수(회)로 묻습니다.
  const usageCaps = (state.caps ?? [])
    .filter((cap) => cap.capAmount != null || cap.capCount != null)
    .map((cap) => {
      const unit = cap.capAmount != null ? 'AMOUNT' : 'COUNT';
      return {
        name: capQuestionName(cap.capGroupId),
        capGroupId: cap.capGroupId,
        description: cap.description,
        unit,
        capAmount: cap.capAmount,
        capCount: cap.capCount,
        // 질문 단위의 전체 한도·남은 값
        limit: unit === 'AMOUNT' ? cap.capAmount : cap.capCount,
        remaining:
          unit === 'AMOUNT' ? cap.remainingLimitAmount : cap.remainingCount,
        // 일 한도는 저장할 때 periodStart(날짜)가 필요합니다.
        periodStart: cap.periodStart,
      };
    });

  // 지난달 실적 선택지: 최저 구간 미만 / 구간별 / 모르겠어요
  const performanceOptions = hasTiers
    ? [
        {
          value: 'BELOW',
          label: `${formatManWon(options[0].minAmount)} 미만`,
        },
        ...options.map((tier) => ({
          value: `TIER-${tier.id}`,
          label: tier.label,
        })),
        { value: 'UNKNOWN', label: '모르겠어요' },
      ]
    : null;

  const performanceAnswer =
    state.performanceStatus === 'CONFIRMED' && state.performanceTier
      ? `TIER-${state.performanceTier.id}`
      : state.performanceStatus === 'BELOW'
        ? 'BELOW'
        : 'UNKNOWN';

  // 저장된 남은 값으로 선택지를 미리 고릅니다. (모르면 '모르겠어요')
  const capAnswer = ({ remaining, limit }) => {
    if (remaining == null) return 'unknown';
    if (remaining === 0) return 'used';
    if (remaining >= limit) return 'unused';
    return 'unknown';
  };

  return {
    month: state.month,
    performanceType: state.performanceType,
    performanceStatus: state.performanceStatus,
    performanceTier: state.performanceTier,
    confirmedAt: state.confirmedAt,
    caps: state.caps ?? [],
    performanceOptions,
    tierOptions: hasTiers ? options : [],
    usageCaps,
    initialAnswers: {
      ...(performanceOptions && { performance: performanceAnswer }),
      ...Object.fromEntries(usageCaps.map((cap) => [cap.name, capAnswer(cap)])),
    },
    // 직접 입력 화면의 초기값 (저장된 남은 값만)
    initialAmounts: Object.fromEntries(
      usageCaps
        .filter((cap) => cap.remaining != null)
        .map((cap) => [cap.name, cap.remaining]),
    ),
  };
};

// ---------------------------------------------------------------------------
// 3-4. 카드 상태 수정 → PUT /api/v1/owned-cards/{id}/state 요청 본문
// ---------------------------------------------------------------------------

// 한국 시간 기준 이번 달 (YYYY-MM)
export const getKstMonth = (now = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
  }).format(now);

// 시트 선택값('BELOW' | 'TIER-{id}' | 'UNKNOWN') → { status, tierId }
const performanceFromAnswer = (answer) => {
  if (answer?.startsWith('TIER-'))
    return { status: 'CONFIRMED', tierId: Number(answer.slice(5)) };
  return { status: answer === 'BELOW' ? 'BELOW' : 'UNKNOWN' };
};

// 직접 입력한 지난달 결제 금액 → 해당하는 가장 높은 구간 (없으면 최저 구간 미달)
const performanceFromAmount = (tierOptions, amount) => {
  const tier = tierOptions
    .filter((option) => option.minAmount <= amount)
    .at(-1);
  return tier ? { status: 'CONFIRMED', tierId: tier.id } : { status: 'BELOW' };
};

// 빠른 선택 → 남은 값: [다 썼어요] 0, [안 썼어요] 전체 한도·횟수, [모르겠어요] null
const remainingFromAnswer = (answer, limit) =>
  answer === 'used' ? 0 : answer === 'unused' ? limit : null;

/**
 * 사용 현황 시트 입력 → 상태 수정 요청 본문. 바꿀 내용이 없으면 null을 돌려줍니다.
 * @param state toOwnedCardStateView 결과
 * @param input 시트 선택값(answers) 또는 직접 입력한 금액(amounts)
 * @param isAmountInput input이 직접 입력한 금액인지
 */
export const toOwnedCardStateRequest = (state, input, { isAmountInput }) => {
  const body = { month: state.month ?? getKstMonth() };

  // NONE·NEEDS_CHECK는 실적 객체를 보내면 400이므로 구간 선택지가 있을 때만 보냅니다.
  if (state.performanceOptions && input.performance !== undefined) {
    body.performance = isAmountInput
      ? performanceFromAmount(state.tierOptions, input.performance)
      : performanceFromAnswer(input.performance);
  }

  const caps = state.usageCaps.flatMap((cap) => {
    const value = input[cap.name];
    if (value === undefined) return [];
    // 선택을 바꾸지 않은 한도는 보내지 않아 저장된 값·추정값을 그대로 둡니다.
    if (!isAmountInput && value === state.initialAnswers[cap.name]) return [];
    let fields;
    if (isAmountInput) {
      // 직접 입력은 질문 단위(금액 또는 횟수)만 바꾸고, 다른 값은 그대로 둡니다.
      const remaining = Math.min(Math.max(Math.round(value), 0), cap.limit);
      fields =
        cap.unit === 'AMOUNT'
          ? { remainingLimitAmount: remaining }
          : { remainingCount: remaining };
    } else {
      // 빠른 선택은 제한이 있는 금액·횟수에 함께 적용합니다. (제한 없는 값은 보내면 400)
      fields = {
        ...(cap.capAmount != null && {
          remainingLimitAmount: remainingFromAnswer(value, cap.capAmount),
        }),
        ...(cap.capCount != null && {
          remainingCount: remainingFromAnswer(value, cap.capCount),
        }),
      };
    }
    return [
      {
        capGroupId: cap.capGroupId,
        ...fields,
        ...(cap.periodStart && { periodStart: cap.periodStart }),
      },
    ];
  });
  if (caps.length > 0) body.caps = caps;

  return body.performance || body.caps ? body : null;
};

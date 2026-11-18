// 4-5 추천 생성 응답 → 결과 화면(HOME-02·02B·14)·카드 변경 화면에서 쓰는 형태

const ASSUMPTION_ORDER = {
  PERFORMANCE_TIER: 0,
  REMAINING_LIMIT: 1,
  REMAINING_COUNT: 2,
};

// 결과 화면의 대표 한도
// 적용 혜택 중 benefitAmount 내림차순(동률이면 ruleId 오름차순) 첫 혜택의 한도 중
// 금액 제한이 있는 MONTHLY → 금액 제한이 있는 한도 → 횟수 제한 순, 같은 순위면 capGroupId 오름차순
const pickRepresentativeCap = (appliedRules, remainingLimitsAfter) => {
  const [mainRule] = [...appliedRules].sort(
    (a, b) => b.benefitAmount - a.benefitAmount || a.ruleId - b.ruleId,
  );
  if (!mainRule) return null;
  const caps = remainingLimitsAfter
    .filter((cap) => mainRule.capGroupIds?.includes(cap.capGroupId))
    .sort((a, b) => a.capGroupId - b.capGroupId);
  return (
    caps.find((cap) => cap.capAmount != null && cap.capPeriod === 'MONTHLY') ??
    caps.find((cap) => cap.capAmount != null) ??
    caps.find((cap) => cap.capCount != null) ??
    null
  );
};

// 보유 카드 목록(3-1)에서 카드 이미지를 찾아 붙입니다. 목록이 없으면 이미지 없이 보여 줍니다.
const toCardView = (item, cardImages) => {
  const rawRules = item.appliedRules ?? [];
  // PR #30 이전 스냅샷은 혜택별 calculation이 null일 수 있습니다.
  // 혜택이 하나뿐이면 기존 카드 단위 calculation으로 대신하고, 아니면 계산식 없이 금액만 보여 줍니다.
  const appliedRules = rawRules.map((rule) => ({
    ...rule,
    capGroupIds: rule.capGroupIds ?? [],
    calculation:
      rule.calculation ??
      (rawRules.length === 1 ? (item.calculation ?? null) : null),
  }));
  const remainingLimitsAfter = item.remainingLimitsAfter ?? [];
  const assumptions = item.assumptions ?? [];
  const owned = cardImages.get(item.userCardId);

  return {
    id: item.userCardId,
    name: item.productName,
    issuerName: item.issuerName,
    image: owned?.image,
    isHorizontal: owned?.isHorizontal ?? true,
    status: item.status,
    rank: item.rank,
    discount: item.expectedBenefit ?? 0,
    isConditional: item.status === 'CONDITIONAL',
    noBenefitReason: item.noBenefitReason,
    appliedRules,
    remainingLimitsAfter,
    assumptions,
    representativeCap: pickRepresentativeCap(
      appliedRules,
      remainingLimitsAfter,
    ),
  };
};

// 순위를 바꿀 수 있는 가정(affectsRank)만 질문으로 최대 2개 고릅니다.
// items.rank 오름차순 → 실적·남은 금액·남은 횟수 순 → capGroupId 오름차순, 같은 질문은 한 번만
const pickQuestions = (cards) => {
  const seen = new Set();
  return cards
    .flatMap((card) =>
      card.assumptions
        // 한도 ID가 없는 한도·횟수 질문(PR #30 이전 스냅샷)은 어떤 한도를 고칠지 알 수 없어 뺍니다.
        .filter(
          (assumption) =>
            assumption.affectsRank &&
            (assumption.type === 'PERFORMANCE_TIER' ||
              assumption.capGroupId != null),
        )
        .map((assumption) => ({
          ...assumption,
          userCardId: card.id,
          rank: card.rank,
        })),
    )
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (ASSUMPTION_ORDER[a.type] ?? 9) - (ASSUMPTION_ORDER[b.type] ?? 9) ||
        (a.capGroupId ?? -1) - (b.capGroupId ?? -1),
    )
    .filter((question) => {
      const key = `${question.userCardId}-${question.type}-${question.capGroupId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 2);
};

// ownedCards: useOwnedCards()의 data (id·image·isHorizontal)
export const toRecommendationView = (data, ownedCards = []) => {
  if (!data) return null;
  const cardImages = new Map(ownedCards.map((card) => [card.id, card]));
  const cards = [...(data.items ?? [])]
    .sort((a, b) => a.rank - b.rank)
    .map((item) => toCardView(item, cardImages));

  return {
    id: data.id,
    basis: data.basis,
    merchantId: data.merchant?.id ?? null,
    categoryId: data.category?.id ?? null,
    // 업종만 고른 추천은 업종 이름을 제목으로 씁니다.
    place: data.merchant?.name ?? data.category?.name ?? '',
    category: data.category?.name ?? '',
    amount: data.amount ?? 0,
    overallStatus: data.overallStatus,
    recommendedCardId: data.recommendedUserCardId ?? null,
    tiedCardIds: data.tiedUserCardIds ?? [],
    differenceFromSecond: data.differenceFromSecond ?? null,
    confirmedOnlyTopCardId: data.confirmedOnlyTopUserCardId ?? null,
    cards,
    excludedCards: (data.excludedCards ?? []).map((card) => ({
      id: card.userCardId,
      name: card.productName,
      reason: card.reason?.message ?? '비교에서 빠졌어요',
      image: cardImages.get(card.userCardId)?.image,
      isHorizontal: cardImages.get(card.userCardId)?.isHorizontal ?? true,
    })),
    questions: pickQuestions(cards),
    createdAt: data.createdAt,
  };
};

// 추천 요청 본문을 다시 만듭니다. (사용 현황을 저장한 뒤 다시 추천받을 때)
export const toRecommendationRequest = (recommendation) =>
  recommendation.basis === 'CATEGORY'
    ? { categoryId: recommendation.categoryId, amount: recommendation.amount }
    : { merchantId: recommendation.merchantId, amount: recommendation.amount };

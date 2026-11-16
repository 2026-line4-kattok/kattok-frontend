// 카드 사용 현황 시트·금액 입력 화면이 함께 쓰는 실적 구간·한도 질문 도우미

// 직접 입력한 지난달 결제 금액 → 실적 선택값('BELOW' | 'TIER-{id}' | 'UNKNOWN')
// tierOptions는 level 오름차순입니다. 금액 이상인 가장 높은 구간을 고릅니다.
// 아직 금액을 입력하지 않았으면 fallback(보통 저장된 실적 선택값)을 씁니다.
export const performanceAnswerFromAmount = (
  tierOptions = [],
  amount,
  fallback = 'UNKNOWN',
) => {
  if (amount == null) return fallback;
  const tier = tierOptions
    .filter((option) => option.minAmount <= amount)
    .at(-1);
  return tier ? `TIER-${tier.id}` : 'BELOW';
};

// 실적 선택값에 맞는 한도 질문 목록
// card.usageCapsByAnswer가 있으면(실적 구간이 있는 카드) 고른 구간의 한도를, 없으면 card.usageCaps를 씁니다.
export const getUsageCaps = (card, performanceAnswer) =>
  card.usageCapsByAnswer
    ? (card.usageCapsByAnswer[performanceAnswer] ?? [])
    : (card.usageCaps ?? []);

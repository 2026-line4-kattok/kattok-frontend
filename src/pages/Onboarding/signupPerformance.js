const amountLabel = (amount) =>
  amount % 10000 === 0
    ? `${amount / 10000}만 원`
    : `${amount.toLocaleString('ko-KR')}원`;

const benefitLabel = (benefits = []) =>
  [
    ...new Set(benefits.map((benefit) => benefit.displayText).filter(Boolean)),
  ].join(' · ');

export function getSpendingOptions(product) {
  if (!product || ['NONE', 'NEEDS_CHECK'].includes(product.performanceType))
    return [];
  const tiers = [...(product.performanceTiers ?? [])].sort(
    (a, b) => a.level - b.level,
  );
  const options = [];
  if (tiers.length > 0 && tiers[0].minAmount > 0) {
    options.push({
      id: 'BELOW',
      title: `${amountLabel(tiers[0].minAmount)} 미만`,
      desc:
        benefitLabel(product.alwaysOnBenefits) ||
        '실적 조건 없이 제공되는 혜택만 적용돼요',
      performance: { status: 'BELOW' },
    });
  }
  options.push(
    ...tiers.map((tier) => ({
      id: `TIER-${tier.id}`,
      title: tier.label || `${amountLabel(tier.minAmount)} 이상`,
      desc:
        benefitLabel(tier.benefits) || '선택한 실적 구간으로 혜택을 계산해요',
      performance: { status: 'CONFIRMED', tierId: tier.id },
    })),
  );
  options.push({
    id: 'UNKNOWN',
    title: '모르겠어요',
    desc: '실적을 확인한 뒤 내 카드에서 수정할 수 있어요',
    performance: { status: 'UNKNOWN' },
  });
  return options;
}

export function buildRegistrationRequest(product, selection) {
  if (!Number.isInteger(product?.id) || product.id <= 0)
    throw new Error('카드를 다시 선택해주세요.');
  if (['NONE', 'NEEDS_CHECK'].includes(product.performanceType))
    return { productId: product.id };
  if (!['SINGLE', 'MULTIPLE'].includes(product.performanceType))
    throw new Error('카드 실적 정보를 확인하지 못했어요.');
  const option = getSpendingOptions(product).find(
    (item) => item.id === selection,
  );
  if (!option) throw new Error('지난달 실적을 선택해주세요.');
  return { productId: product.id, performance: option.performance };
}

export async function registerProduct(client, product, selection) {
  const body = buildRegistrationRequest(product, selection);
  try {
    return await client.post('/v1/owned-cards', body);
  } catch (error) {
    if (
      error.response?.status !== 409 ||
      error.response?.data?.code !== 'CARD_ALREADY_REGISTERED'
    )
      throw error;
    const cards = await client.get('/v1/owned-cards');
    const existing =
      Array.isArray(cards) &&
      cards.find((card) => card.product?.id === product.id);
    if (!existing) throw error;
    return existing;
  }
}

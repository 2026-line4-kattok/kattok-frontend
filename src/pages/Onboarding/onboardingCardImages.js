import { toOwnedCardView } from '@/pages/Card/ownedCardMapper';

// 전달받은 파일명(코드_카드사_상품명.png)을 그대로 사용합니다.
const images = import.meta.glob('@/assets/card/received/*.png', {
  eager: true,
  import: 'default',
});

// 현재 전달된 PNG의 실제 가로/세로 크기를 확인한 결과입니다.
const horizontalCodes = new Set([
  'CK017',
  'CK022',
  'CK027',
  'CK044',
  'CK060',
  'CK061',
  'CK062',
  'CK063',
  'CK070',
  'CK077',
  'CK079',
  'CK082',
  'CK087',
  'CK095',
  'CK098',
  'CR004',
  'CR014',
  'CR065',
  'CR094',
  'CT01',
  'CT02',
]);

// +와 &는 상품 구분에 사용하므로 지우지 않습니다.
const normalize = (value = '') =>
  value.toLowerCase().replace(/[^0-9a-z가-힣+&]/g, '');
const issuerKey = (value) => {
  const key = normalize(value).replace(/은행|카드/g, '');
  if (['kb국민', '국민', 'kb'].includes(key)) return 'kb';
  if (['ibk', 'ibk기업', '기업'].includes(key)) return 'ibk';
  if (['bc', 'bc바로', '비씨', '비씨바로'].includes(key)) return 'bc';
  return key;
};

const productKey = (name, issuer) => {
  let key = normalize(name);
  // API와 파일명의 '신한카드 Mr.Life' / 'Mr.Life' 같은 차이를 처리합니다.
  const prefixes =
    issuer === 'kb'
      ? ['kb국민', '국민', 'kb']
      : issuer === 'ibk'
        ? ['ibk기업', '기업', 'ibk']
        : issuer === 'bc'
          ? ['bc바로', '비씨바로', 'bc', '비씨']
          : [issuer];
  const prefix = prefixes.find((item) => item && key.startsWith(item));
  if (prefix) key = key.slice(prefix.length);
  return key.replace(/카드/g, '');
};

const entries = Object.entries(images).flatMap(([path, image]) => {
  const file = path
    .split('/')
    .pop()
    .replace(/\.png$/i, '');
  const match = /^((?:CK|CR|CT)\d+)_([^_]+)_(.+)$/.exec(file);
  if (!match) return [];
  const [, code, issuer, name] = match;
  const key = issuerKey(issuer);
  return [
    {
      image,
      code,
      issuer: key,
      name,
      product: productKey(name, key),
      baseProduct: productKey(name.replace(/\([^)]*\)/g, ''), key),
      cardType: code.startsWith('CK')
        ? 'CHECK'
        : code.startsWith('CR')
          ? 'CREDIT'
          : null,
      isHorizontal: horizontalCodes.has(code),
    },
  ];
});

export function findOnboardingCardImage(product) {
  const issuer = issuerKey(product.issuerName ?? product.issuer?.name ?? '');
  if (!issuer) return null;
  const candidates = entries.filter(
    (entry) =>
      entry.issuer === issuer &&
      (!product.cardType ||
        !entry.cardType ||
        entry.cardType === product.cardType),
  );
  const key = productKey(product.name, issuer);
  const exact = candidates.filter((entry) => entry.product === key);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;
  // 괄호가 별명·보충 설명인 경우 한 후보만 연결하고, 여러 디자인이면 선택하지 않습니다.
  const baseKey = productKey(
    (product.name ?? '').replace(/\([^)]*\)/g, ''),
    issuer,
  );
  const aliases = candidates.filter((entry) => entry.baseProduct === baseKey);
  return aliases.length === 1 ? aliases[0] : null;
}

export function toOnboardingCardView(ownedCard) {
  const view = toOwnedCardView(ownedCard);
  const match = findOnboardingCardImage(ownedCard.product);
  return match
    ? { ...view, image: match.image, isHorizontal: match.isHorizontal }
    : view;
}

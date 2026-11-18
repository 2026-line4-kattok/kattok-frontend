import emptyCardImage from '@/assets/onboarding/card/empty.png';

// 카드 상품(이름·카드사·종류) → 카드 이미지
// 1) assets/card/received: 전달받은 파일명(코드_카드사_상품명.png)으로 카드사·상품명을 정확히 맞춥니다.
// 2) assets/card: 이전에 넣어 둔 이미지(카드명.png)를 이름으로 느슨하게 찾습니다.
// 3) 둘 다 없으면 빈 카드 이미지를 씁니다.
// 서버가 이미지 URL을 주면 교체합니다.

const RECEIVED_IMAGES = import.meta.glob('@/assets/card/received/*.png', {
  eager: true,
  import: 'default',
});
const LEGACY_IMAGES = import.meta.glob('@/assets/card/*.png', {
  eager: true,
  import: 'default',
});

// 실제 PNG 크기가 가로가 더 긴 이미지 (나머지는 세로형이라 화면에서 눕혀서 보여 줍니다)
const HORIZONTAL_CODES = new Set([
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
const HORIZONTAL_LEGACY_KEYS = new Set(['kb국민노리2']);

const fileName = (path) =>
  decodeURIComponent(path)
    .split('/')
    .pop()
    .replace(/\.png$/i, '');

// ---------------------------------------------------------------------------
// 1) received 폴더
// ---------------------------------------------------------------------------

// +와 &는 상품 구분에 사용하므로 지우지 않습니다.
const normalize = (value = '') =>
  value.toLowerCase().replace(/[^0-9a-z가-힣+&]/g, '');

export const issuerKey = (value) => {
  const key = normalize(value).replace(/은행|카드/g, '');
  if (['kb국민', '국민', 'kb'].includes(key)) return 'kb';
  if (['ibk', 'ibk기업', '기업'].includes(key)) return 'ibk';
  if (['bc', 'bc바로', '비씨', '비씨바로'].includes(key)) return 'bc';
  return key;
};

export const productKey = (name, issuer) => {
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

// 파일 이름 → 매칭용 항목 (형식이 다르면 null)
export const toReceivedEntry = (file, image) => {
  const match = /^((?:CK|CR|CT)\d+)_([^_]+)_(.+)$/.exec(file);
  if (!match) return null;
  const [, code, issuer, name] = match;
  const key = issuerKey(issuer);
  return {
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
    isHorizontal: HORIZONTAL_CODES.has(code),
  };
};

const RECEIVED_ENTRIES = Object.entries(RECEIVED_IMAGES)
  .map(([path, image]) => toReceivedEntry(fileName(path), image))
  .filter(Boolean);

// 카드사가 같고 상품명이 정확히 맞는 이미지를 찾습니다. 여러 후보가 맞으면 고르지 않습니다.
export const findReceivedEntry = (product, entries = RECEIVED_ENTRIES) => {
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
};

// ---------------------------------------------------------------------------
// 2) 기존 card 폴더
// ---------------------------------------------------------------------------

// '카드'·'체크'·'은행'처럼 이름마다 붙었다 빠졌다 하는 단어는 빼고 비교합니다.
// (예: 'KB국민카드 노리2 체크카드' ↔ 'KB 국민은행 노리2')
const looseNormalize = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]/g, '')
    .replace(/카드|체크|은행/g, '');

const LEGACY_ENTRIES = Object.entries(LEGACY_IMAGES).map(([path, src]) => ({
  key: looseNormalize(fileName(path)),
  src,
}));

const findLegacyImage = ({ name, issuerName }) => {
  const candidates = [
    looseNormalize(name),
    looseNormalize(`${issuerName ?? ''}${name ?? ''}`),
  ].filter(Boolean);
  const found =
    LEGACY_ENTRIES.find(({ key }) => candidates.includes(key)) ??
    LEGACY_ENTRIES.find(({ key }) =>
      candidates.some((c) => key.includes(c) || c.includes(key)),
    );
  return found
    ? { image: found.src, isHorizontal: HORIZONTAL_LEGACY_KEYS.has(found.key) }
    : null;
};

// ---------------------------------------------------------------------------

// product: { name, issuerName | issuer: { name }, cardType? } → { image, isHorizontal }
export const findCardImage = (product = {}) => {
  const received = findReceivedEntry(product);
  if (received) {
    return { image: received.image, isHorizontal: received.isHorizontal };
  }
  return (
    findLegacyImage(product) ?? { image: emptyCardImage, isHorizontal: true }
  );
};

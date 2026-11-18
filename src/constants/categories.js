import cafeIcon from '@/assets/3DIcons/cafe.png';
import convenienceStoreIcon from '@/assets/3DIcons/convenience_store.png';
import departmentStoreIcon from '@/assets/3DIcons/department_store.png';
import martIcon from '@/assets/3DIcons/mart.png';
import onlineShoppingIcon from '@/assets/3DIcons/online-shopping.png';
import pharmacyIcon from '@/assets/3DIcons/pharmacy.png';
import restaurantIcon from '@/assets/3DIcons/restaurant.png';
import taxiIcon from '@/assets/3DIcons/taxi.png';

// 업종 이름별 아이콘. 업종 목록·순서·ID는 서버(GET /merchant-categories)에서 받습니다.
// aliases: 다른 API에서 쓰는 이름(예: 4-2·4-4는 '커피전문점', 4-3은 '카페')
export const CATEGORIES = [
  { label: '카페', aliases: ['커피전문점'], icon: cafeIcon },
  { label: '편의점', icon: convenienceStoreIcon },
  { label: '음식점', icon: restaurantIcon },
  { label: '마트', icon: martIcon },
  { label: '온라인 쇼핑', icon: onlineShoppingIcon },
  { label: '약국', icon: pharmacyIcon },
  { label: '택시', icon: taxiIcon },
  { label: '백화점', icon: departmentStoreIcon },
];

// 띄어쓰기 차이('온라인쇼핑' / '온라인 쇼핑')를 무시하고 비교합니다.
const normalize = (text) => text.replace(/\s/g, '');

// 이름 안에 다른 단어의 일부로 들어간 경우는 업종으로 보지 않습니다. (예: '스마트폰'의 '마트')
const FALSE_MATCHES = { 마트: ['스마트'] };

// text에서 name이 처음 나오는 위치 (없으면 -1)
const findPosition = (text, name) => {
  let from = 0;
  while (from <= text.length) {
    const index = text.indexOf(name, from);
    if (index < 0) return -1;
    const isFalseMatch = (FALSE_MATCHES[name] ?? []).some((word) => {
      const start = index - word.indexOf(name);
      return start >= 0 && text.startsWith(word, start);
    });
    if (!isFalseMatch) return index;
    from = index + 1;
  }
  return -1;
};

// 업종명이나 업종명이 들어간 문구('카페 10% 할인', '주말 마트 10% 할인' 등)에 맞는 아이콘을 찾습니다.
// 여러 업종이 들어 있으면 가장 앞에 나온 업종을 씁니다.
export const getCategoryIcon = (text = '') => {
  const target = normalize(text);
  let best = null;
  CATEGORIES.forEach(({ label, aliases = [], icon }) => {
    [label, ...aliases].forEach((name) => {
      const position = findPosition(target, normalize(name));
      if (position >= 0 && (best === null || position < best.position)) {
        best = { position, icon };
      }
    });
  });
  return best?.icon;
};

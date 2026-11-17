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

// 업종명 또는 업종명으로 시작하는 문구('카페 10% 할인' 등)에 맞는 아이콘을 찾습니다.
export const getCategoryIcon = (text = '') => {
  const target = normalize(text);
  return CATEGORIES.find(({ label, aliases = [] }) =>
    [label, ...aliases].some((name) => target.startsWith(normalize(name))),
  )?.icon;
};

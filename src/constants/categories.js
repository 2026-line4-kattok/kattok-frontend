import cafeIcon from '@/assets/3DIcons/cafe.png';
import convenienceStoreIcon from '@/assets/3DIcons/convenience_store.png';
import departmentStoreIcon from '@/assets/3DIcons/department_store.png';
import martIcon from '@/assets/3DIcons/mart.png';
import onlineShoppingIcon from '@/assets/3DIcons/online-shopping.png';
import pharmacyIcon from '@/assets/3DIcons/pharmacy.png';
import restaurantIcon from '@/assets/3DIcons/restaurant.png';
import taxiIcon from '@/assets/3DIcons/taxi.png';

// 업종으로 고르기 카테고리 목록
export const CATEGORIES = [
  { label: '카페', icon: cafeIcon },
  { label: '편의점', icon: convenienceStoreIcon },
  { label: '음식점', icon: restaurantIcon },
  { label: '마트', icon: martIcon },
  { label: '온라인 쇼핑', icon: onlineShoppingIcon },
  { label: '약국', icon: pharmacyIcon },
  { label: '택시', icon: taxiIcon },
  { label: '백화점', icon: departmentStoreIcon },
];

// 업종명 또는 업종명으로 시작하는 문구('카페 10% 할인' 등)에 맞는 아이콘을 찾습니다.
export const getCategoryIcon = (text = '') =>
  CATEGORIES.find(({ label }) => text.startsWith(label))?.icon;

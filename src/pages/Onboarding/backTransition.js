import { flushSync } from 'react-dom';

const animations = new WeakMap();

// 로그인 → 온보딩의 animate-slide-in과 같은 방향·시간·이징입니다.
// 지정한 페이지에만 적용하므로 다른 폴더의 화면 전환에는 영향을 주지 않습니다.
export function slideBack(update, getPage) {
  flushSync(update);
  const page = getPage();
  if (!page) return;
  animations.get(page)?.cancel();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const animation = page.animate?.(
    [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
    { duration: 300, easing: 'ease-out' },
  );
  if (animation) animations.set(page, animation);
}

import { useEffect, useState } from 'react';

// 입력이 멈춘 뒤 delay(ms)가 지나면 값을 반영합니다.
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

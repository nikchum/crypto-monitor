// hooks/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * Хук для отложенного обновления значения.
 * @param value Значение, которое нужно отложить.
 * @param delay Задержка в миллисекундах.
 * @returns Отложенное значение.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Устанавливаем таймер
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем предыдущий таймер при каждом изменении `value` (сброс debounce)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Срабатывает при изменении value или delay

  return debouncedValue;
}

export default useDebounce;

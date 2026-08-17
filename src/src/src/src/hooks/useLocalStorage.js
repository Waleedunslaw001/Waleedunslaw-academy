import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  const [storedValue, setStoredValue] = useState(() => {
    // Support lazy initializer function and avoid accessing window during SSR
    const getInitial = typeof initialValue === 'function' ? initialValue : () => initialValue;

    if (!isBrowser) return getInitial();

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : getInitial();
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return getInitial();
    }
  });

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isBrowser]);

  // Setter accepts either value or updater function (like setState)
  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        if (isBrowser) {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        }
        return valueToStore;
      });
    },
    [key, isBrowser]
  );

  return [storedValue, setValue];
}

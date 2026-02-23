import { useState } from 'react';
import { storage } from '../utils/storage';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      storage.set(key, value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};


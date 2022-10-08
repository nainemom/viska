import { useState, useEffect } from 'preact/hooks';

const getFromStorage = (key = '', defaultValue = null, storage) => {
  try {
    const parsed = JSON.parse(storage.getItem(key));
    return parsed === null ? defaultValue : parsed;
  } catch (_e) {
    return defaultValue;
  }
};

const writeToStorage = (key = '', value = '', storage) => {
  storage.setItem(key, JSON.stringify(value));
};

export const useStorage = (key, defaultValue, storage = localStorage) => {
  const [value, setValue] = useState(getFromStorage(key, defaultValue, storage));

  useEffect(() => {
    writeToStorage(key, value, storage);
  }, [value]);

  return [value, setValue];
}

import { useState, useEffect, useCallback } from 'preact/hooks';
import { typeOf } from './types.js';

const parseParams = (locationHash) => {
  const hashString = decodeURIComponent(locationHash.replace(/^#/g, ''));
  try {
    const parsed = JSON.parse(hashString);
    if (typeOf(parsed) === 'object') {
      return parsed;
    }
    return {};
  } catch (_e) {
    return {};
  }
}

export const useParams = () => {
  const [params, _setParams] = useState(parseParams(window.location.hash));

  const handleChanges = useCallback(() => {
    _setParams(parseParams(window.location.hash));
  }, []);

  useEffect(() => {
    window.addEventListener('urlchange', handleChanges);
    return () => {
      window.removeEventListener('urlchange', handleChanges);
    };
  }, []);

  const setParams = useCallback((input) => {
    let newParams;
    if (typeOf(input) === 'function') {
      newParams = input(params);
    } else {
      newParams = input;
    }
    history.replaceState({}, '', `#${JSON.stringify(newParams)}`);
    window.dispatchEvent(new CustomEvent('urlchange'));
  }, [params]);

  return [params, setParams];
}

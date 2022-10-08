import { useState, useEffect, useCallback } from 'preact/hooks';
import { typeOf } from './types.js';

const parseParams = (locationHash) => {
  const hashString = locationHash.replace(/^#/g, '');
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
  const [params, setParams] = useState(parseParams(window.location.hash));

  const handlePopstate = useCallback((event) => {
    setParams(parseParams(event.target.location.hash));
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', handlePopstate, true);
    return () => {
      window.removeEventListener('popstate', handlePopstate, true);
    };
  });

  return params;
}

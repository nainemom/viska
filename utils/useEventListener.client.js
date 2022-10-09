import { useEffect } from "preact/hooks";

export const useEventListener = (element, ...eventListenerArgs) => {
  useEffect(() => {
    if (element) {
      element.addEventListener(...eventListenerArgs);
    }
    return () => {
      if (element) {
        element.removeEventListener(...eventListenerArgs);
      }
    };
  }, []);
};

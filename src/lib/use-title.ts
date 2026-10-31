import { useEffect } from 'react';

/** Keeps document.title in step with the page. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

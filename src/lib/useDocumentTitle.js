import { useEffect } from 'react';

/**
 * Sets the browser tab title (and the SERP title fallback) for the
 * lifetime of the calling component. Restores the previous title when
 * the component unmounts so a back-navigation doesn't leave the title
 * stuck on a detail page.
 *
 *   useDocumentTitle('Recent activity');
 *   useDocumentTitle(profile?.name + ' · Profile');
 *
 * Pass null/undefined while data loads to keep the current title.
 */
const SUFFIX = ' · AWI Florida Chapter';

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    const prev = document.title;
    document.title = String(title) + SUFFIX;
    return () => { document.title = prev; };
  }, [title]);
}

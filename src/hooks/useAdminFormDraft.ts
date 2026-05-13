import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type Options<T extends Record<string, unknown>> = {
  storageKey: string;
  /** When true (e.g. create modal open), hydrate once and persist changes */
  active: boolean;
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  getEmpty: () => T;
  debounceMs?: number;
};

/**
 * Persists JSON-serializable create-form fields in sessionStorage so accidental modal close
 * does not lose work. File inputs are not persisted. Cleared on successful submit via clearDraft
 * or when the user clicks “Clear form”.
 */
export function useAdminFormDraft<T extends Record<string, unknown>>(opts: Options<T>) {
  const { storageKey, active, form, setForm, getEmpty } = opts;
  const debounceMs = opts.debounceMs ?? 300;
  const hydratedRef = useRef(false);
  const getEmptyRef = useRef(getEmpty);
  getEmptyRef.current = getEmpty;

  useEffect(() => {
    if (!active) {
      hydratedRef.current = false;
      return;
    }
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        setForm({ ...(getEmptyRef.current() as T), ...parsed });
      } else {
        setForm(getEmptyRef.current() as T);
      }
    } catch {
      setForm(getEmptyRef.current() as T);
    }
  }, [active, storageKey, setForm]);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(form));
      } catch {
        /* quota / private mode */
      }
    }, debounceMs);
    return () => clearTimeout(t);
  }, [active, storageKey, form, debounceMs]);

  const flushDraft = useCallback(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [active, storageKey, form]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setForm(getEmptyRef.current() as T);
    hydratedRef.current = true;
  }, [storageKey, setForm]);

  return { clearDraft, flushDraft };
}

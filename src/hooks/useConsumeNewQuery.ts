import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

/** When URL contains `?new=1`, run once then strip the param (used for admin “create” deep links). */
export function useConsumeNewQuery(onNew: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onNewRef = useRef(onNew);
  const consumed = useRef(false);
  onNewRef.current = onNew;

  useEffect(() => {
    if (consumed.current || searchParams.get('new') !== '1') return;
    consumed.current = true;
    onNewRef.current();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);
}

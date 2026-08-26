import { useEffect, useState } from 'react';

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[], errorMessage: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        setData(null);
        setError('');
        fn().then((result) => {
            if (!cancelled) setData(result);
        }).catch(() => {
            if (!cancelled) setError(errorMessage);
        });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { data, errorMessage: error };
}

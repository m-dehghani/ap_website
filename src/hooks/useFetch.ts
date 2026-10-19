import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<T | null>;
  refetch: () => Promise<T | null>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<T | null> => {
    if (mounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetchFn();
      if (mounted.current) {
        setData(result);
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (mounted.current) {
        setError(error);
        onError?.(error);
      }
      return null;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (!immediate) {
      return undefined;
    }

    void Promise.resolve().then(execute);
    return undefined;
  }, [execute, immediate]);

  return { data, loading, error, execute, refetch: execute };
}

export function useAsync<T>(promise: Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const runAsync = async () => {
      setLoading(true);
      try {
        const result = await promise;
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    runAsync();
    return () => { mounted = false; };
  }, [promise]);

  return { data, loading, error };
}
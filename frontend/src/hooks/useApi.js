/**
 * useApi — A minimal, reusable data-fetching hook backed by the project's
 * existing `api` client. Handles loading, error, and caching states.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi('/discovery/teams');
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

// Simple in-memory cache keyed by endpoint so repeated mounts don't re-fetch
const cache = new Map();

export default function useApi(endpoint, { enabled = true, fallback = null, params } = {}) {
  const [data, setData] = useState(() => cache.get(buildKey(endpoint, params)) ?? fallback);
  const [loading, setLoading] = useState(!cache.has(buildKey(endpoint, params)) && enabled);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!endpoint || !enabled) return;
      const key = buildKey(endpoint, params);

      if (!skipCache && cache.has(key)) {
        setData(cache.get(key));
        setLoading(false);
        return;
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        const result = await api.get(`${endpoint}${queryString}`, {
          signal: abortRef.current.signal,
        });
        cache.set(key, result);
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message ?? 'Fetch failed');
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, enabled, JSON.stringify(params)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
}

function buildKey(endpoint, params) {
  return params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
}

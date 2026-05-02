"use client";

import { useState, useCallback } from "react";
import { requestProtectedLessonResource } from "@/actions/lms/resource.actions";
import type { ProtectedResourceResponse } from "@/lib/lms/schemas/lms.schemas";

const EXPIRY_SAFETY_MARGIN_MS = 30_000; // solicitar 30s antes del TTL real

interface State {
  data: ProtectedResourceResponse | null;
  loading: boolean;
  error: string | null;
  expiresAt: Date | null;
}

export function useProtectedResource(resourceId: string) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
    expiresAt: null,
  });

  const isExpired = useCallback(() => {
    if (!state.expiresAt) return true;
    return Date.now() > state.expiresAt.getTime() - EXPIRY_SAFETY_MARGIN_MS;
  }, [state.expiresAt]);

  const requestUrl = useCallback(async () => {
    if (!isExpired() && state.data) return state.data;

    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await requestProtectedLessonResource(resourceId);

    if (!result.ok) {
      setState((s) => ({ ...s, loading: false, error: result.error ?? "Error" }));
      return null;
    }

    setState({
      data: result.data,
      loading: false,
      error: null,
      expiresAt: result.data.expiresAt,
    });
    return result.data;
  }, [resourceId, isExpired, state.data]);

  return { ...state, requestUrl, isExpired };
}

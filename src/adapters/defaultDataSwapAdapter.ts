// src/adapters/defaultDataSwapAdapter.ts

import { FetchCoreResult } from '../http/fetchCore.js';

export function defaultDataSwapAdapter<T = unknown>(
  raw: any,
  httpStatus: number
): FetchCoreResult<T> {
  return {
    success: raw?.success ?? (httpStatus >= 200 && httpStatus < 300),
    status: httpStatus,
    data: raw?.data as T,
    message: raw?.message,
  };
}
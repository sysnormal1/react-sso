// src/http/fetchCore.ts

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type FetchCoreResult<T = unknown> = {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
};

export type ResponseAdapter<T = unknown> = (
  raw: unknown,
  httpStatus: number
) => FetchCoreResult<T>;

export type FetchCoreParams<T = unknown> = {
  url: string;
  method?: HttpMethod;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
  responseAdapter?: ResponseAdapter<T>;
};

export async function fetchCore<T = unknown>(
  params: FetchCoreParams<T>
): Promise<FetchCoreResult<T>> {
  const {
    url,
    method = 'GET',
    token,
    body,
    headers: extraHeaders,
    responseAdapter,
  } = params;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? (typeof body === "object" ? JSON.stringify(body) : body) : undefined as any,
  });

  const raw = await response.json();

  if (responseAdapter) {
    return responseAdapter(raw, response.status);
  }

  // comportamento padrão: assume que o json já tem success/data/message
  return {
    success: response.ok,
    status: response.status,
    data: raw as T,
    message: raw?.message,
  };
}
// src/http/fetchCore.ts

import { responseParser } from "./responseCore.js";
import { deferredJsonBody } from "./jsonRowsReader.js";

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
  useLargeJsonParser?: boolean;
  /**
   * When the response is ok, returns its body still in bytes, as a
   * `DeferredJsonBody` in `data`, without parsing it nor passing it through the
   * adapter: the caller looks at the size first and then parses it or saves it
   * as a file. Error responses are parsed as usual.
   */
  deferJsonParse?: boolean;
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
    useLargeJsonParser = false,
    deferJsonParse = false
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
  
  if (deferJsonParse && response.ok) {
    return {
      success: true,
      status: response.status,
      data: deferredJsonBody(await response.blob()) as T,
    };
  }

  const raw: any = await responseParser(response, useLargeJsonParser);

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
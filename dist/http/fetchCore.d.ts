export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type FetchCoreResult<T = unknown> = {
    success: boolean;
    status: number;
    data?: T;
    message?: string;
};
export type ResponseAdapter<T = unknown> = (raw: unknown, httpStatus: number) => FetchCoreResult<T>;
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
export declare function fetchCore<T = unknown>(params: FetchCoreParams<T>): Promise<FetchCoreResult<T>>;
//# sourceMappingURL=fetchCore.d.ts.map
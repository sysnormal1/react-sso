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
};
export declare function largeJsonParse(stringBuffer?: any): any;
export declare function fetchCore<T = unknown>(params: FetchCoreParams<T>): Promise<FetchCoreResult<T>>;
//# sourceMappingURL=fetchCore.d.ts.map
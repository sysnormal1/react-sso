// src/adapters/defaultDataSwapAdapter.ts
export function defaultDataSwapAdapter(raw, httpStatus) {
    return {
        success: raw?.success ?? (httpStatus >= 200 && httpStatus < 300),
        status: httpStatus,
        data: raw?.data,
        message: raw?.message,
    };
}

// src/http/fetchCore.ts
export async function fetchCore(params) {
    const { url, method = 'GET', token, body, headers: extraHeaders, responseAdapter, } = params;
    const headers = {
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
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const raw = await response.json();
    if (responseAdapter) {
        return responseAdapter(raw, response.status);
    }
    // comportamento padrão: assume que o json já tem success/data/message
    return {
        success: response.ok,
        status: response.status,
        data: raw,
        message: raw?.message,
    };
}

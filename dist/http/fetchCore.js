// src/http/fetchCore.ts
import { responseParser } from "./responseCore.js";
import { deferredJsonBody } from "./jsonRowsReader.js";
export async function fetchCore(params) {
    const { url, method = 'GET', token, body, headers: extraHeaders, responseAdapter, useLargeJsonParser = false, deferJsonParse = false } = params;
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
        body: body !== undefined ? (typeof body === "object" ? JSON.stringify(body) : body) : undefined,
    });
    if (deferJsonParse && response.ok) {
        return {
            success: true,
            status: response.status,
            data: deferredJsonBody(await response.blob()),
        };
    }
    const raw = await responseParser(response, useLargeJsonParser);
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

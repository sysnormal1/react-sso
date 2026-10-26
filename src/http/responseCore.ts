
import { JsonRowsReader, readJsonRows } from "./jsonRowsReader.js";

/**
 * Parses a large JSON response that arrived split across several strings.
 *
 * @remarks
 * Kept for callers of the old helper; the work is done by
 * {@link JsonRowsReader}, which reads the rows of the `data` array one by one.
 *
 * @param stringBuffer the pieces of the response, in order.
 * @returns the parsed JSON, or `null` when nothing was given.
 */
export function largeJsonParse(stringBuffer?: (string | null)[]) {
    if (!stringBuffer) return null;
    const reader = new JsonRowsReader();
    for (const piece of stringBuffer) {
        if (piece) reader.push(piece);
    }
    return reader.finish();
}

export async function responseParser(response?: Response, useLargeJsonParser: boolean = false) : Promise<any> {
    /**
     * Large responses are read row by row as they arrive: the text is dropped
     * piece by piece instead of being held whole until the end.
     */
    if (response?.body && typeof response.body.getReader == 'function' && useLargeJsonParser === true) {
        return readJsonRows(response.body, new JsonRowsReader());
    }
    return await response?.json();
}

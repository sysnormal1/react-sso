// src/http/jsonRowsReader.ts
/**
 * Reads a large JSON response piece by piece, turning each row of its `data`
 * array into an object as soon as the row is complete.
 *
 * @remarks
 * The whole text of a big response never has to exist at once: each piece is
 * scanned and dropped, and only the rows survive. With `onRow`, not even the
 * rows survive — each one is handed over and forgotten, which is how a result
 * too big for the screen becomes a CSV file.
 *
 * Supported payloads (the same as the old `largeJsonParse`):
 *
 * ```json
 * { "data":[{ "DATA":[ {...},{...} ] }] }
 * { "data":[ {...},{...} ] }
 * ```
 *
 * Anything else — no `data` array, or one written with spaces around the
 * colon — is parsed whole at the end, as `JSON.parse` would.
 *
 * Rows are found by counting braces outside strings, so a value holding
 * `},{` or a nested object does not split a row.
 */
export class JsonRowsReader {
    static NESTED_MARKER = '"data":[{"DATA":[';
    static FLAT_MARKER = '"data":[';
    onRow;
    countOnly;
    rows = [];
    phase = 'head';
    head = '';
    shape = null;
    tail = [];
    rowParts = [];
    depth = 0;
    inString = false;
    escaped = false;
    count = 0;
    /**
     * @param onRow when given, each row is handed here instead of being kept,
     * and the parsed result carries an empty array in its place.
     * @param countOnly only counts the rows, without turning them into objects:
     * a fast pass to learn the size of a result before paying for it.
     */
    constructor(onRow, countOnly = false) {
        this.onRow = onRow;
        this.countOnly = countOnly;
    }
    /** How many rows were read so far. */
    get rowCount() {
        return this.count;
    }
    /** Feeds the next piece of text, in the order it arrived. */
    push(text) {
        if (!text)
            return;
        if (this.phase === 'head') {
            this.head += text;
            const start = this.findRowsStart();
            if (start < 0)
                return;
            const rest = this.head.slice(start);
            this.head = this.head.slice(0, start);
            this.phase = 'rows';
            this.scanRows(rest);
        }
        else if (this.phase === 'rows') {
            this.scanRows(text);
        }
        else {
            this.tail.push(text);
        }
    }
    /** Ends the reading and returns the whole JSON, with the rows in place. */
    finish() {
        if (this.phase === 'head') {
            return JSON.parse(this.head);
        }
        if (this.phase === 'rows') {
            throw new SyntaxError('Unexpected end of JSON input: the data array was not closed');
        }
        const result = JSON.parse(this.head + this.tail.join(''));
        const rows = this.onRow || this.countOnly ? [] : this.rows;
        if (this.shape === 'nested') {
            result.data[0].DATA = rows;
        }
        else {
            result.data = rows;
        }
        return result;
    }
    /**
     * Where the rows begin in the head, or -1 while it cannot be told yet.
     * The nested marker is tried first; the flat one only wins once enough
     * text arrived to be sure the nested one is not coming.
     */
    findRowsStart() {
        const nested = this.head.indexOf(JsonRowsReader.NESTED_MARKER);
        if (nested > -1) {
            this.shape = 'nested';
            return nested + JsonRowsReader.NESTED_MARKER.length;
        }
        const flat = this.head.indexOf(JsonRowsReader.FLAT_MARKER);
        if (flat > -1) {
            const after = this.head.slice(flat);
            if (after.length < JsonRowsReader.NESTED_MARKER.length
                && JsonRowsReader.NESTED_MARKER.startsWith(after)) {
                return -1;
            }
            this.shape = 'flat';
            return flat + JsonRowsReader.FLAT_MARKER.length;
        }
        return -1;
    }
    scanRows(text) {
        let rowStart = this.depth > 0 ? 0 : -1;
        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            if (this.inString) {
                if (this.escaped) {
                    this.escaped = false;
                }
                else if (c === 92 /* \ */) {
                    this.escaped = true;
                }
                else if (c === 34 /* " */) {
                    this.inString = false;
                }
                continue;
            }
            if (c === 34 /* " */) {
                this.inString = true;
            }
            else if (c === 123 /* { */) {
                if (this.depth === 0)
                    rowStart = i;
                this.depth++;
            }
            else if (c === 125 /* } */) {
                this.depth--;
                if (this.depth === 0) {
                    if (this.countOnly) {
                        this.count++;
                    }
                    else {
                        this.rowParts.push(text.slice(rowStart, i + 1));
                        this.emit(JSON.parse(this.rowParts.join('')));
                    }
                    this.rowParts = [];
                    rowStart = -1;
                }
            }
            else if (c === 93 /* ] */ && this.depth === 0) {
                this.phase = 'tail';
                this.tail.push(text.slice(i));
                return;
            }
        }
        if (this.depth > 0 && !this.countOnly) {
            this.rowParts.push(text.slice(rowStart));
        }
    }
    emit(row) {
        this.count++;
        if (this.onRow) {
            this.onRow(row);
        }
        else {
            this.rows.push(row);
        }
    }
}
/**
 * Feeds a byte stream to a {@link JsonRowsReader}, decoding as it goes, and
 * returns what the reader finished with.
 */
export async function readJsonRows(stream, reader) {
    const bytes = stream.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await bytes.read();
        if (done)
            break;
        reader.push(decoder.decode(value, { stream: true }));
    }
    reader.push(decoder.decode());
    return reader.finish();
}
export function deferredJsonBody(blob) {
    return {
        blob,
        size: blob.size,
        json: () => readJsonRows(blob.stream(), new JsonRowsReader()),
        eachRow: (onRow) => readJsonRows(blob.stream(), new JsonRowsReader(onRow)),
        countRows: async () => {
            const reader = new JsonRowsReader(undefined, true);
            await readJsonRows(blob.stream(), reader);
            return reader.rowCount;
        },
    };
}

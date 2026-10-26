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
export declare class JsonRowsReader {
    private static readonly NESTED_MARKER;
    private static readonly FLAT_MARKER;
    private readonly onRow?;
    private readonly countOnly;
    private readonly rows;
    private phase;
    private head;
    private shape;
    private tail;
    private rowParts;
    private depth;
    private inString;
    private escaped;
    private count;
    /**
     * @param onRow when given, each row is handed here instead of being kept,
     * and the parsed result carries an empty array in its place.
     * @param countOnly only counts the rows, without turning them into objects:
     * a fast pass to learn the size of a result before paying for it.
     */
    constructor(onRow?: (row: any) => void, countOnly?: boolean);
    /** How many rows were read so far. */
    get rowCount(): number;
    /** Feeds the next piece of text, in the order it arrived. */
    push(text: string): void;
    /** Ends the reading and returns the whole JSON, with the rows in place. */
    finish(): any;
    /**
     * Where the rows begin in the head, or -1 while it cannot be told yet.
     * The nested marker is tried first; the flat one only wins once enough
     * text arrived to be sure the nested one is not coming.
     */
    private findRowsStart;
    private scanRows;
    private emit;
}
/**
 * Feeds a byte stream to a {@link JsonRowsReader}, decoding as it goes, and
 * returns what the reader finished with.
 */
export declare function readJsonRows(stream: ReadableStream<Uint8Array>, reader: JsonRowsReader): Promise<any>;
/**
 * A response body kept as it arrived, still in bytes, for the caller to decide
 * what to do with it before paying for the objects.
 *
 * @remarks
 * The bytes live in a `Blob`, which the browser keeps outside the JavaScript
 * memory limit (and may page to disk), so a body that would not fit on screen
 * as objects can still arrive whole and be saved as a file.
 */
export type DeferredJsonBody = {
    /** The body as it arrived. */
    blob: Blob;
    /** Its size in bytes. */
    size: number;
    /** Parses it whole, rows included, reading it piece by piece. */
    json(): Promise<any>;
    /**
     * Hands each row of its `data` array to `onRow`, one at a time, without
     * keeping them; resolves to the rest of the JSON (with an empty array where
     * the rows were).
     */
    eachRow(onRow: (row: any) => void): Promise<any>;
    /**
     * Counts the rows of its `data` array without turning them into objects —
     * several times faster than parsing, and with nothing kept.
     */
    countRows(): Promise<number>;
};
export declare function deferredJsonBody(blob: Blob): DeferredJsonBody;
//# sourceMappingURL=jsonRowsReader.d.ts.map
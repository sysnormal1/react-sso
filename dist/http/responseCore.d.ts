/**
 * Parses very large JSON responses that arrive split across multiple buffers.
 *
 * @remarks
 * Some APIs return extremely large JSON payloads that may be received
 * in multiple string chunks (buffers). Attempting to directly concatenate
 * and parse these buffers using `JSON.parse()` can lead to:
 *
 * - excessive memory usage
 * - stack overflow errors
 * - performance issues
 *
 * This helper performs a **partial extraction of the `data` array**
 * while iterating through the buffers, parsing each object individually.
 *
 * The function supports payloads formatted as:
 *
 * ```json
 * {
 *   "data":[{ "DATA":[ {...},{...} ] }]
 * }
 * ```
 *
 * or
 *
 * ```json
 * {
 *   "data":[ {...},{...} ]
 * }
 * ```
 *
 * Instead of parsing the entire structure at once, it:
 *
 * 1. Locates the `data` array in the first buffer.
 * 2. Extracts object fragments across multiple buffers.
 * 3. Parses each object individually.
 * 4. Rebuilds the final JSON structure with the parsed objects.
 *
 * This approach significantly reduces memory pressure when handling
 * very large JSON datasets.
 *
 * @param stringBuffer
 * An array of string fragments representing parts of a JSON response.
 *
 * @returns
 * The reconstructed and parsed JSON object, or `null` if no data
 * was provided.
 *
 * @example
 * ```ts
 * const buffers = [
 *   '{"data":[{"DATA":[{"id":1},{"id":2}',
 *   ',{"id":3},{"id":4}]}]}'
 * ];
 *
 * const result = largeJsonParse(buffers);
 *
 * console.log(result.data);
 * ```
 */
export declare function largeJsonParse(stringBuffer?: any): any;
export declare function responseParser(response?: Response, useLargeJsonParser?: boolean): Promise<any>;
//# sourceMappingURL=responseCore.d.ts.map
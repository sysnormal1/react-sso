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
export declare function largeJsonParse(stringBuffer?: (string | null)[]): any;
export declare function responseParser(response?: Response, useLargeJsonParser?: boolean): Promise<any>;
//# sourceMappingURL=responseCore.d.ts.map
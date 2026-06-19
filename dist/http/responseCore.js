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
export function largeJsonParse(stringBuffer) {
    let result = null;
    if (stringBuffer) {
        console.debug(stringBuffer);
        let strInit = '"data":[{"DATA":[';
        let startInd = stringBuffer[0].indexOf(strInit);
        if (startInd === -1) {
            strInit = '"data":[';
            startInd = stringBuffer[0].indexOf(strInit);
        }
        if (startInd > -1) {
            startInd += strInit.length;
            let endInd = -1;
            let finalInd = -1;
            let previous = null;
            let data = [];
            for (let i = 0; i < stringBuffer.length; i++) {
                if (previous != null) {
                    stringBuffer[i] = previous + stringBuffer[i];
                    previous = null;
                }
                if (i !== 0) {
                    startInd = stringBuffer[i].indexOf("{");
                }
                if (startInd > -1) {
                    endInd = stringBuffer[i].lastIndexOf("}");
                    finalInd = stringBuffer[i].indexOf("]");
                    if (finalInd > -1) {
                        endInd = stringBuffer[i].lastIndexOf("}", finalInd);
                    }
                    if (endInd > -1) {
                        let stringBufferData = stringBuffer[i].slice(startInd + 1, endInd);
                        previous =
                            stringBuffer[i].slice(endInd + 1);
                        let arrayBufferData = stringBufferData.split("},{");
                        for (let j = 0; j < arrayBufferData.length; j++) {
                            data.push(JSON.parse('{' + arrayBufferData[j] + '}'));
                        }
                    }
                    else {
                        previous = stringBuffer[i];
                        stringBuffer[i] = null;
                    }
                }
                else {
                    previous = stringBuffer[i];
                    stringBuffer[i] = null;
                }
                if (i === 0) {
                    stringBuffer[i] =
                        stringBuffer[i].slice(0, startInd) +
                            '"__DATA__"' +
                            (finalInd > -1
                                ? stringBuffer[i].slice(finalInd)
                                : "");
                }
                else {
                    if (finalInd > -1) {
                        stringBuffer[i] =
                            stringBuffer[i].slice(finalInd);
                    }
                    else {
                        stringBuffer[i] = null;
                    }
                }
                if (finalInd > -1)
                    break;
            }
            stringBuffer = stringBuffer.join('');
            result = JSON.parse(stringBuffer);
            if (result.data[0] === "__DATA__") {
                result.data = data;
            }
            else {
                result.data[0].DATA = data;
            }
        }
        else {
            result = JSON.parse(stringBuffer.join(''));
        }
    }
    return result;
}
export async function responseParser(response, useLargeJsonParser = false) {
    //const raw = await response.json();
    let result;
    /**
     * Handle large streaming JSON responses.
     */
    if (typeof response?.body?.getReader == 'function' && useLargeJsonParser === true) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let stringBuffer = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            stringBuffer.push(decoder.decode(value, { stream: true }));
        }
        const totalCharacters = stringBuffer.reduce((acc, str) => acc + str.length, 0);
        if (totalCharacters >= 150000) {
            result = largeJsonParse(stringBuffer);
        }
        else {
            result = JSON.parse(stringBuffer.join(''));
        }
    }
    else {
        result = await response?.json();
    }
    return result;
}

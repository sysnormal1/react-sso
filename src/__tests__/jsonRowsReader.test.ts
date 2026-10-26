// src/__tests__/jsonRowsReader.test.ts

import { JsonRowsReader, deferredJsonBody } from '../http/jsonRowsReader.js';
import { largeJsonParse } from '../http/responseCore.js';
import { fetchCore } from '../http/fetchCore.js';

const rows = [
  { id: 1, name: 'a },{ b', 'x.y': 1.5 },
  { id: 2, name: 'aspas \\" e {chave}', nested: { k: [1, { z: ']' }] } },
  { id: 3, name: null, 'x.y': -2 },
];

const nested = JSON.stringify({ success: true, data: [{ DATA: rows, OTHER: 1 }], message: 'ok' });
const flat = JSON.stringify({ success: true, data: rows });

/** Every way of cutting the text in two, and in pieces of one character. */
function cuts(text: string): string[][] {
  const result: string[][] = [text.split('')];
  for (let i = 0; i <= text.length; i++) {
    result.push([text.slice(0, i), text.slice(i)]);
  }
  return result;
}

function read(pieces: string[], onRow?: (row: any) => void) {
  const reader = new JsonRowsReader(onRow);
  pieces.forEach(piece => reader.push(piece));
  return reader.finish();
}

describe('JsonRowsReader', () => {
  it('lê o formato data[0].DATA cortado em qualquer ponto', () => {
    for (const pieces of cuts(nested)) {
      expect(read(pieces)).toEqual(JSON.parse(nested));
    }
  });

  it('lê o formato data plano cortado em qualquer ponto', () => {
    for (const pieces of cuts(flat)) {
      expect(read(pieces)).toEqual(JSON.parse(flat));
    }
  });

  it('lê JSON sem array data inteiro no fim', () => {
    const text = JSON.stringify({ success: false, message: 'erro', data: null });
    for (const pieces of cuts(text)) {
      expect(read(pieces)).toEqual(JSON.parse(text));
    }
  });

  it('lê array data vazio', () => {
    const text = JSON.stringify({ success: true, data: [{ DATA: [] }] });
    expect(read([text])).toEqual(JSON.parse(text));
  });

  it('com onRow entrega as linhas e não as guarda', () => {
    const seen: any[] = [];
    const reader = new JsonRowsReader(row => seen.push(row));
    reader.push(nested);
    const result = reader.finish();
    expect(seen).toEqual(rows);
    expect(reader.rowCount).toBe(3);
    expect(result.data[0].DATA).toEqual([]);
    expect(result.data[0].OTHER).toBe(1);
  });

  it('recusa array data que não fecha', () => {
    expect(() => read([nested.slice(0, nested.indexOf('"id":3'))])).toThrow(SyntaxError);
  });

  it('largeJsonParse continua aceitando a lista de pedaços', () => {
    expect(largeJsonParse(cuts(nested)[5])).toEqual(JSON.parse(nested));
    expect(largeJsonParse(undefined)).toBeNull();
  });
});

describe('deferredJsonBody', () => {
  it('converte o corpo inteiro ou linha a linha', async () => {
    const body = deferredJsonBody(new Blob([nested]));
    expect(body.size).toBe(new Blob([nested]).size);
    expect(await body.json()).toEqual(JSON.parse(nested));
    const seen: any[] = [];
    const rest = await body.eachRow(row => seen.push(row));
    expect(seen).toEqual(rows);
    expect(rest.success).toBe(true);
    expect(await body.countRows()).toBe(3);
    expect(await deferredJsonBody(new Blob([flat])).countRows()).toBe(3);
    expect(await deferredJsonBody(new Blob(['{"success":false}'])).countRows()).toBe(0);
  });

  it('conta as linhas cortadas em qualquer ponto', () => {
    for (const pieces of cuts(nested)) {
      const reader = new JsonRowsReader(undefined, true);
      pieces.forEach(piece => reader.push(piece));
      const result = reader.finish();
      expect(reader.rowCount).toBe(3);
      expect(result.data[0].DATA).toEqual([]);
    }
  });

  it('acentos cortados entre pedaços de bytes não se perdem', async () => {
    const text = JSON.stringify({ data: [{ nome: 'ação é ótima' }] });
    const bytes = new TextEncoder().encode(text);
    const cut = bytes.indexOf(0xc3) + 1; // no meio do "ç"
    const body = deferredJsonBody(new Blob([bytes.slice(0, cut), bytes.slice(cut)]));
    expect(await body.json()).toEqual(JSON.parse(text));
  });
});

describe('fetchCore com deferJsonParse', () => {
  it('devolve o corpo em bytes quando a resposta é ok', async () => {
    globalThis.fetch = async () => new Response(nested, { status: 200 });
    const result: any = await fetchCore({ url: 'http://test.com/api', deferJsonParse: true });
    expect(result.success).toBe(true);
    expect(typeof result.data.json).toBe('function');
    expect((await result.data.json()).data[0].DATA).toEqual(rows);
  });

  it('lê o erro como sempre', async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'proibido' }), { status: 403 });
    const result: any = await fetchCore({ url: 'http://test.com/api', deferJsonParse: true });
    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
    expect(result.message).toBe('proibido');
  });

  it('o leitor grande lê a resposta em fluxo', async () => {
    globalThis.fetch = async () => new Response(nested, { status: 200 });
    const result: any = await fetchCore({ url: 'http://test.com/api', useLargeJsonParser: true });
    expect(result.data).toEqual(JSON.parse(nested));
  });
});

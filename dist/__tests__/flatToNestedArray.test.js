// src/__tests__/flatToNestedArray.test.ts
import { flatToNestedArray } from '../utils/flatToNestedArray.js';
const flat = [
    { id: 1, parentId: null, name: 'Root A' },
    { id: 2, parentId: null, name: 'Root B' },
    { id: 3, parentId: 1, name: 'Child A1' },
    { id: 4, parentId: 1, name: 'Child A2' },
    { id: 5, parentId: 3, name: 'Grandchild A1-1' },
];
describe('flatToNestedArray', () => {
    it('deve retornar array vazio para entrada vazia', () => {
        expect(flatToNestedArray([])).toEqual([]);
    });
    it('deve retornar os itens raiz corretamente', () => {
        const result = flatToNestedArray(flat, 'id', 'parentId');
        expect(result).toHaveLength(2);
        expect(result.map(r => r.name)).toEqual(['Root A', 'Root B']);
    });
    it('deve aninhar filhos corretamente', () => {
        const result = flatToNestedArray(flat, 'id', 'parentId');
        const rootA = result.find(r => r.id === 1);
        expect(rootA?.children).toHaveLength(2);
        expect(rootA?.children?.map(c => c.id)).toEqual([3, 4]);
    });
    it('deve aninhar netos corretamente', () => {
        const result = flatToNestedArray(flat, 'id', 'parentId');
        const rootA = result.find(r => r.id === 1);
        const childA1 = rootA?.children?.find(c => c.id === 3);
        expect(childA1?.children).toHaveLength(1);
        expect(childA1?.children?.[0].id).toBe(5);
    });
    it('deve usar id e parentId como chaves padrão', () => {
        const result = flatToNestedArray(flat);
        expect(result).toHaveLength(2);
    });
});

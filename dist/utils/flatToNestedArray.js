// src/utils/flatToNestedArray.ts
export function flatToNestedArray(input, idKey = 'id', parentIdKey = 'parentId') {
    if (!input?.length)
        return [];
    const map = {};
    for (const item of input) {
        map[item[idKey]] = { ...item };
    }
    const roots = [];
    for (const key in map) {
        const item = map[key];
        const parentId = item[parentIdKey];
        if (parentId && map[parentId]) {
            map[parentId].children = map[parentId].children ?? [];
            map[parentId].children.push(item);
        }
        else {
            roots.push(item);
        }
    }
    return roots;
}

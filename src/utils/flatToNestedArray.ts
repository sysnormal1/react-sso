// src/utils/flatToNestedArray.ts

export type NestedItem<T> = T & { children?: NestedItem<T>[] };

export function flatToNestedArray<T extends Record<string, any>>(
  input: T[],
  idKey: keyof T = 'id' as keyof T,
  parentIdKey: keyof T = 'parentId' as keyof T
): NestedItem<T>[] {
  if (!input?.length) return [];

  const map: Record<string, NestedItem<T>> = {};

  for (const item of input) {
    map[item[idKey]] = { ...item };
  }

  const roots: NestedItem<T>[] = [];

  for (const key in map) {
    const item = map[key];
    const parentId = item[parentIdKey];

    if (parentId && map[parentId]) {
      map[parentId].children = map[parentId].children ?? [];
      map[parentId].children!.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}
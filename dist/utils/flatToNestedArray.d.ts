export type NestedItem<T> = T & {
    children?: NestedItem<T>[];
};
export declare function flatToNestedArray<T extends Record<string, any>>(input: T[], idKey?: keyof T, parentIdKey?: keyof T): NestedItem<T>[];
//# sourceMappingURL=flatToNestedArray.d.ts.map
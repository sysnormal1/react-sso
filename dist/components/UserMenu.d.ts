export type UserMenuProps<TAgent = unknown> = {
    getDisplayName?: (agent: TAgent | null) => string;
    logoutLabel?: string;
};
export declare function UserMenu<TAgent extends {
    email?: string;
    identifier?: string;
} = any>({ getDisplayName, logoutLabel, }: UserMenuProps<TAgent>): import("react").JSX.Element | null;
//# sourceMappingURL=UserMenu.d.ts.map
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/UserMenu.tsx (na lib react-sso)
import { useState, useCallback } from 'react';
import { Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext.js';
export function UserMenu({ getDisplayName, logoutLabel = 'Sair', }) {
    const { agent, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const displayName = getDisplayName
        ? getDisplayName(agent)
        : (agent?.email ?? agent?.identifier ?? 'User');
    const initial = displayName.charAt(0).toUpperCase();
    const handleLogout = useCallback(() => {
        setAnchorEl(null);
        logout();
    }, [logout]);
    if (!agent)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: displayName, children: _jsx(Avatar, { sx: { width: 32, height: 32, cursor: 'pointer', fontSize: 14 }, onClick: e => setAnchorEl(e.currentTarget), children: initial }) }), _jsx(Menu, { anchorEl: anchorEl, anchorOrigin: { vertical: 'top', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, open: Boolean(anchorEl), onClose: () => setAnchorEl(null), children: _jsx(MenuItem, { onClick: handleLogout, children: logoutLabel }) })] }));
}

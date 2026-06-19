// src/components/UserMenu.tsx (na lib react-sso)
import { useState, useCallback } from 'react';
import { Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext.js';

export type UserMenuProps<TAgent = unknown> = {
  getDisplayName?: (agent: TAgent | null) => string;
  logoutLabel?: string;
};

export function UserMenu<TAgent extends { email?: string; identifier?: string } = any>({
  getDisplayName,
  logoutLabel = 'Sair',
}: UserMenuProps<TAgent>) {
  const { agent, logout } = useAuth<TAgent>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const displayName = getDisplayName
    ? getDisplayName(agent)
    : (agent?.email ?? agent?.identifier ?? 'User');

  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = useCallback(() => {
    setAnchorEl(null);
    logout();
  }, [logout]);

  if (!agent) return null;

  return (
    <>
      <Tooltip title={displayName}>
        <Avatar
          sx={{ width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          {initial}
        </Avatar>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleLogout}>{logoutLabel}</MenuItem>
      </Menu>
    </>
  );
}
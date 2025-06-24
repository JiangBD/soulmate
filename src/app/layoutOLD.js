// src/app/layout.js
'use client';

import { useState, Suspense } from 'react';
import {
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BottomNav from '@/components/BottomNav';
import { SocketProvider } from '@/context/SocketContext';
import { AppBarBottomNavContext } from '@/context/AppBarBottomNavContext';
export default function RootLayout({ children }) {
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [appBarVisible, setAppBarVisible] = useState(true);


  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState([]);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    const token = window.localStorage.getItem('soulmate_token');
    if (token) {
      await fetch('/api/logout', { method: 'POST', body: JSON.stringify({ token }) });
      window.localStorage.removeItem('soulmate_token');
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body>
        <AppBarBottomNavContext.Provider
            value={{ bottomNavVisible, setBottomNavVisible, appBarVisible, setAppBarVisible }} >
        <Suspense fallback={<div>Đang tải…</div>}>
          <CssBaseline />

          {/* AppBar */}
          { appBarVisible &&
          <AppBar position="static" color="default" elevation={1}>
            <Container maxWidth="sm">
              <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
                <Box display="flex" alignItems="center">
                  <img
                    src="/soulmate_logo.png"
                    alt="Soulmate Logo"
                    style={{ height: 50, width: 50, marginRight: 8 }}
                  />
                </Box>
                <Box>
                  <IconButton color="inherit" onClick={openMenu}>
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <IconButton color="inherit" onClick={handleLogout}>
                    <PowerSettingsNewIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <MenuItem key={idx} onClick={closeMenu}>
                          {notif.text}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem onClick={closeMenu}>
                        Bạn không có thông báo nào.
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              </Toolbar>
            </Container>
          </AppBar> }

          {/* Wrap the rest of the app in SocketProvider */}
          <SocketProvider>
            <Container maxWidth="sm">
              <Box minHeight="100vh" pb={8}>
                {children}
              </Box>
              { bottomNavVisible && <BottomNav /> }
            </Container>
          </SocketProvider>
        </Suspense>
        </AppBarBottomNavContext.Provider>
      </body>
    </html>
  );
}


// src/app/layout.js
'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import {
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Typography,
} from '@mui/material';
import Loading from './loading';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BottomNav from '@/components/BottomNav';
import { io } from 'socket.io-client';
import { AppBarBottomNavContext } from '@/context/AppBarBottomNavContext';
export default function RootLayout({ children }) {
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [appBarVisible, setAppBarVisible] = useState(true);

  // notifications array: { type: 'message'|'match', from?, withUser?, text?, timestamp? }
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const socketRef = useRef(null);
  const [rootLayoutToken, setRootLayoutToken] = useState (null);
  useEffect(() => {
    const token = window.localStorage.getItem('soulmate_token');
    if (!token) return;

    // 1) connect
    const socket = io('http://localhost:4000');

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('login', token);
    });

    // 2) listen for new incoming message notifications
    socket.on('chatMessage', (msg) => {
      // Only show a notification if this tab/appBar is not already in the same chat (optional)
      setNotifications((prev) => [
        ...prev,
        { type: 'message', from: msg.sender, text: msg.content, timestamp: msg.timestamp },
      ]);
    });

    // 3) listen for new-match events
    socket.on('new-match', (data) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'match', withUser: null, timestamp: null },
      ]);
    });

    // 4) handle login errors
    socket.on('loginError', (msg) => {
      console.error('Socket loginError:', msg);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [rootLayoutToken]);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    const token = window.localStorage.getItem('soulmate_token');
    if (token) {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      window.localStorage.removeItem('soulmate_token');
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body>
        <AppBarBottomNavContext.Provider
            value={{ bottomNavVisible, setBottomNavVisible, appBarVisible, setAppBarVisible, setRootLayoutToken }}>
        <Suspense fallback={<Loading />}>
          <CssBaseline />

          {/* AppBar */}
          {appBarVisible && (
            <AppBar position="static" color="default" elevation={1}>
              <Container maxWidth="sm">
                <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
                  <Box display="flex" alignItems="center">
                    <img
                      src="/soulmate_logo.png"
                      alt="Soulmate Logo"
                      style={{ height: 50, width: 50, marginRight: 8 }}
                    />
                    {/*<Typography variant="h6" color="inherit">
                      Soulmate
                    </Typography> */}
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
                          <MenuItem
                            key={idx}
                            onClick={() => {
                              // e.g. if notif.type==='match' → router.push('/matches')
                              // or notif.type==='message' → router.push('/chat?peer='+notif.from)
                              setNotifications((prev) => prev.filter((_, i) => i !== idx));
                              closeMenu();
                            }}
                          >
                            {notif.type === 'match'
                              ? `Xin chúc mừng! Bạn có 1 tương hợp mới!`
                              : `Tin nhắn mới từ ${notif.from}`}
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
            </AppBar>
          )}

          {/* Content */}
          <Container maxWidth="sm">
            <Box minHeight="100vh" pb={8}>
              {children}
            </Box>
            {bottomNavVisible && <BottomNav />}
          </Container>
        </Suspense>
        </AppBarBottomNavContext.Provider>
      </body>
    </html>
  );
}

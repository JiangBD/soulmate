// /src/app/page.js
'use client';
import { useAppBarBottomNavContext } from '@/context/AppBarBottomNavContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function HomePage() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(true);
  const [userId, setUserId] = useState('');
  const { bottomNavVisible, setBottomNavVisible, appBarVisible, setAppBarVisible } = useAppBarBottomNavContext();

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};
  useEffect(() => {
    const tokenCookie = getCookie('token');
    if (tokenCookie) {
    const token = tokenCookie;
    if (token) window.localStorage.setItem('soulmate_token', token);    
    }

    const token = window.localStorage.getItem('soulmate_token');
    if (token) {
      router.push('/app/recs');
    } else {
      setCheckingToken(false);
    }
    setBottomNavVisible(false);
    setAppBarVisible(false);
    return () => {
      setBottomNavVisible(true);
      setAppBarVisible(true);
    };
  }, [router]);
///------ FIX THIS, HIDE THE EMAIL, EXTRACT FROM COOKIE INSTEAD-----------------------------------------

///------ FIX THIS, HIDE THE EMAIL, EXTRACT FROM COOKIE INSTEAD-----------------------------------------
  if (checkingToken) {
    return <p>Chờ chút...</p>;
  }

  const handleEmailLogin = async () => {
    if (!userId) {
      alert('Xin nhập tên đăng nhập');
      return;
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        window.localStorage.setItem('soulmate_token', data.token);
        router.push('/app/recs');
      } else {
        alert(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      alert('Lỗi khi kết nối server');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the Google OAuth initiation endpoint
    window.location.href = '/api/auth/google';
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url(/homescreen.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 2
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          pb: 4
        }}
      >
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          sx={{ textTransform: 'none' }}
          onClick={handleGoogleLogin}
        >
          Đăng nhập với Google
        </Button>

        <TextField
          label="Tên đăng nhập"
          variant="outlined"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleEmailLogin}
        >
          Đăng nhập
        </Button>
      </Box>
    </Box>
  );
}


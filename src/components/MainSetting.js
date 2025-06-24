'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Stack, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function MainSetting({ moveToSettingScreen }) {
  const items = [
    { label: 'Upload hình ảnh',          screenIndex: 1 },
    { label: 'Xu hướng hẹn hò của bạn',  screenIndex: 2 },
    { label: 'Quan điểm của bạn',        screenIndex: 3 }];

  const router = useRouter();
  const [pageLoadingStatus, setPageLoadingStatus] = useState("loading"); // loading | ready


  useEffect(() => {    
    const token = typeof window !== 'undefined'
    ? localStorage.getItem('soulmate_token')
    : null;        
    if (!token) { router.push('/'); return; } // redirect to login if no token   
    setPageLoadingStatus("ready");
    

  }, []);

  if (pageLoadingStatus !== 'ready') return <h1>Loading...</h1>;
  else
  return (
    <Box
      sx={{
        height: '100vh',
        overflowY: 'auto',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Stack spacing={2}>
        {items.map(({ label, screenIndex }) => (
          <Paper
            key={screenIndex}
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#FF5864',     // Tinder‑style peach‑pink
            }}
          >
            <ListItemButton
              onClick={() => moveToSettingScreen(screenIndex)}
              sx={{
                height: 80,
                px: 3,
                '& .MuiTypography-root': {
                  color: '#ffffff',     // white text
                },
              }}
            >
              <ListItemText
                primary={
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
                    color: '#ffffff'
                }}
                >
      {label}
    </Typography>
  }
/>
            </ListItemButton>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

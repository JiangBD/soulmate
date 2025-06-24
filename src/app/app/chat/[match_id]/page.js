// src/app/app/chat/[match_id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import ChatClient from '@/components/ChatClient';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams(); 
  const rawMatchId = params.match_id;
  const [status, setStatus] = useState('loading'); 
  const [partner, setPartner] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!rawMatchId) {
      router.push('/app/mymatches');
      return;
    }
    const match_id = decodeURIComponent(rawMatchId);

    const token = window.localStorage.getItem('soulmate_token');
    if (!token) {
      router.push('/');
      return;
    }

    let decoded;
    try {
      decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.user_id);
    } catch {
      router.push('/');
      return;
    }

    fetch(`/api/chat/${encodeURIComponent(match_id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Cannot open chat');
        return res.json();
      })
      .then((data) => {
        setPartner(data.partner);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [rawMatchId, router]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography>Đang tải cuộc trò chuyện…</Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6">Không thể mở cuộc trò chuyện này.</Typography>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', mt: 1 }}
          onClick={() => router.push('/app/mymatches')}
        >
          Quay lại danh sách bạn bè.
        </Typography>
      </Box>
    );
  }

  // status === 'ready'
  return <ChatClient userId={userId} partnerId={partner} />;
}

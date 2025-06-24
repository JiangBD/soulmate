// src/app/app/mymatches/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import Link from 'next/link';

export default function MyMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem('soulmate_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/mymatches', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load matches');
        return res.json();
      })
      .then((data) => {
        setMatches(data.matches || []);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  if (matches === null) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography>Đang tải danh sách kết đôi…</Typography>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography>Chưa có ai khớp đôi với bạn.</Typography>
      </Box>
    );
  }

  return (
    <Box p={2} maxWidth={600} mx="auto">
      <Typography variant="h5" gutterBottom>
        Những người bạn đã khớp đôi
      </Typography>
      <List>
        {matches.map(({ match_id, partner_name }) => (
          <Link
            key={match_id}
            href={`/app/chat/${encodeURIComponent(match_id)}`}
            passHref
          >
            <ListItem button = "true">
              <ListItemText primary={partner_name} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}

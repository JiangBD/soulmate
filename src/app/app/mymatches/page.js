// src/app/app/mymatches/page.js
'use client';
import { io } from "socket.io-client";
import  Loading   from '@/app/loading';
import { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export default function MyMatchesPage() {

  const router = useRouter();

  const [matches, setMatches] = useState(null); // initially null until we fetch

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
        router.push('/'); // invalid token or error → send back home
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
        { /*  <Typography>Đang tải danh sách kết đôi…</Typography> */ }
        <Loading />
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
        {matches.map((match) => {
          // Decode the current user's ID from the JWT payload
          const tokenPayload = JSON.parse(
            atob(window.localStorage.getItem('soulmate_token').split('.')[1])
          );
          const user_id = tokenPayload.user_id;
          // Split match_id into two user IDs, then pick the “other” one
 //         const [a, b] = mid.split('_');
          let partner_id = null; // *****************************************
          const partnerIdWith_ = match.match_id.replace(user_id, '')
          if (partnerIdWith_.startsWith('_')) partner_id = partnerIdWith_.substring(1); // Remove leading underscore
          else partner_id = partnerIdWith_.substring(0,partnerIdWith_.length - 1); // No trailing underscore
      // *****************************************

          // Build the avatar URL: public/upload/[partner]/avatar.jpg → served at /upload/[partner]/avatar.jpg
          const avatarUrl = `/uploads/${partner_id}/avatar.jpg`;

          return (
            <Link key={match.match_id} href={`/app/chat/${encodeURIComponent(match.match_id)}`} passHref sx={{ textDecoration: 'none' }}>
              <ListItem button="true">
                {/* Show the round avatar */}
                <ListItemAvatar>
                  <Avatar
                    src={avatarUrl}
                    alt={`Avatar of ${partner_id}`}
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>

                {/* Show the partner’s email (or any identifier you store in match_id) */}
                <ListItemText primary={match.partner_name} 
                sx={{ ml: 1, '& .MuiListItemText-primary': { textDecoration: 'none', color: 'inherit', cursor: 'default' } }} 
                secondary={
                  <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontWeight: match.lastMsg.seen ? "regular" : "bold" }}
                  >
                    {match.lastMsg.content}
                  </Typography>
                  {/*" — "  you can use • or any separator */}
            </>
                }               
                />
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Box>
  );
}

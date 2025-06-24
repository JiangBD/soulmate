// File: src/app/app/recs/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MatchCard from '@/components/MatchCard';
import  Loading   from '@/app/loading';

export default function RecommendationsPage() {
  const router = useRouter();

  // 'checkingToken' | 'requestingPerm' | 'denied' | 'sendingLoc' | 'fetchingRec' | 'ready' | 'end'
  const [status, setStatus] = useState('checkingToken');

  // This will hold exactly ONE profile object or null
  const [currentProfile, setCurrentProfile] = useState(null);

  // 1) Helper: fetch one profile from /api/recs
  const fetchNextProfile = async (token) => {
    setStatus('fetchingRec');
    try {
      const recResp = await fetch('/api/recs', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await recResp.json();

      if (!recResp.ok) {
        console.error('[Recs] app/api/recs line 30 error:', data.error);
        // If unauthorized or any error, treat as “no more”
        setStatus('end');
        return;
      }

      //  If the server sends { end: true }, we are done
      if (data.end) {
        setStatus('end');
        console.log('[Recs] recs/page.js line 38 No more profiles available.');
        return;
      }

      // Otherwise, server sends back { profile: { ... } }
      if (data.profile) {
        setCurrentProfile(data.profile);
        setStatus('ready');
      } else {
        // Something unexpected
        console.error('[Recs] Unexpected response format:', data);
        setStatus('end');
      }
    } catch (err) {
      console.error('[Recs] Failed to fetch next profile:', err);
      setStatus('end');
    }
  };

  // 2) On mount: check token → ask location → update location → fetch first rec
  useEffect(() => {

    const token = window.localStorage.getItem('soulmate_token');
    if (!token) {
      router.push('/');
      return;
    }
    setStatus('requestingPerm');

    if (!navigator || !('geolocation' in navigator)) {
      setStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('sendingLoc');
        const { latitude, longitude } = pos.coords;

        fetch('/api/updatelocation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              console.error('[Recs] /api/updatelocation status:', res.status);
              throw new Error('Cannot update location,line 90 recs/page.js');
            }
            // After location is updated, fetch the very first profile
            await fetchNextProfile(token);
          })
          .catch((err) => {
            console.error('[Recs] app/recs/page.js line 96 Error updating location:', err);
            setStatus('denied');
          });
      },
      (err) => {
        console.error('[Recs] app/recs/page.js line 101 Geolocation error:', err);
        
        setStatus('denied');
      },
      { enableHighAccuracy: true }
    );
  }, [router]);

  // 3) Handler for “Skip”: simply call fetchNextProfile again
  const handleSkip = () => {
    const token = window.localStorage.getItem('soulmate_token');
    if (!token) return;
    fetchNextProfile(token);
  };

  // 4) Handler for “Like”: send to /api/prematch, then fetchNextProfile
  const handleLike = async (likedUserId) => {
    const token = window.localStorage.getItem('soulmate_token');
    if (!token) return;

    try {
      await fetch('/api/prematch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, likedUserId }),
      });
    } catch (err) {
      console.error('[Recs] app/recs/page.js line 125 Failed to call /api/prematch:', err);
      // We’ll still advance to next profile even if prematch fails
    }
    fetchNextProfile(token);
  };

  // 5) Render logic:

  // If user denied / geolocation missing
  if (status === 'denied') {
    return (
      <Container
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GpsFixedIcon sx={{ fontSize: 80, color: 'gray' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Ứng dụng cần được cấp quyền vị trí.
        </Typography>
      </Container>
    );
  }

  // While any of these loading states
  if (['checkingToken', 'requestingPerm', 'sendingLoc', 'fetchingRec'].includes(status)) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        { /* <Typography>Đang tải…</Typography> */}
        <Loading />
      </Box>
    );
  }

  // If server said “end” (no more profiles)
  if (status === 'end') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6">Bạn đã xem hết tất cả hồ sơ rồi!</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Hãy quay lại sau để xem thêm.
        </Typography>
      </Box>
    );
  }

  // If we have a valid profile from the server, show MatchCard
  if (status === 'ready' && currentProfile) {
    return (
      <Container sx={{ pt: 2 }}>
        <MatchCard
          profile={currentProfile}
          onLike={() => handleLike(currentProfile.user_id)}
          onSkip={handleSkip}
        />
      </Container>
    );
  }

  // (Fallback – should not hit if all states covered)
  return null;
}


// src/components/SignupStep4.js
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Avatar
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useSignupInfo } from '@/context/SignupInfoContext';
import { useRouter } from 'next/navigation';
import { useAppBarBottomNavContext } from '@/context/AppBarBottomNavContext';
export default function SignupStep4({ onFinish }) {
  const { signupInfo } = useSignupInfo();
  const router = useRouter();
  const { setRootLayoutToken } = useAppBarBottomNavContext(); 
  const [photos, setPhotos] = useState([]); // { file: File, preview: string }[]

  const handleFileAdded = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Chỉ cho phép JPEG/PNG.');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Dung lượng tối đa 2.5 MB.');
      return;
    }
    setPhotos((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file) }
    ]);
  };

  const handleRemove = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitAll = async () => {
  const fd = new FormData();

  // 1) Basic info
  fd.append('user_id', signupInfo.user_id);
  fd.append('full_name', signupInfo.full_name);
  fd.append('birthdate', JSON.stringify(signupInfo.birthdate));
  fd.append('gender', signupInfo.gender);
  fd.append('marital_status', signupInfo.marital_status);
  fd.append('self_intro', signupInfo.self_intro);

  // 2) Viewpoints
  fd.append('viewpoints', JSON.stringify(signupInfo.viewpoints));

  // 3) Dating preference
  const pref = signupInfo.dating_preference;
  if (pref) {
    if (pref.min_age != null && pref.max_age != null) {
      fd.append('age_range', `${pref.min_age} - ${pref.max_age}`);
    }
    if (pref.target_gender) {
      fd.append('gender_preference', pref.target_gender);  // ✅ correct name/value
    }
    if (pref.target_marital_status) {
      fd.append('marital_status_preference', pref.target_marital_status);  // ✅ correct name/value
    }
  }

  // 4) Photos
  photos.forEach(({ file }) => {
    fd.append('photos', file);
  });

  // 5) Send request
  const res = await fetch('/api/signup', {
    method: 'POST',
    body: fd
  });

  if (res.ok) {
    const data = await res.json();
    const token = data.token;
    if (token) {
      localStorage.setItem('soulmate_token', token);
      alert('Đăng ký thành công');
      if (typeof window !== 'undefined') {
 
      setRootLayoutToken(token);  
      const origin = (window.location.origin); 
      router.push(`${origin}/app/settings`);
    }
    } else {
      alert('Đăng ký thành công, nhưng không có token!');
    }

    photos.forEach(({ preview }) => {
      URL.revokeObjectURL(preview);
    });

    onFinish?.();
  } else {
    const { error } = await res.json();
    alert('Signup thất bại: ' + error);
  }
};

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Upload ảnh của bạn
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns="repeat(3,1fr)"
        gap={2}
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              border: photos[idx] ? 'none' : '1px dashed grey',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {photos[idx] ? (
              <>
                <Avatar
                  src={photos[idx].preview}
                  variant="rounded"
                  sx={{ width: '100%', height: '100%' }}
                />
                <Box
                  component="span"
                  onClick={() => handleRemove(idx)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    cursor: 'pointer',
                    color: 'grey.600',
                    fontWeight: 'bold',
                    fontSize: 16,
                    '&:hover': { color: 'error.main' }
                  }}
                >
                  ×
                </Box>
              </>
            ) : (
              <IconButton
                component="label"
                sx={{ width: '100%', height: '100%' }}
              >
                <AddPhotoAlternateIcon fontSize="large" />
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png"
                  onChange={handleFileAdded}
                />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleSubmitAll}
        disabled={photos.length === 0}
      >
        Hoàn tất đăng ký
      </Button>
    </Box>
  );
}


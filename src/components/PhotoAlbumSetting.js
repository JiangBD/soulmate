// src/components/PhotoAlbumSetting.js
'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Button,
  Typography
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function PhotoAlbumSetting({ backToMainSetting }) {
  const [photos, setPhotos] = useState([]); 
  // grab token once
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('soulmate_token')
    : null;

  // ——— 1) LOAD EXISTING PHOTOS ———
  useEffect(() => {
    if (!token) return; // redirect if no token

    const apiUrl = '/api/uploadphoto';
    const headers = { Authorization: `Bearer ${token}` };
    fetch(apiUrl, { method: 'GET', headers })
      .then(res => {
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // server should return { photos: [ { filename, url }, ... ] }
        const existing = Array.isArray(data.photos) ? data.photos : [];
        setPhotos(existing);
      })
      .catch(err => {
        console.error('Error loading photos:', err);
      });
  }, [token]);

  // ——— 2) UPLOAD A NEW PHOTO ———
  async function handleFileAdded(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // simple client‐side checks
    if (!['image/jpeg','image/png'].includes(file.type)) {
      alert('Chỉ cho phép JPEG/PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng tối đa 5MB.');
      return;
    }

    const apiUrl = '/api/uploadphoto';
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const result = await res.json();
      // result should be { filename, url }
      setPhotos(prev => [...prev, { filename: result.filename, url: result.url }]);
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert(err.message || 'Lỗi khi upload ảnh.');
    }
  }

  // ——— 3) DELETE A PHOTO ———
  async function handleRemove(idx) {
    const target = photos[idx];
    if (!target?.filename) return;
    if (!confirm('Xác nhận xóa ảnh này?')) return;

    const params = new URLSearchParams({ filename: target.filename });
    const apiUrl = `/api/uploadphoto?${params.toString()}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(apiUrl, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setPhotos(prev => prev.filter((_, i) => i !== idx));
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert(err.message || 'Lỗi khi xóa ảnh.');
    }
  }

  // ——— RENDER 3×3 GRID + “Hoàn tất” BUTTON ———
  const slots = Array.from({ length: 9 });

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Bộ sưu tập ảnh của bạn
      </Typography>

      <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={2}>
        {slots.map((_, idx) => {
          const photo = photos[idx];
          const isEmpty = !photo;
          return (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1',
                border: isEmpty ? '1px dashed grey' : 'none',
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isEmpty ? (
                <IconButton component="label" sx={{ width: '100%', height: '100%' }}>
                  <AddPhotoAlternateIcon fontSize="large" />
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png"
                    onChange={handleFileAdded}
                  />
                </IconButton>
              ) : (
                <>
                  <Avatar
                    src={photo.url}
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
              )}
            </Box>
          );
        })}
      </Box>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => backToMainSetting()}
      >
        Hoàn tất
      </Button>
    </Box>
  );
}

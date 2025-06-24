// src/components/MatchCard.js
'use client';
import { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
  Stack,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';

// profile: { user_id, full_name, age, self_intro, viewpoints: [], photos: [] }
// onLike(profile.user_id): callback when ❤️ clicked
// onSkip(): callback when ✖️ clicked

export default function MatchCard({ profile, onLike, onSkip }) {
  const { user_id, full_name, age, self_intro, viewpoints, photos } = profile;
  const [photoIndex, setPhotoIndex] = useState(0);

  const showPrevPhoto = () => {
    setPhotoIndex((pi) => (pi === 0 ? photos.length - 1 : pi - 1));
  };

  const showNextPhoto = () => {
    setPhotoIndex((pi) => (pi === photos.length - 1 ? 0 : pi + 1));
  };

const openPersonalViewpointsPoster = () => {
  const newWindow = window.open();
  if (!newWindow) return;

  // 1) Build the <head> contents
  const headHTML = `
    <meta charset="UTF-8" />
    <title>${full_name}</title>
    <style>
      /* Ensure the container is centered and narrow */
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fafafa;
        padding: 16px;
        font-family: sans-serif;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #444;
      }
      .name-age {
        font-size: 1.4rem;
        font-weight: bold;
      }
      .viewpoint {
        max-width: 75%;
        margin: 12px 0;
        padding: 12px 16px;
        border-radius: 12px;
        position: relative;
        word-break: break-word;
        font-size: 1rem;
        line-height: 1.4;
      }
      .left {
        background-color: #e0f7fa;
        margin-right: auto;
        text-align: left;
      }
      .left::after {
        content: '';
        position: absolute;
        top: 12px;
        left: -12px;
        border: 6px solid transparent;
        border-right-color: #e0f7fa;
      }
      .right {
        background-color: #ffe0b2;
        margin-left: auto;
        text-align: right;
      }
      .right::after {
        content: '';
        position: absolute;
        top: 12px;
        right: -12px;
        border: 6px solid transparent;
        border-left-color: #ffe0b2;
      }
    </style>
  `;

  // 2) Build the <body> contents inside a .container
  const bodyHTML = `
    <div class="container">
      <div class="top-bar">
        <img
          src="${photos[0]?.url || '/default-avatar.png'}"
          alt="${full_name}"
          class="avatar"
        />
        <div class="name-age">${full_name}, ${age}</div>
      </div>
      ${viewpoints
        .map((vp, idx) => {
          const text = typeof vp === 'string' ? vp : JSON.stringify(vp);
          const side = idx % 2 === 0 ? 'left' : 'right';
          return `<div class="viewpoint ${side}">${text}</div>`;
        })
        .join('')}
    </div>
  `;

  // 3) Inject head and body into the new window
  newWindow.document.head.innerHTML = headHTML;
  newWindow.document.body.innerHTML = bodyHTML;
};

  const handleLike = () => {
    onLike(user_id);
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Card
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {photos.length > 0 && (
          <CardMedia
            component="img"
            image={photos[photoIndex]?.url}
            alt={`${full_name} photo ${photoIndex + 1}`}
            sx={{
              height: 300,
              objectFit: 'cover',
              objectPosition: 'center',
              backgroundColor: '#f5f5f5',
            }}
          />
        )}

        {photos.length > 1 && (
          <>
            <IconButton
              onClick={showPrevPhoto}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
                width: 36,
                height: 64,
                borderRadius: 2,
                fontSize: '1.5rem',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
            >
              ‹
            </IconButton>

            <IconButton
              onClick={showNextPhoto}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
                width: 36,
                height: 64,
                borderRadius: 2,
                fontSize: '1.5rem',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
            >
              ›
            </IconButton>
          </>
        )}
      </Box>

      {photos.length > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 1, mb: 1 }}
        >
          {photos.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: idx === photoIndex ? 'primary.main' : 'grey.400',
              }}
            />
          ))}
        </Stack>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {full_name}, {age}
          </Typography>
          <IconButton onClick={openPersonalViewpointsPoster} size="small" sx={{ ml: 1 }}>
            <span role="img" aria-label="view">📜</span>
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {self_intro}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-around', mb: 1 }}>
        <IconButton color="error" onClick={handleSkip}>
          <CloseIcon fontSize="large" />
        </IconButton>
        <IconButton color="success" onClick={handleLike}>
          <FavoriteIcon fontSize="large" />
        </IconButton>
      </CardActions>
    </Card>
  );
}


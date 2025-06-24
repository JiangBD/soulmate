'use client';

import { Box } from '@mui/material';
import Image from 'next/image';

export default function Loading() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300, // high enough to cover everything (same as MUI modals)
      }}
    >
      <Image
        src="/mywaitingscreen.gif"
        alt="Đang tải..." // Vietnamese: Loading...
        width={300} // Adjust size as needed
        height={300}
        unoptimized
        style={{ maxWidth: '100%', height: '100' }} /*'auto'*/
        priority
      />
    </Box>
  );
}
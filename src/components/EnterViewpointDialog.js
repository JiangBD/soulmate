'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, Box, TextField, Button
} from '@mui/material';

export default function EnterCommentDialog({
  dialogOpen,
  topic,
  onDialogClose,
  onSubmitComment
}) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (dialogOpen) setComment('');
  }, [dialogOpen]);

  const handleOk = () => {
    if (comment.trim()){   onSubmitComment(topic, comment.trim());  }
    else onSubmitComment(topic, '');
  };
  return (
    <Dialog open={dialogOpen} onClose={onDialogClose}>
      <DialogTitle>Bình luận về: {topic}</DialogTitle>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder={`Viết bình luận của bạn về ${topic}. Thích thì để trống cũng được.`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="contained" onClick={handleOk}>OK</Button>
      </Box>
    </Dialog>
  );
}

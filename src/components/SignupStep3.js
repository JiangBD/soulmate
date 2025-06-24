// src/components/SignupStep3.js
'use client';
import { useState } from 'react';
import {  Box, Typography, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSignupInfo } from '@/context/SignupInfoContext';
import PickInterestedTopicDialog from './PickInterestedTopicDialog';
import EnterCommentDialog from './EnterViewpointDialog';

export default function SignupStep3({ onNext }) {
  const { updateSignupInfo } = useSignupInfo();

  const [viewpoints, setViewpoints] = useState([
    'Jisoo: chị ấy vừa hát hay, vũ đạo đỉnh mà còn khéo chém zombie nữa!',
    'Donald Trump: Giảm thuế xíu xíu đi cha nọi!!!',
    'Dune: The Mahdi is too humble to say He is the Mahdi... Even more reason to know He is.',
    'Isaac Newton: He’s truely a genius. Long live the Fundamental Theorem of Calculus',
    'Harry Potter: Mình cần mua một chiếc đũa mới, để ăn cơm...',
    'TikTok: Thiệc là một kênh tuyệt vời, tràn ngập thông tin bổ ích!!!',
    'Bánh xèo: xèo đê bà con....',
    'BTS: Các ộppa hãy sớm đến Việt Nam lưu diễn nhé...'
  ]);
  const MAX_VIEWPOINTS = 20;
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleAddClick = () => setTopicDialogOpen(true);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setTopicDialogOpen(false);
    setCommentDialogOpen(true);
  };

  const handleCommentSubmit = (topic, comment) => {
    setViewpoints([...viewpoints, `${topic}: ${comment}`]);
    setCommentDialogOpen(false);
  };

  const handleNext = () => {
    updateSignupInfo({ viewpoints });
    onNext();
  };

  return (
    <Box p={2} display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Typography variant="h5" gutterBottom>Các quan điểm của tôi</Typography>

      <Box flexGrow={1} overflow="auto" width="100%" maxWidth="400px">
        {viewpoints.map((text, index) => (
  <Box key={index} mb={3} position="relative">
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
      {/* Close icon */}
      <Box
        component="span"
        onClick={() => {
          const newViewpoints = viewpoints.filter((_, i) => i !== index);
          setViewpoints(newViewpoints);
        }}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'pointer',
          color: 'grey.600',
          fontWeight: 'bold',
          fontSize: 16,
          '&:hover': { color: 'error.main' }
        }}
      >
        X
      </Box>
      {text}
    </Paper>

    {/* Speech bubble triangle */}
    <Box
      sx={{
        position: 'absolute',
        bottom: -10,
        left: 20,
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid white'
      }}
    />
  </Box>
))}      
        
        
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddClick}
        disabled={viewpoints.length >= MAX_VIEWPOINTS}
        fullWidth
        sx={{ mt: 2, maxWidth: '400px' }}
      >
        Thêm quan điểm
      </Button>
      <Button
        variant="contained"
        onClick={handleNext}
        fullWidth
        sx={{ mt: 2, maxWidth: '400px' }}
      >
        Tiếp theo
      </Button>

      <PickInterestedTopicDialog
        open={topicDialogOpen}
        onClose={(event, reason) => {
         /* if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') */{
            setTopicDialogOpen(false);
          }
        }}
        onTopicSelect={handleTopicSelect}
      />

      <EnterCommentDialog
        dialogOpen={commentDialogOpen}
        topic={selectedTopic}
        onDialogClose={(event, reason) => {
          /* if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') */ {
            setCommentDialogOpen(false);
          }
        }}
        onSubmitComment={handleCommentSubmit}
      />
    </Box>
  );
}
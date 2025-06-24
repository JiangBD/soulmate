// File: src/components/ViewpointsSetting.js
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PickInterestedTopicDialog from './PickInterestedTopicDialog';
import EnterCommentDialog from './EnterViewpointDialog';

export default function ViewpointsSetting({ backToMainSetting }) {
  const [viewpoints, setViewpoints] = useState([]); 
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const MAX_VIEWPOINTS = 20;

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('soulmate_token');

  // 1) Fetch existing viewpoints on mount
  useEffect(() => {
    async function fetchViewpoints() {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch('/api/updateviewpoints', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch viewpoints');
          return;
        }
        const data = await res.json();
        // data should be an array of { viewpoint_id, full_content }
        setViewpoints(data.viewpoints);
      } catch (err) {
        console.error(err);
      }
    }
    fetchViewpoints();
  }, []);

  // 2) Open topic picker
  const handleAddClick = () => {
    setTopicDialogOpen(true);
  };

  // 3) When a topic is selected, open the comment dialog
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setTopicDialogOpen(false);
    setCommentDialogOpen(true);
  };

  // 4) When comment is submitted, POST to the API and update local state
  const handleCommentSubmit = async (topic, comment) => {
    const full_viewpoint = `${topic}: ${comment}`;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('/api/updateviewpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_viewpoint }),
      });
      if (!res.ok) {
        console.error('Failed to register new viewpoint');
        return;
      }
      const newVp = await res.json();
      // Expecting { viewpoint_id, full_content } back
      setViewpoints((prev) => [...prev, newVp]);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentDialogOpen(false);
    }
  };

  // 5) When “X” is clicked, DELETE that viewpoint
  const handleDelete = async (viewpoint_id) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('/api/updateviewpoints', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ viewpoint_id }),
      });
      if (!res.ok) {
        console.error('Failed to delete viewpoint');
        return;
      }
      // On success, remove from local state
      setViewpoints((prev) =>
        prev.filter((vp) => vp.viewpoint_id !== viewpoint_id)
      );
    } catch (err) {
      console.error(err);
    }
  };
  const requestToUpdateLocation = () => {
        fetch('/api/updatelocation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: getToken(),
            isTriggeredNotByLocationChange: true, // This is a forced update, not by user location change
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              console.error('[Recs] /api/updatelocation status:', res.status);
              throw new Error('Cannot reupdate location,line 127 ViewpointsSetting.js');
            }
            alert('Đã cập nhật các quan điểm của bạn lưu thành công!');
          })
          .catch((err) => {
            console.error('[Recs] app/recs/page.js line 132 Error reupdating location:', err);            
          });
  }

  // 6) When user clicks “Hoàn tất”
  const handleFinish = () => {
    requestToUpdateLocation(); //request to update location and possible matches for all neighbor users
    backToMainSetting();
  };

  return (
    <Box p={2} display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Typography variant="h5" gutterBottom>Các quan điểm của tôi</Typography>

      <Box flexGrow={1} overflow="auto" width="100%" maxWidth="400px">
        {viewpoints.map(({ viewpoint_id, full_content }, index) => (
          <Box key={viewpoint_id} mb={3} position="relative">
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
              {/* X button to delete */}
              <Box
                component="span"
                onClick={() => handleDelete(viewpoint_id)}
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
              {full_content}
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
        fullWidth
        disabled={viewpoints.length >= MAX_VIEWPOINTS}
        sx={{ mt: 2, maxWidth: '400px' }}
      >
        Thêm quan điểm
      </Button>

      <Button
        variant="contained"
        onClick={handleFinish}
        fullWidth
        sx={{ mt: 2, maxWidth: '400px' }}
      >
        Hoàn tất
      </Button>

      {/* Topic selection dialog */}
      <PickInterestedTopicDialog
        open={topicDialogOpen}
        onClose={(event, reason) => {
          /* if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') */{
            setTopicDialogOpen(false);
          }
        }}
        onTopicSelect={handleTopicSelect}
      />

      {/* Comment entry dialog */}
      <EnterCommentDialog
        dialogOpen={commentDialogOpen}
        topic={selectedTopic}
        onDialogClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setCommentDialogOpen(false);
          }
        }}
        onSubmitComment={handleCommentSubmit}
      />
    </Box>
  );
}

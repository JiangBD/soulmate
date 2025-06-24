`use client`;
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, Box, Chip, TextField } from '@mui/material';
import { allEntities } from '@/utils/cosinesimilarityworker';

const topics = allEntities(); // Assuming allEntities() returns an array of topics

export default function PickInterestedTopicDialog({ open, onClose, onTopicSelect }) {
  const [searchInput, setSearchInput] = useState('');
  const [currentSearchedEntity, setCurrentSearchedEntity] = useState('');
  const [filteredTopics, setFilteredTopics] = useState(topics);
  const intervalRef = useRef(null);


  // Periodically check search input
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Set up new interval
    intervalRef.current = window.setInterval(() => {
      if (searchInput !== currentSearchedEntity) {
        setCurrentSearchedEntity(searchInput);
        const searchUpper = searchInput.trim().toUpperCase();
        if (searchUpper) {
          const matches = topics.filter((t) => t.toUpperCase().includes(searchUpper));
          setFilteredTopics(matches.length > 0 ? matches : topics);
        } else {
          setFilteredTopics(topics);
        }
      }
    }, 2500);

    // Cleanup on unmount or when searchInput changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [searchInput, currentSearchedEntity]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chọn chủ đề</DialogTitle>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        {/* Search bar */}
        <TextField
          label="Tìm chủ đề"
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          fullWidth
        />
        {/* Chips grid */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {filteredTopics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onClick={() => onTopicSelect(topic)}
              clickable
            />
          ))}
        </Box>
      </Box>
    </Dialog>
  );
}




// 'use client';
// import { Dialog, DialogTitle, Box, Chip } from '@mui/material';
// import { allEntities } from '@/utils/cosinesimilarityworker';
// // const topics = [
// //   'Jisoo', 'Donald Trump', 'Biden', 'Lady Jessica', 'Stilgar',

// const topics = allEntities(); // Assuming allEntities() returns an array of topics
// export default function PickInterestedTopicDialog({ open, onClose, onTopicSelect }) {
//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Chọn chủ đề</DialogTitle>
//       <Box p={2} display="flex" gap={1} flexWrap="wrap">
//         {topics.map((topic) => (
//           <Chip
//             key={topic}
//             label={topic}
//             onClick={() => onTopicSelect(topic)}
//             clickable
//           />
//         ))}
//       </Box>
//     </Dialog>
//   );
// }

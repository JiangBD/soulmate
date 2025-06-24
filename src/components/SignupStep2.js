// src/components/SignupStep2.js
'use client';

import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useState } from 'react';
import { useSignupInfo } from '@/context/SignupInfoContext';

// Re‐use the same value/label pairs as Step1’s GENDERS/MARITAL, but here for “target”:
const GENDERS = [
  { value: 'male', label: 'Nam (Male)' },
  { value: 'female', label: 'Nữ (Female)' },
  { value: 'gay', label: 'Đồng tính nam (Gay)' },
  { value: 'lesbian', label: 'Đồng tính nữ (Lesbian)' },
];
const MARITAL = [
  { value: 'Single', label: 'Độc thân (Single)' },
  { value: 'Divorced', label: 'Ly hôn (Divorced)' },
  { value: 'Married', label: 'Đã kết hôn (Married)' },
];

export default function SignupStep2({ onNext }) {
  const { updateSignupInfo } = useSignupInfo();

  // Default range [18, 26] — feel free to adjust the defaults as you like.
  const [ageRange, setAgeRange] = useState([18, 26]);
  const [targetGender, setTargetGender] = useState('');
  const [targetMarital, setTargetMarital] = useState('');

  // MUI Slider “range” handler
  const handleAgeChange = (event, newValue) => {
    setAgeRange(newValue);
  };

  const handleNext = () => {
    updateSignupInfo({
      dating_preference: {
        min_age: ageRange[0],
        max_age: ageRange[1],
        target_gender: targetGender,
        target_marital_status: targetMarital,
      },
    });
    onNext();
  };

  // “Tiếp theo” disabled if gender or marital not chosen
  const isNextDisabled = !targetGender || !targetMarital;

  return (
    <Box p={2} maxWidth={400} mx="auto" sx={{ minHeight: '100vh' }}>
      <Typography variant="h6" gutterBottom>
        Chọn khoảng tuổi mong muốn:
      </Typography>

      <Box px={2}>
        <Slider
          value={ageRange}
          onChange={handleAgeChange}
          valueLabelDisplay="on"
          min={18}
          max={100}
          sx={{ mt: 2 }}
        />
        <Typography>
          {ageRange[0]} - {ageRange[1]}
        </Typography>
      </Box>

      {/* — Giới tính mong muốn — */}
      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Giới tính mong muốn</InputLabel>
        <Select
          value={targetGender}
          label="Giới tính mong muốn"
          onChange={(e) => setTargetGender(e.target.value)}
        >
          {GENDERS.map((g) => (
            <MenuItem key={g.value} value={g.value}>
              {g.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* — Tình trạng hôn nhân mong muốn — */}
      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Tình trạng hôn nhân mong muốn</InputLabel>
        <Select
          value={targetMarital}
          label="Tình trạng hôn nhân mong muốn"
          onChange={(e) => setTargetMarital(e.target.value)}
        >
          {MARITAL.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handleNext}
        disabled={isNextDisabled}
      >
        Tiếp theo
      </Button>
    </Box>
  );
}


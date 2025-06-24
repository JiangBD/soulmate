// src/components/DatingPreferencesSetting.js
'use client';

import { useState,useRef , useEffect } from 'react';
import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Button, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function DatingPreferencesSetting({backToMainSetting}) {
  const router = useRouter();
  const [ageRange, setAgeRange] = useState([18, 26]);
  const [targetGender, setTargetGender] = useState('');
  const [targetMarital, setTargetMarital] = useState('');
  const [selfIntro, setSelfIntro] = useState('');
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);
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

  useEffect(() => {
    const token = typeof window !== 'undefined'
    ? localStorage.getItem('soulmate_token')
    : null;
    tokenRef.current = token;
    async function fetchPrefs() {
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/updatepreferences', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} while fetching preferences, line 56 DatingPreferencesSetting.js`);
        const data = await res.json();
        setSelfIntro(data.self_intro || '');
        setTargetGender(data.gender_preference || '');
        setTargetMarital(data.marital_status_preference || '');
        if (data.age_range) {
          const [min, max] = data.age_range.split(' - ').map(Number);
          setAgeRange([min, max]);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrefs();
  }, []);

  const handleAgeChange = (_, newVal) => setAgeRange(newVal);

  const handleFinish = async () => {
    const token = tokenRef.current;
    if (!token) {
      alert('Chưa đăng nhập.');
      return;
    }
    try {
      const body = {
        self_intro: selfIntro,
        gender_preference: targetGender,
        marital_status_preference: targetMarital,
        age_range: `${ageRange[0]} - ${ageRange[1]}`,
      };
      const res = await fetch('/api/updatepreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
//      router.push('/profile');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Không thể cập nhật xu hướng hẹn hò. Vui lòng thử lại.');
    }
    backToMainSetting();
  };

  if (loading) return <Typography>Đang tải…</Typography>;

  const disabled = !targetGender || !targetMarital;

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
          min={16}
          max={80}
          sx={{ mt: 2 }}
        />
        <Typography>{ageRange[0]} - {ageRange[1]}</Typography>
      </Box>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Giới tính mong muốn</InputLabel>
        <Select
          value={targetGender}
          label="Giới tính mong muốn"
          onChange={e => setTargetGender(e.target.value)}
        >
          {GENDERS.map(g => (
            <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Tình trạng hôn nhân mong muốn</InputLabel>
        <Select
          value={targetMarital}
          label="Tình trạng hôn nhân mong muốn"
          onChange={e => setTargetMarital(e.target.value)}
        >
          {MARITAL.map(m => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" gutterBottom mt={3}>
        Tự giới thiệu bản thân
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={selfIntro}
        onChange={e => setSelfIntro(e.target.value)}
        placeholder="Viết vài dòng về bản thân..."
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handleFinish}
        disabled={disabled}
      >
        Hoàn tất
      </Button>
    </Box>
  );
}

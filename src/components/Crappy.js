// src/components/SignupStep1.js
'use client';
import { Box, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSignupInfo } from '@/context/SignupInfoContext';
import { cookies  }  from 'next/headers'
import { useRouter } from 'next/navigation';
const GENDERS = [
  { value: 'male', label: 'Nam (Male)' },
  { value: 'Female', label: 'Nữ (Female)' },
  { value: 'Gay', label: 'Đồng tính nam (Gay)' },
  { value: 'Lesbian', label: 'Đồng tính nữ (Lesbian)' },
];
const MARITAL = [
  { value: 'Single', label: 'Độc thân (Single)' },
  { value: 'Divorced', label: 'Ly hôn (Divorced)' },
  { value: 'Married', label: 'Đã kết hôn (Married)' },
];
let signupEmail = null;
export default function SignupStep1({ onNext }) {
const { updateSignupInfo } = useSignupInfo();

  const [userId, setUserId] = useState('');
  const [fullname, setFullname] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [marital, setMarital] = useState('');
  const [selfIntro, setSelfIntro] = useState('');

  const handleNext = () => {
    updateSignupInfo({
      user_id: userId,
      full_name: fullname,
      birthdate: {year, month, day},
      gender,
      marital_status: marital,
      self_intro: selfIntro,
    });
    onNext();
  };
  //--- COMMENT THIS OUT, ONLY USE IT WHEN RUNNING FOR REAL
 
  useEffect(() => {
    const cookieStore = cookies();
    const signupEmailCookie = cookieStore.get('signup_email');
    if (signupEmailCookie) {
    signupEmail =  signupEmailCookie.value;
    setUserId(signupEmail);
    }
    else router.push('/'); 
   }, []);
//--- COMMENT THIS OUT, ONLY USE IT WHEN RUNNING FOR REAL




//   `${year.padStart(4,'0')}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`
  return (
    <Box p={2} maxWidth={400} mx="auto" sx={{ overflowY: 'auto', minHeight: '100vh' }}>
      <Typography variant="h6" gutterBottom>
        Tên đăng nhập / địa chỉ email của bạn:
      </Typography>
      {/* REPLACE WITH A NEW EMAIL INPUT FIELD HERE ENABLED/DISABLED   */}
      { userId ? (
        <TextField
        fullWidth
        value={userId}
        disabled
        placeholder="you@example.com"
        onChange={(e) => setUserId(e.target.value)}        
      />) : (<TextField
        fullWidth
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="you@example.com"
      />) }
      

      <Typography variant="h6" gutterBottom mt={3}>
        Tên đầy đủ của bạn:
      </Typography>
      <TextField fullWidth value={fullname} onChange={(e) => setFullname(e.target.value)} />

      <Typography variant="h6" gutterBottom mt={3}>
        Ngày sinh của bạn?
      </Typography>
      <Box display="flex" gap={2}>
        <TextField label="Day" value={day} onChange={(e) => setDay(e.target.value)} />
        <TextField label="Month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <TextField label="Year" value={year} onChange={(e) => setYear(e.target.value)} />
      </Box>
      <Typography mt={1} variant="body2">
        Ứng dụng sẽ chỉ hiển thị tuổi tính bằng năm của bạn, và không hiển thị ngày sinh.
      </Typography>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Giới tính của bạn</InputLabel>
        <Select
          value={gender}
          label="Giới tính của bạn"
          onChange={(e) => setGender(e.target.value)}
        >
          {GENDERS.map((g) => (
            <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Tình trạng hôn nhân</InputLabel>
        <Select
          value={marital}
          label="Tình trạng hôn nhân"
          onChange={(e) => setMarital(e.target.value)}
        >
          {MARITAL.map((m) => (
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
        onChange={(e) => setSelfIntro(e.target.value)}
        placeholder="Viết vài dòng về bản thân..."
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 4 }}
        onClick={handleNext}
        disabled={
          !userId || !fullname || !day || !month || !year || !gender || !marital || !selfIntro
        }
      >
        Tiếp theo
      </Button>
    </Box>
  );
}

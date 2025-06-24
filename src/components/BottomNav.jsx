'use client';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  
 useEffect(() => {
     if (typeof window !== 'undefined') 
      setOrigin(window.location.origin);   
 
 },);
  // useEffect(() => {   
  //   console.log('Value set to:', value);
  // }, [value]);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        
        onChange={(_, newValue) => {             
                 router.push(`${origin}${newValue}`);
        }}
      >
        <BottomNavigationAction  value="/app/recs" icon={<WhatshotIcon />} />
        <BottomNavigationAction  value="/app/mymatches" icon={<FavoriteIcon />} />
        <BottomNavigationAction value="/app/settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

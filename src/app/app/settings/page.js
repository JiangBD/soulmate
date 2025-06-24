'use client';
import { useState } from 'react';
import MainSetting  from '@/components/MainSetting';
import PhotoAlbumSetting  from '@/components/PhotoAlbumSetting';
import ViewpointsSetting  from '@/components/ViewpointsSetting';
import DatingPreferencesSetting from '@/components/DatingPreferencesSetting';
//
export default function Settings() {
  const [ settingScreenIndex, setSettingScreenIndex ] = useState(0);
// {backToMainSetting}
  if (settingScreenIndex === 0) {
    return <MainSetting moveToSettingScreen={ (screenIndex) => setSettingScreenIndex(screenIndex)} />;
  }
   else if (settingScreenIndex === 1) {
     return <PhotoAlbumSetting backToMainSetting={() => setSettingScreenIndex(0)} />;
   }
   else if (settingScreenIndex === 2) {
     return <DatingPreferencesSetting backToMainSetting={() => setSettingScreenIndex(0)} />;
  }
   else if (settingScreenIndex === 3) {
     return <ViewpointsSetting backToMainSetting={() => setSettingScreenIndex(0)}/>;
   }
}

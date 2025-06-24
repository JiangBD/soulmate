// src/app/signup/page.js
'use client';
import {  useAppBarBottomNavContext } from '@/context/AppBarBottomNavContext';
import { useState, useEffect } from 'react';
import { SignupInfoProvider } from '@/context/SignupInfoContext';
import SignupStep1 from '@/components/SignupStep1';
import SignupStep2 from '@/components/SignupStep2';
import SignupStep4 from '@/components/SignupStep4';
import SignupStep3 from '@/components/SignupStep3';
export default function SignupPage() {

  const { bottomNavVisible, setBottomNavVisible, appBarVisible, setAppBarVisible } = useAppBarBottomNavContext();
  const [step, setStep] = useState(1);
  useEffect(() => {
    setBottomNavVisible(false);
    setAppBarVisible(false);
    return () => {
      setBottomNavVisible(true);
      setAppBarVisible(true);
    };
  }, []);
  return (
    <SignupInfoProvider>
      {step === 1 && <SignupStep1 onNext={() => setStep(2)} />}
      {step === 2 && <SignupStep2 onNext={() => setStep(3)} />}
      {step === 3 && <SignupStep3 onNext={() => setStep(4)} />}
      {step === 4 && <SignupStep4 />}
    </SignupInfoProvider>
  );
}

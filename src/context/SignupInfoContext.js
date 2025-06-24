// src/context/SignupInfoContext.js
'use client';
import { createContext, useContext, useState } from 'react';

const SignupInfoContext = createContext();
export function SignupInfoProvider({ children }) {
  const [signupInfo, setSignupInfo] = useState({
    // Step1 will overwrite/merge these fields:
    fullname: '',
    birthdate: { day: '', month: '', year: '' },
    viewpoints: [],
    photos: [],
    // ←––––– Add dating_preference with default empty values
    dating_preference: {
      min_age: '',
      max_age: '',
      target_gender: '',
      target_marital_status: '',
    },
  });

  const updateSignupInfo = (data) => {
    // Merge new fields into signupInfo
    setSignupInfo((prev) => ({ ...prev, ...data }));
  };

  return (
    <SignupInfoContext.Provider value={{ signupInfo, updateSignupInfo }}>
      {children}
    </SignupInfoContext.Provider>
  );
}
export function useSignupInfo() {
  return useContext(SignupInfoContext);
}

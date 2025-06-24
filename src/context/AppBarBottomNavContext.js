// src/app/AppBarBottomNavContext.js
import { createContext, useContext } from 'react';
export const AppBarBottomNavContext = createContext();
export const useAppBarBottomNavContext = () => useContext(AppBarBottomNavContext);

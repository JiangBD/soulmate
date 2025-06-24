// src/app/BottomNavContext.js
import { createContext, useContext } from 'react';
export const AppBarContext = createContext();
export const useAppBarContext = () => useContext(AppBarContext);

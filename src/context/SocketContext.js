// src/context/SocketContext.js
'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

// 1) Create the context
const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const workerRef = useRef(null);
  const portRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 2) Instantiate the SharedWorker (once per tab)
    if ('SharedWorker' in window) {
      const worker = new SharedWorker('/socket-worker.js');
      workerRef.current = worker;
      const port = worker.port;
      port.start();
      portRef.current = port;

      // 3) Mark “ready” once we’ve attached the port
      setReady(true);
    } else {
      console.error('SharedWorker not supported by this browser.');
    }

    return () => {
      // When this tab unmounts, we could (optionally) tell the worker to remove this port 
      // — but SharedWorker spec auto‐cleans when the port is closed or page goes away.
    };
  }, []);

  return (
    <SocketContext.Provider value={{ portRef, ready }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

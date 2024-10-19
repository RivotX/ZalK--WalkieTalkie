// Client/context/BusyContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import getEnvVars from '../config';

const BusyContext = createContext();

export const BusyProvider = ({ children }) => {
  const [isBusy, setIsBusy] = useState(null); // Inicializa con un valor por defecto

  useEffect(() => {
    console.log('isBusy en BusyContext', isBusy);
  }, [isBusy]);

  return (
    <BusyContext.Provider value={{ isBusy, setIsBusy }}>
      {children}
    </BusyContext.Provider>
  );
};

export const useBusy = () => useContext(BusyContext);
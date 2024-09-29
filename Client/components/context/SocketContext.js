import React, { createContext, useContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ socket, children }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);
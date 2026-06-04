import React, { createContext, useState, useCallback } from 'react';

export const BanContext = createContext();

export const BanProvider = ({ children }) => {
  const [banData, setBanData] = useState(null);

  const setBan = useCallback((data) => {
    setBanData(data);
  }, []);

  const clearBan = useCallback(() => {
    setBanData(null);
  }, []);

  return (
    <BanContext.Provider value={{ banData, setBan, clearBan }}>
      {children}
    </BanContext.Provider>
  );
};


'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DataRefreshContextType {
  dataVersion: number;
  refreshData: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const DataRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => {
    setDataVersion(prevVersion => prevVersion + 1);
  }, []);

  return (
    <DataRefreshContext.Provider value={{ dataVersion, refreshData }}>
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (context === undefined) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

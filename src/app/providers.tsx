import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { BackendProvider } from '../context/BackendContext';
import { MetricsProvider } from '../context/MetricsContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <BackendProvider>
        <MetricsProvider>{children}</MetricsProvider>
      </BackendProvider>
    </ThemeProvider>
  );
};

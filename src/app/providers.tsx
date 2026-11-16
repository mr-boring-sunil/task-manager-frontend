import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { BackendProvider } from '../context/BackendContext';
import { MetricsProvider } from '../context/MetricsContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BackendProvider>
          <MetricsProvider>{children}</MetricsProvider>
        </BackendProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

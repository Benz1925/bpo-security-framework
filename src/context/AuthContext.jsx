"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock user credentials - ONLY allow this one admin account
const VALID_CREDENTIALS = {
  email: 'admin@bpo.com',
  password: 'password123'
};

// Provider component that wraps the app and makes auth object available
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage on initial load
    const storedUser = localStorage.getItem('bpo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('bpo_user');
      }
    }

    // This will be used when deployed to Azure Static Web Apps
    // It checks for the user info from the built-in authentication
    const checkAzureAuth = async () => {
      try {
        // In Azure Static Web Apps, this endpoint returns user info if authenticated
        const response = await fetch('/.auth/me');
        if (response.ok) {
          const authData = await response.json();
          if (authData.clientPrincipal) {
            // User is authenticated in Azure
            const azureUser = {
              id: authData.clientPrincipal.userId,
              name: authData.clientPrincipal.userDetails,
              email: authData.clientPrincipal.userDetails,
              role: authData.clientPrincipal.userRoles[0] || 'user'
            };
            setUser(azureUser);
            localStorage.setItem('bpo_user', JSON.stringify(azureUser));
          }
        }
      } catch (error) {
        // We're likely not running in Azure Static Web Apps
        // This is expected during local development
        console.log('Not running in Azure Static Web Apps environment');
      } finally {
        setLoading(false);
      }
    };

    // Try to get Azure auth info, but don't block on it
    checkAzureAuth();
    
    if (!storedUser) {
      setLoading(false);
    }
  }, []);

  // Login function - validate against single admin credential
  const login = async (email, password) => {
    // Try Azure authentication first
    try {
      // In a real app, you would submit credentials to Azure's auth endpoint
      // For demo, we'll skip this and use mock validation
    } catch (error) {
      console.log('Azure authentication not available in development');
    }
    
    // Only allow the single valid credential
    const isValidCredential = email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password;
    
    if (isValidCredential) {
      // Successful login
      const userData = {
        id: Date.now().toString(),
        email: email,
        name: 'BPO Security Admin',
        role: 'admin'
      };
      
      setUser(userData);
      localStorage.setItem('bpo_user', JSON.stringify(userData));
      return true;
    } else {
      // Login failed - all other credentials will fail
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    localStorage.removeItem('bpo_user');
    setUser(null);
    
    // If we're in Azure Static Web Apps, use their logout endpoint
    try {
      await fetch('/.auth/logout');
    } catch (error) {
      // Not in Azure, which is fine
    }
  };

  // Value object that will be passed to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
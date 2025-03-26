"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn, Lock, AlertTriangle, Smartphone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Add constants for login attempts tracking
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30; // in seconds
// The MFA verification code is 32512 - kept as a constant for demonstration purposes
const MFA_CODE = "32512"; 

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  // MFA states
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaAttempts, setMfaAttempts] = useState(0);
  const [mfaError, setMfaError] = useState('');
  
  const { login } = useAuth();
  
  // Effect to check for existing lockout data in localStorage when component mounts
  useEffect(() => {
    const storedLockoutData = localStorage.getItem('login_lockout_data');
    if (storedLockoutData) {
      const { attempts, lockUntil } = JSON.parse(storedLockoutData);
      setLoginAttempts(attempts);
      
      // Check if account is currently locked
      if (lockUntil && new Date(lockUntil) > new Date()) {
        setIsLocked(true);
        // Calculate remaining lockout time in seconds
        const remainingSeconds = Math.ceil((new Date(lockUntil) - new Date()) / 1000);
        setLockoutTime(remainingSeconds);
        
        // Start the countdown timer
        startLockoutCountdown(remainingSeconds);
      } else if (lockUntil) {
        // Lockout period has expired, clear it
        localStorage.removeItem('login_lockout_data');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
  }, []);
  
  // Function to start lockout countdown
  const startLockoutCountdown = (seconds) => {
    setLockoutTime(seconds);
    
    const countdownInterval = setInterval(() => {
      setLockoutTime(prevTime => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          clearInterval(countdownInterval);
          setIsLocked(false);
          // Don't reset attempts here, they should persist to track repeat offenders
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(countdownInterval);
  };
  
  // Function to handle failed login attempt
  const handleFailedAttempt = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Lock the account for the specified duration
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION * 1000);
      
      // Store lockout data in localStorage
      localStorage.setItem('login_lockout_data', JSON.stringify({
        attempts: newAttempts,
        lockUntil: lockUntil.toISOString()
      }));
      
      setIsLocked(true);
      // Start countdown
      startLockoutCountdown(LOCKOUT_DURATION);
      
      setError(`Account locked for ${LOCKOUT_DURATION} seconds due to too many failed login attempts.`);
    } else {
      // Save the updated attempt count
      localStorage.setItem('login_lockout_data', JSON.stringify({
        attempts: newAttempts
      }));
      
      setError(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining before account is locked.`);
    }
  };
  
  // Handle first step of login (credentials)
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      setError(`Account is locked. Please try again in ${lockoutTime} seconds.`);
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify credentials only in this step
      const credentialsValid = await login(email, password, true);
      
      if (!credentialsValid) {
        handleFailedAttempt();
        throw new Error('Invalid credentials');
      }
      
      // Credentials are valid, proceed to MFA
      setShowMfa(true);
      setIsLoading(false);
      
    } catch (err) {
      setIsLoading(false);
      // Error message is set in handleFailedAttempt for credential errors
    }
  };
  
  // Handle MFA verification
  const handleMfaVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMfaError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if entered code matches the fixed code
      if (mfaCode === MFA_CODE) {
        // MFA successful, complete the login process
        const loginSuccess = await login(email, password, false);
        
        if (loginSuccess) {
          // On success, reset login attempts
          localStorage.removeItem('login_lockout_data');
          setLoginAttempts(0);
        } else {
          throw new Error('Authentication failed. Please try logging in again.');
        }
      } else {
        // MFA failed
        const newAttempts = mfaAttempts + 1;
        setMfaAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Too many MFA failures, go back to login screen
          setShowMfa(false);
          setMfaAttempts(0);
          setEmail('');
          setPassword('');
          throw new Error('Too many incorrect verification codes. Please start over.');
        }
        
        throw new Error(`Incorrect verification code. ${3 - newAttempts} attempts remaining.`);
      }
    } catch (err) {
      setMfaError(err.message);
      setIsLoading(false);
    }
  };
  
  // Render the MFA verification screen
  const renderMfaScreen = () => {
    return (
      <form onSubmit={handleMfaVerification}>
        <CardContent className="space-y-4 pt-6">
          <div className="text-center mb-4">
            <div className="bg-blue-100 rounded-full p-3 inline-flex mx-auto mb-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter the verification code to complete sign in
            </p>
          </div>
          
          {mfaError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
              <span>{mfaError}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="mfaCode">Enter verification code</Label>
            <Input 
              id="mfaCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="5-digit code"
              value={mfaCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setMfaCode(value);
              }}
              className="text-center text-lg tracking-widest font-mono"
              required
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading || mfaCode.length !== MFA_CODE.length}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Code
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowMfa(false);
              setMfaAttempts(0);
              setMfaCode('');
            }}
            className="mt-2 text-sm"
            disabled={isLoading}
          >
            Go back to login
          </Button>
        </CardFooter>
      </form>
    );
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 text-center bg-gray-50 rounded-t-lg border-b border-gray-100">
        <div className="mx-auto p-2 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">CloudSentinel</CardTitle>
        <CardDescription>
          {showMfa ? 'Complete two-factor authentication' : 'Enter your credentials to access the security dashboard'}
        </CardDescription>
      </CardHeader>
      
      {isLocked ? (
        <CardContent className="pt-6">
          <div className="bg-red-50 p-4 rounded-md text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Account Locked</h3>
            <p className="text-red-700 mb-2">
              Too many failed login attempts. Please try again in {lockoutTime} seconds.
            </p>
            <div className="w-full bg-red-200 rounded-full h-2 mt-3">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${Math.max(0, (lockoutTime / LOCKOUT_DURATION) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      ) : showMfa ? (
        renderMfaScreen()
      ) : (
        <form id="login-form" onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
            
            {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
              <div className="flex items-center justify-between text-sm text-amber-700 bg-amber-50 p-2 rounded-md">
                <span>Failed login attempts: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  className="text-xs text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    // You can implement forgot password functionality here
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default LoginForm; 
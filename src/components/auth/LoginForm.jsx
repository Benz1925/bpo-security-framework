"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Add constants for login attempts tracking
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30; // in seconds

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
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
      
      // Call login function from auth context
      const success = await login(email, password);
      
      if (!success) {
        handleFailedAttempt();
        throw new Error('Invalid credentials');
      }
      
      // On success, reset login attempts
      localStorage.removeItem('login_lockout_data');
      setLoginAttempts(0);
      
      // Login successful - handled by auth context
    } catch (err) {
      setIsLoading(false);
      // Error message is set in handleFailedAttempt for credential errors
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 text-center bg-gray-50 rounded-t-lg border-b border-gray-100">
        <div className="mx-auto p-2 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">BPO Security Framework</CardTitle>
        <CardDescription>
          Enter your credentials to access the security dashboard
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
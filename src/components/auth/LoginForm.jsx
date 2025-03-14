"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
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
        throw new Error('Invalid credentials. Please try again.');
      }
      
      // Login successful - handled by auth context
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = async () => {
    // Set demo credentials
    setEmail('demo@bposecurity.com');
    setPassword('securePassword123');
    
    // Instead of manipulating the DOM, call handleLogin directly
    // with a synthetic event
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call login function from auth context with demo credentials
      const success = await login('demo@bposecurity.com', 'securePassword123');
      
      if (!success) {
        throw new Error('Invalid credentials. Please try again.');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
      setIsLoading(false);
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
      <form id="login-form" onSubmit={handleLogin}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
              {error}
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
    </Card>
  );
};

export default LoginForm; 
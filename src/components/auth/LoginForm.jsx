"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to your authentication service
      // For demo purposes, we'll simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter both email and password');
      }
      
      // Mock authentication - in a real app, this would verify against a backend
      if (credentials.email === 'admin@bpo.com' && credentials.password === 'password123') {
        const user = {
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin'
        };
        
        // Store user in localStorage (in a real app, you'd use secure cookies or tokens)
        localStorage.setItem('bpo_user', JSON.stringify(user));
        
        // Call the onLogin callback with the user object
        if (onLogin) onLogin(user);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            BPO Security Framework Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="admin@bpo.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Demo credentials: admin@bpo.com / password123</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm; 
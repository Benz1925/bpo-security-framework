"use client";

import React, { useState, useEffect } from 'react';
import BPOSecurityTest from '@/components/BPOSecurityTest';
import { Card } from '@/components/ui/card';
import SecurityDashboard from '@/components/dashboard/SecurityDashboard';
import ClientSelector from '@/components/clients/ClientSelector';
import LoginForm from '@/components/auth/LoginForm';
import AlertNotificationPanel from '@/components/AlertNotificationPanel';
import SecurityReports from '@/components/reports/SecurityReports';
import { useAuth } from '@/context/AuthContext';
import TasksManagement from '@/components/tasks/TasksManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart, FileText, CheckSquare } from 'lucide-react';

// Define types
interface AlertType {
  type: string;
  message: string;
  timestamp: string;
  id?: string; // Adding id for better tracking
}

interface Client {
  id: string;
  name: string;
  industry: string;
  riskLevel: string;
}

// Create a context for active tab state
export const TabContext = React.createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>({
  activeTab: 'dashboard',
  setActiveTab: () => {}
});

export default function Home() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, user } = useAuth();
  
  // Handle navigation from other components to specific tabs
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    const handleNavigateToTasks = (event: CustomEvent) => {
      setActiveTab('tasks');
      // Add alert about task navigation
      addAlert({
        type: 'info',
        message: 'Navigated to security tasks for follow-up actions'
      });
    };
    
    // Add event listener for custom navigation event
    window.addEventListener('navigate-to-tasks', handleNavigateToTasks as EventListener);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('navigate-to-tasks', handleNavigateToTasks as EventListener);
    };
  }, []);
  
  // Add welcome notification on component mount and test notifications in dev mode
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Only add welcome notification if user is authenticated
    if (isAuthenticated && user) {
      // Give a slight delay for better UX
      setTimeout(() => {
        addAlert({
          type: 'success',
          message: `Welcome back! You are logged in as ${user.email}`
        });
        
        // Add test notifications only in development mode
        if (process.env.NODE_ENV === 'development') {
          // Add with slight delay to demonstrate functionality
          setTimeout(() => {
            addAlert({
              type: 'success',
              message: 'Encryption test passed: All sensitive data properly encrypted.'
            });
            
            addAlert({
              type: 'warning',
              message: 'Access Control Vulnerability: Excessive admin permissions detected.'
            });
            
            addAlert({
              type: 'error',
              message: 'Critical: Unpatched security vulnerability detected in system.'
            });
            
            addAlert({
              type: 'info',
              message: 'Compliance scan scheduled for next Monday.'
            });
          }, 2000);
        }
      }, 500);
    }
  }, [isAuthenticated, user]);
  
  const addAlert = ({ type, message }: { type: string; message: string }) => {
    const timestamp = new Date().toLocaleTimeString();
    const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setAlerts(prev => [{type, message, timestamp, id}, ...prev]);
  };
  
  const clearAlerts = () => {
    setAlerts([]);
  };
  
  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };
  
  // Auto-dismiss alerts
  useEffect(() => {
    if (alerts.length === 0) return;
    
    // Set different timeouts based on alert type
    const timeouts = {
      success: 5000,  // 5 seconds
      info: 7000,     // 7 seconds
      warning: 10000, // 10 seconds
      error: 0        // Don't auto-dismiss errors
    };
    
    // Create timeout for each alert that should auto-dismiss
    const timers = alerts.map((alert, index) => {
      // Skip if alert type is error or doesn't have a defined timeout
      if (alert.type === 'error' || !timeouts[alert.type as keyof typeof timeouts]) {
        return null;
      }
      
      return setTimeout(() => {
        dismissAlert(index);
      }, timeouts[alert.type as keyof typeof timeouts]);
    });
    
    // Clean up timeouts when component unmounts or alerts change
    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [alerts]);
  
  // If user is not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto pt-4 pb-8 px-4">
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoginForm />
        </div>
      </div>
    );
  }
  
  // Create the context value with the current activeTab and setActiveTab
  const tabContextValue = {
    activeTab,
    setActiveTab
  };
  
  return (
    <TabContext.Provider value={tabContextValue}>
      <div className="container mx-auto pt-4 pb-8 px-4">
        <div className="mb-6">
          <ClientSelector 
            onClientSelect={setSelectedClient}
          />
        </div>
        
        {/* Alert container with fixed minimum height to prevent layout shifts */}
        <div className="mb-4 min-h-[70px]">
          <AlertNotificationPanel 
            alerts={alerts}
            clearAlerts={clearAlerts}
            dismissAlert={dismissAlert}
            maxAlerts={3}
            horizontal={true}
          />
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
                  <BarChart className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Security Tests
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="dashboard">
              <SecurityDashboard 
                client={selectedClient}
              />
            </TabsContent>
            
            <TabsContent value="tests">
              <Card className="p-4">
                <BPOSecurityTest 
                  client={selectedClient}
                  addAlert={addAlert}
                  hideHeader={false}
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <SecurityReports 
                client={selectedClient}
                addAlert={addAlert}
              />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TasksManagement 
                client={selectedClient}
                addAlert={addAlert}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TabContext.Provider>
  );
}

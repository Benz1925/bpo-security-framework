"use client";

import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import BPOSecurityTest from "@/components/BPOSecurityTest";
import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/layout/Navbar";
import ClientSelector from "@/components/clients/ClientSelector";
import SecurityDashboard from "@/components/dashboard/SecurityDashboard";
import SecurityReports from "@/components/reports/SecurityReports";
import AlertNotificationPanel from "@/components/AlertNotificationPanel";
import { useAuth } from "@/context/AuthContext";
import { Button } from '@/components/ui/button';

// Define types for our data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  complianceLevel: string;
}

// Define Alert type
interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

// Define BPOSecurityTest props type
interface BPOSecurityTestProps {
  client: Client | null;
  hideHeader?: boolean;
  addAlert: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

// Define SecurityDashboard props type
interface SecurityDashboardProps {
  client: Client | null;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function Home() {
  const { login, isAuthenticated } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const dashboardRef = useRef<any>(null);
  const securityTestsRef = useRef<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleLogin = (userData: User) => {
    login(userData);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    // Add an alert when client is selected
    addAlert('info', `Client ${client.name} selected`);
  };

  // Function to add alerts that can be called from any component
  const addAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAlerts(prev => [...prev, { type, message, timestamp }]);
  };

  // Function to clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Function to dismiss a single alert by index
  const dismissAlert = (indexToRemove: number) => {
    setAlerts(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Reference to SecurityDashboard refresh function
  const refreshDashboard = () => {
    setIsLoading(true);
    // Call the refreshDashboard function on the SecurityDashboard component
    if (dashboardRef.current) {
      dashboardRef.current.refreshDashboard();
      addAlert('info', 'Dashboard refresh initiated');
    }
    // Simulate loading for a better user experience
    setTimeout(() => setIsLoading(false), 1000);
  };

  const runAllTests = () => {
    // Call the runAllTests function on the BPOSecurityTest component
    if (securityTestsRef.current) {
      securityTestsRef.current.runAllTests();
      addAlert('info', 'All security tests initiated');
    }
  };

  // Add a welcome notification when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      addAlert('info', 'Welcome to BPO Security Framework. Select a client to begin.');
      
      // In development mode, add some test notifications to demonstrate functionality
      if (process.env.NODE_ENV === 'development') {
        // Add with a slight delay so they appear after initial render
        const timer = setTimeout(() => {
          addAlert('success', 'Encryption test passed: All sensitive data properly encrypted');
          addAlert('warning', 'Access Control Vulnerability: Excessive admin permissions detected');
          addAlert('error', 'Critical: Unpatched security vulnerability detected in system');
          addAlert('info', 'Compliance scan scheduled for next Monday');
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]); // Only run when authentication state changes

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      <div className="container mx-auto px-4 md:px-6 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <ClientSelector onClientSelect={handleClientSelect} />
            <AlertNotificationPanel 
              alerts={alerts} 
              clearAlerts={clearAlerts} 
              dismissAlert={dismissAlert}
            />
          </div>
          
          <div className="lg:col-span-3">
            {/* Render components based on activeTab state */}
            {activeTab === "dashboard" ? (
              <SecurityDashboard 
                ref={dashboardRef}
                client={selectedClient} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
              />
            ) : activeTab === "tests" ? (
              <BPOSecurityTest 
                ref={securityTestsRef}
                client={selectedClient} 
                hideHeader={true}
                addAlert={addAlert}
              />
            ) : activeTab === "reports" ? (
              <SecurityReports 
                client={selectedClient}
              />
            ) : (
              // Default to dashboard if tab is not recognized
              <SecurityDashboard 
                ref={dashboardRef}
                client={selectedClient} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

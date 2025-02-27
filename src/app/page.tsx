"use client";

import { useState } from 'react';
import BPOSecurityTest from "@/components/BPOSecurityTest";
import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/layout/Navbar";
import ClientSelector from "@/components/clients/ClientSelector";
import SecurityDashboard from "@/components/dashboard/SecurityDashboard";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Shield } from "lucide-react";

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

export default function Home() {
  const { login, isAuthenticated } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (userData: User) => {
    login(userData);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">BPO Security Framework</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ClientSelector onClientSelect={handleClientSelect} />
          </div>
          
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Security Tests
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <SecurityDashboard client={selectedClient} />
              </TabsContent>
              
              <TabsContent value="tests">
                <BPOSecurityTest client={selectedClient} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

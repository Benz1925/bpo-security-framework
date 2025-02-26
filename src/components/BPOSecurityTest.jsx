"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BPOSecurityTest = () => {
  const [testResults, setTestResults] = useState({
    encryption: null,
    access: null,
    dataProtection: null,
    compliance: null
  });
  
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    encryption: false,
    access: false,
    dataProtection: false,
    compliance: false
  });

  const runSecurityTest = async (testType) => {
    // Set loading state for this specific test
    setIsLoading(prev => ({...prev, [testType]: true}));
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate security test with more realistic success rate
      const success = Math.random() > 0.3;
      setTestResults(prev => ({...prev, [testType]: success}));
      
      if (!success) {
        const timestamp = new Date().toLocaleTimeString();
        setAlerts(prev => [...prev, 
          {
            type: 'error',
            message: `Security alert: Potential vulnerability detected in ${testType}`,
            timestamp
          }
        ]);
      } else {
        const timestamp = new Date().toLocaleTimeString();
        setAlerts(prev => [...prev, 
          {
            type: 'success',
            message: `${testType} security test passed successfully`,
            timestamp
          }
        ]);
      }
    } finally {
      setIsLoading(prev => ({...prev, [testType]: false}));
    }
  };

  const getStatusIcon = (status) => {
    if (status === null) return <span className="text-gray-400">Not tested</span>;
    return status ? 
      <Check className="text-green-500 h-5 w-5" /> : 
      <X className="text-red-500 h-5 w-5" />;
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const runAllTests = async () => {
    const tests = ['encryption', 'access', 'dataProtection', 'compliance'];
    for (const test of tests) {
      await runSecurityTest(test);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            BPO Security Framework Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border border-gray-200">
              <h3 className="font-semibold mb-4 text-lg">Customer: ACME Corp</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data Encryption:</span>
                  {getStatusIcon(testResults.encryption)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Access Control:</span>
                  {getStatusIcon(testResults.access)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data Protection:</span>
                  {getStatusIcon(testResults.dataProtection)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Compliance:</span>
                  {getStatusIcon(testResults.compliance)}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border border-gray-200">
              <h3 className="font-semibold mb-4 text-lg">Security Tests</h3>
              <div className="space-y-2">
                <Button 
                  onClick={() => runSecurityTest('encryption')}
                  className="w-full"
                  disabled={isLoading.encryption}
                >
                  {isLoading.encryption ? 'Testing...' : 'Test Encryption'}
                </Button>
                <Button 
                  onClick={() => runSecurityTest('access')}
                  className="w-full"
                  disabled={isLoading.access}
                >
                  {isLoading.access ? 'Testing...' : 'Test Access Control'}
                </Button>
                <Button 
                  onClick={() => runSecurityTest('dataProtection')}
                  className="w-full"
                  disabled={isLoading.dataProtection}
                >
                  {isLoading.dataProtection ? 'Testing...' : 'Test Data Protection'}
                </Button>
                <Button 
                  onClick={() => runSecurityTest('compliance')}
                  className="w-full"
                  disabled={isLoading.compliance}
                >
                  {isLoading.compliance ? 'Testing...' : 'Test Compliance'}
                </Button>
                
                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={runAllTests}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={Object.values(isLoading).some(Boolean)}
                  >
                    Run All Tests
                  </Button>
                  <Button 
                    onClick={clearAlerts}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                    disabled={alerts.length === 0}
                  >
                    Clear Alerts
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {alerts.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Security Alerts</h3>
                <span className="text-sm text-gray-500">{alerts.length} alert(s)</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.type === 'error' ? "destructive" : "default"} className="mb-2">
                    {alert.type === 'error' ? 
                      <AlertCircle className="h-4 w-4" /> : 
                      <Check className="h-4 w-4" />
                    }
                    <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                    <AlertDescription className="flex justify-between">
                      <span>{alert.message}</span>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BPOSecurityTest; 
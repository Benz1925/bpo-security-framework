"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestResultsDetail from '@/components/security/TestResultsDetail';
import { securityTestsApi } from '@/services/api';

const BPOSecurityTest = ({ client }) => {
  const [testResults, setTestResults] = useState({
    encryption: null,
    access: null,
    dataProtection: null,
    compliance: null
  });
  
  const [testDetails, setTestDetails] = useState({
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
  
  const [selectedTest, setSelectedTest] = useState(null);

  const runSecurityTest = async (testType) => {
    // Set loading state for this specific test
    setIsLoading(prev => ({...prev, [testType]: true}));
    
    try {
      // Call the API service
      const result = await securityTestsApi.runTest(testType);
      
      // Update test results
      setTestResults(prev => ({...prev, [testType]: result.success}));
      
      // Store test details
      setTestDetails(prev => ({...prev, [testType]: result.details}));
      
      // Add alert based on result
      const timestamp = new Date().toLocaleTimeString();
      if (!result.success) {
        setAlerts(prev => [...prev, 
          {
            type: 'error',
            message: `Security alert: Potential vulnerability detected in ${testType}`,
            timestamp
          }
        ]);
      } else {
        setAlerts(prev => [...prev, 
          {
            type: 'success',
            message: `${testType} security test passed successfully`,
            timestamp
          }
        ]);
      }
      
      // Automatically select this test to show details
      setSelectedTest(testType);
    } catch (error) {
      console.error(`Error running ${testType} test:`, error);
      // Add error alert
      const timestamp = new Date().toLocaleTimeString();
      setAlerts(prev => [...prev, 
        {
          type: 'error',
          message: `Error running ${testType} test: ${error.message}`,
          timestamp
        }
      ]);
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
    <div className="space-y-4">
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
              <h3 className="font-semibold mb-4 text-lg">
                Customer: {client?.name || 'ACME Corp'}
              </h3>
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => testResults.encryption !== null && setSelectedTest('encryption')}
                >
                  <span className="font-medium">Data Encryption:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(testResults.encryption)}
                    {testResults.encryption !== null && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => testResults.access !== null && setSelectedTest('access')}
                >
                  <span className="font-medium">Access Control:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(testResults.access)}
                    {testResults.access !== null && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => testResults.dataProtection !== null && setSelectedTest('dataProtection')}
                >
                  <span className="font-medium">Data Protection:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(testResults.dataProtection)}
                    {testResults.dataProtection !== null && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => testResults.compliance !== null && setSelectedTest('compliance')}
                >
                  <span className="font-medium">Compliance:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(testResults.compliance)}
                    {testResults.compliance !== null && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
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

          {selectedTest && (
            <div className="mt-6">
              <TestResultsDetail 
                testType={selectedTest} 
                result={testResults[selectedTest]}
                details={testDetails[selectedTest]} 
              />
            </div>
          )}

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
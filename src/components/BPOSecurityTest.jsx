"use client";

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle, Check, X, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestResultsDetail from '@/components/security/TestResultsDetail';
import { securityTestsApi } from '@/services/api';

const BPOSecurityTestComponent = ({ client, hideHeader = false, addAlert }, ref) => {
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
  
  const [isLoading, setIsLoading] = useState({
    encryption: false,
    access: false,
    dataProtection: false,
    compliance: false
  });
  
  const [selectedTest, setSelectedTest] = useState(null);

  // Check if we're in the browser environment - safer way to handle client-side code
  const isBrowser = typeof window !== 'undefined';
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    runTest: (testType) => {
      handleRunTest(testType);
    },
    runAllTests: () => {
      if (isBrowser) {
        handleRunAllTests();
      }
    },
    getTestResults: () => {
      return testResults;
    }
  }));
  
  const shouldUseMockData = () => {
    // Always return true during server-side rendering
    if (!isBrowser) return true;
    
    try {
      if (window.APP_CONFIG) {
        return window.APP_CONFIG.useMockApi === true;
      }
    } catch (e) {
      console.error("Error checking APP_CONFIG:", e);
    }
    
    return true;
  };
  
  const handleRunTest = async (testType) => {
    // Don't run during SSR
    if (!isBrowser) return;
    
    if (isLoading[testType]) return;
    
    setIsLoading(prev => ({
      ...prev,
      [testType]: true
    }));
    
    try {
      // Use the generic runTest function instead of looking for specific test functions
      const result = await securityTestsApi.runTest(testType, client?.id);
      
      // Debug log to understand the response format
      console.log(`${testType} test result:`, result);
      
      setTestResults(prev => ({
        ...prev,
        [testType]: result
      }));

      // Set test details directly here
      if (result && result.details) {
        setTestDetails(prev => ({
          ...prev,
          [testType]: result.details
        }));
      }
      
      if (addAlert) {
        addAlert({
          type: result && result.success === true ? 'success' : 'error',
          message: result && result.success === true
            ? `${testType.charAt(0).toUpperCase() + testType.slice(1)} test completed successfully.` 
            : `${testType.charAt(0).toUpperCase() + testType.slice(1)} test failed.`
        });
      }
      
      // Set selected test after details are available
      setSelectedTest(testType);
    } catch (error) {
      console.error(`Error running ${testType} test:`, error);
      // Create a properly formatted error result
      const errorResult = {
        success: false,
        testType: testType,
        timestamp: new Date().toISOString(),
        details: {
          title: `${testType.charAt(0).toUpperCase() + testType.slice(1)} Test Failed`,
          description: `An error occurred: ${error.message}`,
          checkpoints: [],
          recommendations: ['Try again later', 'Contact support if the issue persists']
        }
      };
      
      setTestResults(prev => ({
        ...prev,
        [testType]: errorResult
      }));

      // Set error details
      setTestDetails(prev => ({
        ...prev,
        [testType]: errorResult.details
      }));
      
      if (addAlert) {
        addAlert({
          type: 'error',
          message: `Error running ${testType} test: ${error.message}`
        });
      }
    } finally {
      setIsLoading(prev => ({
        ...prev,
        [testType]: false
      }));
    }
  };
  
  const handleViewTestDetails = (testType) => {
    // Simply set the selected test type
    setSelectedTest(testType);
  };
  
  const getTestStatusIcon = (status) => {
    if (status === null) return null;
    if (status.success === true) return <Check className="h-5 w-5 text-green-500" />;
    return <X className="h-5 w-5 text-red-500" />;
  };
  
  const handleRunAllTests = async () => {
    // Don't run during SSR
    if (!isBrowser) return;
    
    const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
    
    // Set all to loading
    setIsLoading({
      encryption: true,
      access: true,
      dataProtection: true,
      compliance: true
    });
    
    if (addAlert) {
      addAlert({
        type: 'info',
        message: 'Running all security tests. This may take a minute...'
      });
    }
    
    // Run each test in sequence
    for (const testType of testTypes) {
      try {
        // Use the generic runTest function
        const result = await securityTestsApi.runTest(testType, client?.id);
        
        // Ensure the result is properly formatted
        const formattedResult = result && typeof result === 'object' 
          ? result 
          : { 
              success: false, 
              testType, 
              timestamp: new Date().toISOString(),
              details: {
                title: `${testType.charAt(0).toUpperCase() + testType.slice(1)} Test`,
                description: 'Unable to get test details',
                checkpoints: [],
                recommendations: []
              }
            };
            
        setTestResults(prev => ({
          ...prev,
          [testType]: formattedResult
        }));
        
        // Store details directly from the result
        if (formattedResult && formattedResult.details) {
          setTestDetails(prev => ({
            ...prev,
            [testType]: formattedResult.details
          }));
        }
        
      } catch (error) {
        console.error(`Error running ${testType} test:`, error);
        
        // Create a properly formatted error result
        const errorResult = {
          success: false,
          testType: testType,
          timestamp: new Date().toISOString(),
          details: {
            title: `${testType.charAt(0).toUpperCase() + testType.slice(1)} Test Failed`,
            description: `An error occurred: ${error.message}`,
            checkpoints: [],
            recommendations: ['Try again later', 'Contact support if the issue persists']
          }
        };
        
        setTestResults(prev => ({
          ...prev,
          [testType]: errorResult
        }));
        
        setTestDetails(prev => ({
          ...prev,
          [testType]: errorResult.details
        }));
      } finally {
        setIsLoading(prev => ({
          ...prev,
          [testType]: false
        }));
      }
    }
    
    if (addAlert) {
      addAlert({
        type: 'success',
        message: 'All security tests completed.'
      });
    }
  };
  
  // Add a simple header when hideHeader is true that just shows a "Run All Tests" button
  if (hideHeader) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2">
          <Button
            onClick={handleRunAllTests}
            disabled={Object.values(isLoading).some(Boolean)}
            className="flex items-center gap-1"
          >
            {Object.values(isLoading).some(Boolean) ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All Tests
          </Button>
        </div>
        
        {selectedTest && testDetails[selectedTest] && (
          <TestResultsDetail 
            testType={selectedTest}
            details={testDetails[selectedTest]}
            onBack={() => setSelectedTest(null)}
            result={testResults[selectedTest]}
          />
        )}
        
        {!selectedTest && (
          <div className="space-y-3">
            {/* Test Cards */}
            {['encryption', 'access', 'dataProtection', 'compliance'].map((testType) => (
              <Card key={testType} className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">
                      {testType.charAt(0).toUpperCase() + testType.slice(1)} Test
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(testResults[testType])}
                      <Button 
                        onClick={() => handleRunTest(testType)}
                        disabled={isLoading[testType]}
                        size="sm"
                        variant="outline"
                        className="h-8"
                      >
                        {isLoading[testType] ? (
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Run Test'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm text-gray-500">
                    {testType === 'encryption' && 'Verifies that all sensitive data is properly encrypted.'}
                    {testType === 'access' && 'Checks for proper access controls and authentication.'}
                    {testType === 'dataProtection' && 'Ensures data protection mechanisms are in place.'}
                    {testType === 'compliance' && 'Validates compliance with security standards.'}
                  </p>
                  
                  {testResults[testType] !== null && (
                    <div className="mt-2 flex justify-end">
                      <Button 
                        onClick={() => handleViewTestDetails(testType)} 
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 h-7 px-2"
                      >
                        View Details <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-600" /> 
              BPO Security Tests
            </CardTitle>
            <Button
              onClick={handleRunAllTests}
              disabled={Object.values(isLoading).some(Boolean)}
              className="flex items-center gap-1"
            >
              {Object.values(isLoading).some(Boolean) ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run All Tests
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {selectedTest && testDetails[selectedTest] && (
            <TestResultsDetail 
              testType={selectedTest}
              details={testDetails[selectedTest]}
              onBack={() => setSelectedTest(null)}
              result={testResults[selectedTest]}
            />
          )}
          
          {!selectedTest && (
            <div className="space-y-3">
              {/* Test Cards */}
              {['encryption', 'access', 'dataProtection', 'compliance'].map((testType) => (
                <Card key={testType} className="shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">
                        {testType.charAt(0).toUpperCase() + testType.slice(1)} Test
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getTestStatusIcon(testResults[testType])}
                        <Button 
                          onClick={() => handleRunTest(testType)}
                          disabled={isLoading[testType]}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          {isLoading[testType] ? (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Run Test'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-500">
                      {testType === 'encryption' && 'Verifies that all sensitive data is properly encrypted.'}
                      {testType === 'access' && 'Checks for proper access controls and authentication.'}
                      {testType === 'dataProtection' && 'Ensures data protection mechanisms are in place.'}
                      {testType === 'compliance' && 'Validates compliance with security standards.'}
                    </p>
                    
                    {testResults[testType] !== null && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          onClick={() => handleViewTestDetails(testType)} 
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 h-7 px-2"
                        >
                          View Details <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BPOSecurityTest = forwardRef(BPOSecurityTestComponent);

export default BPOSecurityTest; 
"use client";

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle, Check, X, ChevronRight } from 'lucide-react';
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
      
      // Add alert using the provided addAlert function instead of local state
      if (!result.success) {
        addAlert('error', `Security alert: Potential vulnerability detected in ${testType}`);
      } else {
        addAlert('success', `${testType} security test passed successfully`);
      }
      
      // Automatically select this test to show details
      setSelectedTest(testType);
    } catch (error) {
      console.error(`Error running ${testType} test:`, error);
      // Add error alert using the provided addAlert function
      addAlert('error', `Error running ${testType} test: ${error.message}`);
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

  const runAllTests = async () => {
    const tests = ['encryption', 'access', 'dataProtection', 'compliance'];
    for (const test of tests) {
      await runSecurityTest(test);
    }
  };

  // Expose runAllTests function to parent
  useImperativeHandle(ref, () => ({
    runAllTests
  }));

  return (
    <>
      {!hideHeader ? (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Security Tests</h2>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={Object.values(isLoading).some(Boolean)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Run All Tests
              {Object.values(isLoading).some(Boolean) && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </Button>
          </div>
          <p className="text-gray-500 text-sm">
            Run security tests to identify vulnerabilities and ensure compliance
          </p>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={runAllTests}
            disabled={Object.values(isLoading).some(Boolean)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Run All Tests
            {Object.values(isLoading).some(Boolean) && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {/* Test cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Encryption Test */}
          <SecurityTestCard 
            title="Encryption Test"
            description="Verifies that all sensitive data is properly encrypted at rest and in transit"
            status={testResults.encryption}
            isLoading={isLoading.encryption}
            onRunTest={() => runSecurityTest('encryption')}
            onViewDetails={() => setSelectedTest('encryption')}
            icon={<Shield className="h-5 w-5" />}
            iconBg="bg-blue-100 text-blue-600"
          />
          
          {/* Access Control Test */}
          <SecurityTestCard 
            title="Access Control Test"
            description="Checks user permissions, authentication, and authorization controls"
            status={testResults.access}
            isLoading={isLoading.access}
            onRunTest={() => runSecurityTest('access')}
            onViewDetails={() => setSelectedTest('access')}
            icon={<Shield className="h-5 w-5" />}
            iconBg="bg-green-100 text-green-600"
          />
          
          {/* Data Protection Test */}
          <SecurityTestCard 
            title="Data Protection Test"
            description="Evaluates data handling practices, retention policies, and protection measures"
            status={testResults.dataProtection}
            isLoading={isLoading.dataProtection}
            onRunTest={() => runSecurityTest('dataProtection')}
            onViewDetails={() => setSelectedTest('dataProtection')}
            icon={<Shield className="h-5 w-5" />}
            iconBg="bg-purple-100 text-purple-600"
          />
          
          {/* Compliance Test */}
          <SecurityTestCard 
            title="Compliance Test"
            description="Ensures adherence to relevant compliance standards and regulations"
            status={testResults.compliance}
            isLoading={isLoading.compliance}
            onRunTest={() => runSecurityTest('compliance')}
            onViewDetails={() => setSelectedTest('compliance')}
            icon={<Shield className="h-5 w-5" />}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>
        
        {/* Test Results Detail */}
        {selectedTest && testDetails[selectedTest] && (
          <Card className="border border-gray-100 shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {testDetails[selectedTest].title || `${selectedTest.charAt(0).toUpperCase() + selectedTest.slice(1)} Test`}
                <span className={`ml-2 text-sm px-2 py-1 rounded-full ${testResults[selectedTest] ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {testResults[selectedTest] ? 'Passed' : 'Failed'}
                </span>
              </CardTitle>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setSelectedTest(null)}
                className="text-sm"
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Test Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Overall Score</span>
                    <span className="text-2xl font-bold">{testDetails[selectedTest].overallScore ?? 0}%</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Compliance Status</span>
                    <span className="text-lg font-medium">{testDetails[selectedTest].complianceStatus || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Next Test Date</span>
                    <span className="text-lg font-medium">{testDetails[selectedTest].nextTestDate || 'Not scheduled'}</span>
                  </div>
                </div>
                
                {/* Test Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-800">
                    {testDetails[selectedTest].description || 'No description available.'}
                  </p>
                </div>
                
                {/* Test Checkpoints */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Security Checkpoints</h4>
                  {testDetails[selectedTest].checkpoints && testDetails[selectedTest].checkpoints.length > 0 ? (
                    <div className="space-y-3">
                      {testDetails[selectedTest].checkpoints.map((checkpoint, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-md border ${
                            checkpoint.status 
                              ? 'border-green-100 bg-green-50' 
                              : checkpoint.severity && checkpoint.severity.toLowerCase() === 'critical'
                                ? 'border-red-200 bg-red-100'
                                : checkpoint.severity && checkpoint.severity.toLowerCase() === 'high'
                                  ? 'border-amber-200 bg-amber-100'
                                  : 'border-red-100 bg-red-50'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-start gap-2">
                              {checkpoint.status ? (
                                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mt-0.5" />
                              )}
                              <div>
                                <h5 className="font-medium text-gray-800">{checkpoint.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">{checkpoint.details}</p>
                              </div>
                            </div>
                            {checkpoint.severity && (
                              <span className={`text-xs px-2 py-1 rounded-full h-fit ${getSeverityClass(checkpoint.severity)}`}>
                                {checkpoint.severity}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No checkpoint data available.</p>
                  )}
                </div>
                
                {/* Recommendations */}
                {testDetails[selectedTest].recommendations && testDetails[selectedTest].recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Recommendations</h4>
                    <div className="space-y-3">
                      {testDetails[selectedTest].recommendations.map((rec, index) => (
                        <div key={index} className={`p-4 border border-gray-100 rounded-md shadow-sm ${rec.priority && (rec.priority.toLowerCase() === 'critical' || rec.priority.toLowerCase() === 'high') ? 'bg-orange-50' : 'bg-white'}`}>
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-800">{rec.title}</h5>
                            {rec.priority && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getSeverityClass(rec.priority)}`}>
                                {rec.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{rec.description}</p>
                          {rec.link && (
                            <a 
                              href={rec.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-3"
                            >
                              Learn More <ChevronRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

// Wrap with forwardRef
const BPOSecurityTest = forwardRef(BPOSecurityTestComponent);

// Security Test Card Component
const SecurityTestCard = ({ 
  title, 
  description, 
  status, 
  isLoading, 
  onRunTest, 
  onViewDetails,
  icon,
  iconBg = 'bg-blue-100 text-blue-600' 
}) => {
  const getStatusDisplay = () => {
    if (status === null) return <span className="text-gray-500">Not Tested</span>
    return status ? (
      <span className="text-green-600 flex items-center gap-1">
        <Check className="h-4 w-4" /> Passed
      </span>
    ) : (
      <span className="text-red-600 flex items-center gap-1">
        <X className="h-4 w-4" /> Failed
      </span>
    );
  };
  
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${iconBg}`}>
                {icon}
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-4">
            <div>
              {isLoading ? (
                <span className="text-gray-500 flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Testing...
                </span>
              ) : (
                getStatusDisplay()
              )}
            </div>
            <div className="flex gap-2">
              {status !== null && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewDetails}
                  disabled={isLoading}
                  className="text-xs"
                >
                  View Details
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={onRunTest}
                disabled={isLoading}
                className="text-xs"
              >
                Run Test
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get severity class
const getSeverityClass = (severity) => {
  severity = severity.toLowerCase();
  if (severity === 'critical') return 'bg-red-200 text-red-700 font-semibold';
  if (severity === 'high') return 'bg-amber-200 text-amber-700';
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-700';
  if (severity === 'low') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
};

export default BPOSecurityTest; 
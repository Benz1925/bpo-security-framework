"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Check, X, BarChart, PieChart, Calendar, RefreshCw } from 'lucide-react';
import { securityTestsApi } from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SecurityDashboard = ({ client }) => {
  const [dashboardData, setDashboardData] = useState({
    overallScore: 0,
    testResults: {
      encryption: null,
      access: null,
      dataProtection: null,
      compliance: null
    },
    criticalIssues: 0,
    lastUpdated: null,
    isLoading: true,
    error: null,
    isMock: false
  });
  
  // Use this to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if we should use mock data from config - only run on client
  const shouldUseMockData = () => {
    // Always return true during server-side rendering to avoid hydration errors
    if (!isMounted) return true;
    
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      console.log("APP_CONFIG detected:", window.APP_CONFIG);
      return window.APP_CONFIG.useMockApi === true;
    }
    
    // Default to mock data if config is not available
    return true;
  };
  
  // Function to generate mock dashboard data
  const generateMockDashboardData = (errorMessage = null) => {
    console.log("Generating mock dashboard data", errorMessage ? `due to error: ${errorMessage}` : "");
    const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
    const results = {};
    let totalScore = 0;
    let criticalCount = 0;
    
    // Use client ID as seed for deterministic results
    const clientId = client?.id || '1';
    
    // Generate mock results for each test type
    for (const testType of testTypes) {
      // Use deterministic success based on client ID and test type
      const success = ((parseInt(clientId) + testType.length) % 3) !== 0;
      const mockDetails = getMockTestDetails(testType, success, clientId);
      results[testType] = {
        success,
        testType,
        timestamp: new Date().toISOString(),
        details: mockDetails,
        isMock: true
      };
      
      // Add to total score (deterministic score based on client ID)
      const score = mockDetails.overallScore;
      totalScore += score;
      
      // Count critical issues
      if (mockDetails.recommendations) {
        const criticalRecs = Array.isArray(mockDetails.recommendations) 
          ? mockDetails.recommendations.filter(rec => 
              typeof rec === 'object' && (rec.priority === 'critical' || rec.priority === 'high')
            )
          : [];
        criticalCount += criticalRecs.length;
      }
    }
    
    // Calculate overall score
    const overallScore = Math.round(totalScore / testTypes.length);
    
    setDashboardData({
      overallScore,
      testResults: results,
      criticalIssues: criticalCount,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: errorMessage,
      isMock: true
    });
  };
  
  // Set isMounted to true when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    // Generate mock data immediately after mounting to ensure we have data
    if (typeof window !== 'undefined') {
      console.log("Component mounted, generating initial mock data");
      generateMockDashboardData();
    }
  }, []);

  // Fetch data for the dashboard
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isMounted) return;
    if (!client) return;
    
    console.log("Starting dashboard data fetch for client:", client);
    
    const fetchDashboardData = async () => {
      // Check if we should use mock data immediately
      if (shouldUseMockData()) {
        console.log("Mock mode enabled in config, using mock data immediately");
        generateMockDashboardData();
        return;
      }
      
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Set a timeout to ensure we don't wait forever
      const timeoutId = setTimeout(() => {
        console.log("API fetch timeout - falling back to mock data");
        generateMockDashboardData("API request timed out");
      }, typeof window !== 'undefined' && window.APP_CONFIG?.apiTimeout ? window.APP_CONFIG.apiTimeout : 5000);
      
      try {
        // Fetch results for each test type
        const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
        const results = {};
        let totalScore = 0;
        let criticalCount = 0;
        let apiSucceeded = false;
        
        for (const testType of testTypes) {
          try {
            console.log(`Fetching ${testType} data...`);
            const result = await securityTestsApi.runTest(testType, client.id);
            console.log(`Received ${testType} data:`, result);
            
            // Check if this is mock data from the API fallback
            if (result.isMock) {
              console.log(`Received mock data for ${testType} from API fallback`);
            } else {
              apiSucceeded = true;
            }
            
            results[testType] = result;
            
            // Add to total score
            if (result.details && result.details.overallScore) {
              totalScore += result.details.overallScore;
            }
            
            // Count critical issues
            if (result.details && result.details.recommendations) {
              const criticalRecs = Array.isArray(result.details.recommendations) 
                ? result.details.recommendations.filter(rec => 
                    typeof rec === 'object' && (rec.priority === 'critical' || rec.priority === 'high')
                  )
                : [];
              criticalCount += criticalRecs.length;
            }
          } catch (error) {
            console.error(`Error fetching ${testType} data:`, error);
            // Continue with other tests even if one fails
            results[testType] = { 
              success: false, 
              error: error.message,
              isMock: true,
              details: getMockTestDetails(testType, false, client?.id || '1')
            };
          }
        }
        
        // Clear the timeout since we got data
        clearTimeout(timeoutId);
        
        // Calculate overall score
        const overallScore = Math.round(totalScore / testTypes.length);
        
        setDashboardData({
          overallScore,
          testResults: results,
          criticalIssues: criticalCount,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: null,
          isMock: !apiSucceeded
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        clearTimeout(timeoutId);
        generateMockDashboardData(error.message);
      }
    };
    
    fetchDashboardData();
  }, [client, isMounted]);

  // Manually refresh the dashboard
  const refreshDashboard = () => {
    if (!isMounted) return;
    
    setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
    // Re-trigger the useEffect
    const clientCopy = {...client};
    setTimeout(() => {
      // Force a re-render by creating a new client object
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('force-dashboard-refresh', { detail: clientCopy }));
      }
    }, 100);
  };

  // Get status color based on score
  const getStatusColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get background color based on score
  const getStatusBgColor = (score) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 70) return 'bg-yellow-50';
    if (score >= 50) return 'bg-orange-50';
    return 'bg-red-50';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // If not mounted yet (server-side), render a simple placeholder
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Security Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-block rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Security Dashboard
            {dashboardData.isMock && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                Mock Data
              </span>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            disabled={dashboardData.isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${dashboardData.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {dashboardData.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : dashboardData.error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  API connection issue: {dashboardData.error}
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-gray-500 mb-4">Showing mock data instead</p>
              
              {/* Display mock data anyway */}
              {renderDashboardContent()}
            </div>
          ) : (
            renderDashboardContent()
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  function renderDashboardContent() {
    return (
      <>
        {/* Overall Security Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`col-span-1 p-4 rounded-lg ${getStatusBgColor(dashboardData.overallScore)} border`}>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Overall Security Score</h3>
              <div className={`text-4xl font-bold ${getStatusColor(dashboardData.overallScore)}`}>
                {dashboardData.overallScore}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Last updated: {formatDate(dashboardData.lastUpdated)}
              </p>
            </div>
          </div>
          
          <div className="col-span-1 p-4 rounded-lg bg-white border">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Critical Issues</h3>
              <div className="text-4xl font-bold text-red-600">
                {dashboardData.criticalIssues}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Issues requiring immediate attention
              </p>
            </div>
          </div>
          
          <div className="col-span-1 p-4 rounded-lg bg-white border">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Client</h3>
              <div className="text-xl font-bold">
                {client?.name || 'All Clients'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {client?.industry || 'Multiple Industries'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Test Results Summary */}
        <h3 className="text-lg font-medium mb-3">Security Tests Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(dashboardData.testResults).map(([testType, result]) => {
            if (!result) return null;
            
            const score = result.details?.overallScore || 0;
            const statusColor = getStatusColor(score);
            const statusBg = getStatusBgColor(score);
            
            return (
              <div key={testType} className={`p-4 rounded-lg border ${statusBg}`}>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    {result.details?.title || testType.charAt(0).toUpperCase() + testType.slice(1)}
                  </h4>
                  <div className={`font-bold ${statusColor}`}>
                    {score}%
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Status: {result.details?.complianceStatus || (result.success ? 'Passed' : 'Failed')}
                  </span>
                  {result.success ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />
                  }
                </div>
                {result.details?.recommendations && (
                  <div className="mt-2 text-sm text-gray-600">
                    {Array.isArray(result.details.recommendations) ? result.details.recommendations.length : 0} recommendation(s)
                  </div>
                )}
                {result.isMock && (
                  <div className="mt-2 text-xs text-yellow-600">
                    Mock data
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            View Detailed Reports
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            Export Dashboard
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Schedule Tests
          </Button>
        </div>
      </>
    );
  }
};

// Helper function to generate mock test details with deterministic values
function getMockTestDetails(testType, success, clientId = '1') {
  // Convert clientId to a number to use as seed
  const seed = parseInt(clientId, 10) || 1;
  
  // Generate deterministic score based on client ID and test type
  const getScore = (offset) => {
    // Generate a score between 60-95 based on clientId and test type
    return 60 + ((seed + testType.length + offset) % 36);
  };
  
  // Generate deterministic boolean based on seed
  const getBool = (offset) => {
    return ((seed + offset + testType.length) % 4) !== 0;
  };
  
  const testDetails = {
    encryption: {
      title: 'Data Encryption Test',
      description: 'Verifies that all sensitive data is properly encrypted at rest and in transit.',
      checkpoints: [
        { name: 'TLS 1.2+ for all connections', status: success ? true : getBool(1) },
        { name: 'AES-256 encryption for stored data', status: success ? true : getBool(2) },
        { name: 'Proper key management', status: success ? true : getBool(3) },
        { name: 'Encrypted database backups', status: success ? true : getBool(4) }
      ],
      recommendations: [
        { title: 'Implement TLS 1.3', description: 'Upgrade to TLS 1.3 for all connections', priority: 'medium' },
        { title: 'Rotate encryption keys', description: 'Set up automatic key rotation every 90 days', priority: 'high' }
      ],
      overallScore: getScore(0),
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    access: {
      title: 'Access Control Test',
      description: 'Evaluates the effectiveness of access controls and authentication mechanisms.',
      checkpoints: [
        { name: 'Multi-factor authentication', status: success ? true : getBool(5) },
        { name: 'Role-based access control', status: success ? true : getBool(6) },
        { name: 'Least privilege principle', status: success ? true : getBool(7) },
        { name: 'Regular access reviews', status: success ? true : getBool(8) }
      ],
      recommendations: [
        { title: 'Enable MFA', description: 'Implement multi-factor authentication for all users', priority: 'critical' },
        { title: 'Review permissions', description: 'Conduct quarterly access reviews', priority: 'medium' }
      ],
      overallScore: getScore(1),
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    dataProtection: {
      title: 'Data Protection Test',
      description: 'Assesses data protection measures including backup, retention, and DLP.',
      checkpoints: [
        { name: 'Data loss prevention policies', status: success ? true : getBool(9) },
        { name: 'Regular backup verification', status: success ? true : getBool(10) },
        { name: 'Data classification', status: success ? true : getBool(11) },
        { name: 'Data retention policies', status: success ? true : getBool(12) }
      ],
      recommendations: [
        { title: 'Implement DLP', description: 'Deploy data loss prevention solution', priority: 'high' },
        { title: 'Test backups', description: 'Implement monthly backup restoration tests', priority: 'medium' }
      ],
      overallScore: getScore(2),
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    compliance: {
      title: 'Compliance Test',
      description: 'Verifies adherence to relevant regulatory and industry compliance standards.',
      checkpoints: [
        { name: 'GDPR compliance', status: success ? true : getBool(13) },
        { name: 'ISO 27001 controls', status: success ? true : getBool(14) },
        { name: 'SOC 2 requirements', status: success ? true : getBool(15) },
        { name: 'Industry-specific regulations', status: success ? true : getBool(16) }
      ],
      recommendations: [
        { title: 'Document controls', description: 'Create comprehensive compliance documentation', priority: 'high' },
        { title: 'Regular audits', description: 'Schedule quarterly compliance reviews', priority: 'medium' }
      ],
      overallScore: getScore(3),
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    }
  };

  return testDetails[testType] || {
    title: 'Unknown Test',
    description: 'No details available for this test.',
    checkpoints: [],
    recommendations: [],
    overallScore: 50,
    complianceStatus: 'Unknown'
  };
}

export default SecurityDashboard; 
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Check, X, BarChart, PieChart, Calendar } from 'lucide-react';
import { securityTestsApi } from '@/services/api';

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
    error: null
  });

  // Fetch data for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!client) return;
      
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Set a timeout to ensure we don't wait forever
      const timeoutId = setTimeout(() => {
        console.log("API fetch timeout - falling back to mock data");
        generateMockDashboardData();
      }, 5000); // 5 second timeout
      
      try {
        // Fetch results for each test type
        const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
        const results = {};
        let totalScore = 0;
        let criticalCount = 0;
        
        for (const testType of testTypes) {
          try {
            console.log(`Fetching ${testType} data...`);
            const result = await securityTestsApi.runTest(testType, client.id);
            console.log(`Received ${testType} data:`, result);
            results[testType] = result;
            
            // Add to total score
            if (result.details && result.details.overallScore) {
              totalScore += result.details.overallScore;
            }
            
            // Count critical issues
            if (result.details && result.details.recommendations) {
              const criticalRecs = result.details.recommendations.filter(
                rec => rec.priority === 'critical' || rec.priority === 'high'
              );
              criticalCount += criticalRecs.length;
            }
          } catch (error) {
            console.error(`Error fetching ${testType} data:`, error);
            // Continue with other tests even if one fails
            results[testType] = { 
              success: false, 
              error: error.message,
              isMock: true,
              details: getMockTestDetails(testType, false)
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
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        clearTimeout(timeoutId);
        generateMockDashboardData(error.message);
      }
    };
    
    const generateMockDashboardData = (errorMessage = null) => {
      console.log("Generating mock dashboard data");
      const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
      const results = {};
      let totalScore = 0;
      let criticalCount = 0;
      
      // Generate mock results for each test type
      for (const testType of testTypes) {
        const success = Math.random() > 0.3;
        const mockDetails = getMockTestDetails(testType, success);
        results[testType] = {
          success,
          testType,
          timestamp: new Date().toISOString(),
          details: mockDetails,
          isMock: true
        };
        
        // Add to total score (random score between 60-95)
        const score = Math.floor(Math.random() * 35) + 60;
        totalScore += score;
        
        // Count critical issues
        if (mockDetails.recommendations) {
          const criticalRecs = mockDetails.recommendations.filter(
            rec => rec.priority === 'critical' || rec.priority === 'high'
          );
          criticalCount += criticalRecs.length || Math.floor(Math.random() * 2) + 1;
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
    
    fetchDashboardData();
  }, [client]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Security Dashboard
            {dashboardData.isMock && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                Mock Data
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : dashboardData.error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-gray-700">API connection issue: {dashboardData.error}</p>
              <p className="text-sm text-gray-500 mt-2">Showing mock data instead</p>
              
              {/* Display mock data anyway */}
              <div className="mt-6">
                {renderDashboardContent()}
              </div>
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
                    {result.details.recommendations.length} recommendation(s)
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

// Helper function to generate mock test details
function getMockTestDetails(testType, success) {
  const testDetails = {
    encryption: {
      title: 'Data Encryption Test',
      description: 'Verifies that all sensitive data is properly encrypted at rest and in transit.',
      checkpoints: [
        { name: 'TLS 1.2+ for all connections', status: success ? true : Math.random() > 0.3 },
        { name: 'AES-256 encryption for stored data', status: success ? true : Math.random() > 0.3 },
        { name: 'Proper key management', status: success ? true : Math.random() > 0.3 },
        { name: 'Encrypted database backups', status: success ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        { title: 'Implement TLS 1.3', description: 'Upgrade to TLS 1.3 for all connections', priority: 'medium' },
        { title: 'Rotate encryption keys', description: 'Set up automatic key rotation every 90 days', priority: 'high' }
      ],
      overallScore: Math.floor(Math.random() * 35) + 60,
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    access: {
      title: 'Access Control Test',
      description: 'Evaluates the effectiveness of access controls and authentication mechanisms.',
      checkpoints: [
        { name: 'Multi-factor authentication', status: success ? true : Math.random() > 0.3 },
        { name: 'Role-based access control', status: success ? true : Math.random() > 0.3 },
        { name: 'Least privilege principle', status: success ? true : Math.random() > 0.3 },
        { name: 'Regular access reviews', status: success ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        { title: 'Enable MFA', description: 'Implement multi-factor authentication for all users', priority: 'critical' },
        { title: 'Review permissions', description: 'Conduct quarterly access reviews', priority: 'medium' }
      ],
      overallScore: Math.floor(Math.random() * 35) + 60,
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    dataProtection: {
      title: 'Data Protection Test',
      description: 'Assesses data protection measures including backup, retention, and DLP.',
      checkpoints: [
        { name: 'Data loss prevention policies', status: success ? true : Math.random() > 0.3 },
        { name: 'Regular backup verification', status: success ? true : Math.random() > 0.3 },
        { name: 'Data classification', status: success ? true : Math.random() > 0.3 },
        { name: 'Data retention policies', status: success ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        { title: 'Implement DLP', description: 'Deploy data loss prevention solution', priority: 'high' },
        { title: 'Test backups', description: 'Implement monthly backup restoration tests', priority: 'medium' }
      ],
      overallScore: Math.floor(Math.random() * 35) + 60,
      complianceStatus: success ? 'Compliant' : 'Non-compliant'
    },
    compliance: {
      title: 'Compliance Test',
      description: 'Verifies adherence to relevant regulatory and industry compliance standards.',
      checkpoints: [
        { name: 'GDPR compliance', status: success ? true : Math.random() > 0.3 },
        { name: 'ISO 27001 controls', status: success ? true : Math.random() > 0.3 },
        { name: 'SOC 2 requirements', status: success ? true : Math.random() > 0.3 },
        { name: 'Industry-specific regulations', status: success ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        { title: 'Document controls', description: 'Create comprehensive compliance documentation', priority: 'high' },
        { title: 'Regular audits', description: 'Schedule quarterly compliance reviews', priority: 'medium' }
      ],
      overallScore: Math.floor(Math.random() * 35) + 60,
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
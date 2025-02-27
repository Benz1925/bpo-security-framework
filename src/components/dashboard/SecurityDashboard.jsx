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
    isLoading: true
  });

  // Fetch data for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!client) return;
      
      setDashboardData(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Fetch results for each test type
        const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
        const results = {};
        let totalScore = 0;
        let criticalCount = 0;
        
        for (const testType of testTypes) {
          try {
            const result = await securityTestsApi.runTest(testType, client.id);
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
            results[testType] = { success: false, error: error.message };
          }
        }
        
        // Calculate overall score
        const overallScore = Math.round(totalScore / testTypes.length);
        
        setDashboardData({
          overallScore,
          testResults: results,
          criticalIssues: criticalCount,
          lastUpdated: new Date().toISOString(),
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.message
        }));
      }
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : dashboardData.error ? (
            <div className="text-center py-8 text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading dashboard: {dashboardData.error}</p>
              <Button 
                className="mt-4"
                onClick={() => setDashboardData(prev => ({ ...prev, isLoading: true }))}
              >
                Retry
              </Button>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard; 
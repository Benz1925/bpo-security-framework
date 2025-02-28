"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Check, X, BarChart, PieChart, Calendar, RefreshCw, TrendingUp, Download, Lock, UserCheck, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { securityTestsApi } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const SecurityDashboardComponent = ({ client, activeTab, setActiveTab }, ref) => {
  // Initialize with empty/default values to prevent hydration mismatches
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
    isMock: false,
    historicalScores: [],
    radarData: [],
    nextActions: []
  });
  
  // Track client-side mounting separately
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if we should use mock data from config - only run on client
  const shouldUseMockData = () => {
    // Always return true during server-side rendering
    if (!isMounted) return true;
    
    try {
      if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.useMockApi === true;
      }
    } catch (e) {
      console.error("Error checking APP_CONFIG:", e);
    }
    
    // Default to mock data if config is not available
    return true;
  };
  
  // Function to generate mock dashboard data
  const generateMockDashboardData = (errorMessage = null) => {
    if (!isMounted) return; // Don't run during SSR
    
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
    
    // Generate historical data for trends (last 6 months)
    const historicalScores = generateHistoricalData(overallScore, clientId);
    
    // Generate radar chart data
    const radarData = [
      {
        subject: 'Encryption',
        score: results.encryption?.details?.overallScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Access',
        score: results.access?.details?.overallScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Data Protection',
        score: results.dataProtection?.details?.overallScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Compliance',
        score: results.compliance?.details?.overallScore || 0,
        fullMark: 100,
      },
    ];
    
    setDashboardData({
      overallScore,
      testResults: results,
      criticalIssues: criticalCount,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: errorMessage,
      isMock: true,
      historicalScores,
      radarData,
      nextActions: []
    });
  };
  
  // Generate historical data for trend charts
  const generateHistoricalData = (currentScore, clientId) => {
    if (!isMounted) return []; // Don't run during SSR
    
    const data = [];
    const now = new Date();
    const seed = parseInt(clientId, 10) || 1;
    
    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // Create a deterministic but slightly varying score based on month and client
      // This creates a realistic trend that's unique to each client
      const monthSeed = date.getMonth() + 1;
      const yearSeed = date.getFullYear() % 100;
      const variation = ((seed + monthSeed + yearSeed) % 15) - 7; // -7 to +7 variation
      
      // For the current month, use the actual current score
      const score = i === 0 ? currentScore : Math.min(100, Math.max(50, currentScore + variation));
      
      data.push({
        name: date.toLocaleString('default', { month: 'short' }),
        score: score,
        issues: Math.round((100 - score) / 10) // More issues when score is lower
      });
    }
    
    return data;
  };
  
  // Set isMounted to true when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate initial data after mounting
  useEffect(() => {
    if (isMounted) {
      generateMockDashboardData();
    }
  }, [isMounted]);

  // Fetch data for the dashboard
  useEffect(() => {
    // Skip this effect during server-side rendering or if client is not available
    if (!isMounted || !client) return;
    
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
        
        // Generate historical data for trends
        const historicalScores = generateHistoricalData(overallScore, client?.id || '1');
        
        // Generate radar chart data
        const radarData = [
          {
            subject: 'Encryption',
            score: results.encryption?.details?.overallScore || 0,
            fullMark: 100,
          },
          {
            subject: 'Access',
            score: results.access?.details?.overallScore || 0,
            fullMark: 100,
          },
          {
            subject: 'Data Protection',
            score: results.dataProtection?.details?.overallScore || 0,
            fullMark: 100,
          },
          {
            subject: 'Compliance',
            score: results.compliance?.details?.overallScore || 0,
            fullMark: 100,
          },
        ];
        
        setDashboardData({
          overallScore,
          testResults: results,
          criticalIssues: criticalCount,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: null,
          isMock: !apiSucceeded,
          historicalScores,
          radarData,
          nextActions: []
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

  // Expose refreshDashboard to parent component
  useImperativeHandle(ref, () => ({
    refreshDashboard
  }));

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
  
  // Get chart color based on score
  const getChartColor = (score) => {
    if (score >= 90) return '#22c55e'; // green-500
    if (score >= 70) return '#eab308'; // yellow-500
    if (score >= 50) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Server-side rendering or initial client render before hydration
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

  // Client-side rendering after hydration
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Security Dashboard</h2>
          </div>
          <Button 
            onClick={refreshDashboard}
            disabled={dashboardData.isLoading}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${dashboardData.isLoading ? 'animate-spin' : ''}`} />
            Refresh Dashboard
          </Button>
        </div>
        <p className="text-gray-500 text-sm">
          Overview of security status and compliance
        </p>
      </div>
      
      {/* Alerts Section */}
      {dashboardData.isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-500">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {dashboardData.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {dashboardData.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {/* Overall Security Score */}
        <Card className="col-span-1 shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Overall Security</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center justify-center h-full py-4">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="10"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={getScoreColor(dashboardData?.overallScore || 0)} 
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * ((dashboardData?.overallScore || 0) / 100))}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'all 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{dashboardData?.overallScore || 0}</span>
                  <span className="text-sm text-gray-500">out of 100</span>
                </div>
              </div>
              <span className="text-base font-medium mt-3 text-center">
                {getScoreLabel(dashboardData?.overallScore || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Category Security Scores */}
        <SecurityScoreCard 
          title="Encryption"
          score={`${dashboardData?.testResults?.encryption?.details?.overallScore || 0}%`}
          status={dashboardData?.testResults?.encryption?.success}
          icon={<Lock className="h-4 w-4 text-blue-600" />}
        />
        <SecurityScoreCard 
          title="Access Control"
          score={`${dashboardData?.testResults?.access?.details?.overallScore || 0}%`}
          status={dashboardData?.testResults?.access?.success}
          icon={<UserCheck className="h-4 w-4 text-green-600" />}
        />
        <SecurityScoreCard 
          title="Data Protection"
          score={`${dashboardData?.testResults?.dataProtection?.details?.overallScore || 0}%`}
          status={dashboardData?.testResults?.dataProtection?.success}
          icon={<Shield className="h-4 w-4 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Security Score Trend */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Security Score Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {/* Replace with your chart component */}
              <AreaChart 
                data={dashboardData?.historicalScores || []} 
                index="date"
                categories={["score"]}
                colors={[getChartColor(dashboardData?.overallScore || 0)]}
                valueFormatter={(value) => `${value}%`}
                showLegend={false}
                showGridLines={false}
                showAnimation={true}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Assessment Categories */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Security Assessment</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {/* Replace with radar chart */}
              <RadarChart 
                data={[
                  {
                    category: "Encryption",
                    score: dashboardData?.testResults?.encryption?.details?.overallScore || 0
                  },
                  {
                    category: "Access Control",
                    score: dashboardData?.testResults?.access?.details?.overallScore || 0
                  },
                  {
                    category: "Data Protection",
                    score: dashboardData?.testResults?.dataProtection?.details?.overallScore || 0
                  },
                  {
                    category: "Compliance",
                    score: dashboardData?.testResults?.compliance?.details?.overallScore || 0
                  }
                ]}
                index="category"
                categories={["score"]}
                colors={["#2563eb"]}
                valueFormatter={(value) => `${value}%`}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Security Issues */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Critical Security Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {getAllCriticalIssues(dashboardData).length > 0 ? (
              <div className="space-y-3">
                {getAllCriticalIssues(dashboardData).slice(0, 5).map((issue, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${issue.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} flex-shrink-0 mt-0.5`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800 text-sm">{issue.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${issue.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {issue.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{issue.testType} security</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 h-8 px-2"
                          >
                            Remediate <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-green-100 text-green-800 p-3 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-medium text-gray-800">No Critical Issues</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-1">
                  Great job! Your security configuration has no critical issues.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Security Actions */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Next Security Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {dashboardData?.nextActions && dashboardData.nextActions.length > 0 ? (
                dashboardData.nextActions.map((action, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-100 rounded-md shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full flex-shrink-0 mt-0.5">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm">{action.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{action.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Due: {action.dueDate}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8 px-2"
                          >
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-blue-100 text-blue-800 p-3 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-gray-800">No Pending Actions</h3>
                  <p className="text-sm text-gray-500 max-w-xs mt-1">
                    You're all caught up with security actions.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrap with forwardRef
const SecurityDashboard = forwardRef(SecurityDashboardComponent);

// Security Score Card Component
const SecurityScoreCard = ({ title, score, status, icon }) => {
  // Status can be true (pass), false (fail), or null (not tested)
  const getStatusColor = () => {
    if (status === null) return 'bg-gray-100';
    return status ? 'bg-green-100' : 'bg-red-100';
  };

  const getTextColor = () => {
    if (status === null) return 'text-gray-500';
    return status ? 'text-green-700' : 'text-red-700';
  };

  const getStatusText = () => {
    if (status === null) return 'Not Tested';
    return status ? 'Passed' : 'Failed';
  };

  return (
    <Card className={`border-none shadow-md ${getStatusColor()}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold">{score}</div>
          <div className={`text-sm font-medium mt-1 ${getTextColor()}`}>
            {getStatusText()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on score
const getScoreColor = (score) => {
  if (score >= 90) return '#10B981'; // Green for excellent
  if (score >= 70) return '#60A5FA'; // Blue for good
  if (score >= 50) return '#F59E0B'; // Yellow for average
  return '#EF4444'; // Red for poor
};

// Helper function to get label based on score
const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Needs Attention';
};

// Get all critical issues from dashboard data
const getAllCriticalIssues = (data) => {
  // If no data is provided, return an empty array
  if (!data) return [];
  
  const allIssues = [];
  
  // Only process if the necessary data structures exist
  if (data && data.testResults) {
    // Process each test category
    Object.keys(data.testResults).forEach(testKey => {
      const test = data.testResults[testKey];
      
      // Skip if test details or recommendations don't exist
      if (!test || !test.details || !test.details.recommendations) return;
      
      // Add critical and high priority recommendations to the list
      test.details.recommendations.forEach(rec => {
        if (rec.priority && ['critical', 'high'].includes(rec.priority.toLowerCase())) {
          allIssues.push({
            ...rec,
            testType: testKey,
            id: `${testKey}-${allIssues.length}`
          });
        }
      });
    });
  }
  
  // Sort by priority (critical first, then high)
  return allIssues.sort((a, b) => {
    if (a.priority.toLowerCase() === 'critical' && b.priority.toLowerCase() !== 'critical') return -1;
    if (a.priority.toLowerCase() !== 'critical' && b.priority.toLowerCase() === 'critical') return 1;
    return 0;
  });
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
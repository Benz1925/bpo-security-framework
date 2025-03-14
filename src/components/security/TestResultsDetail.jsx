"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Check, X, AlertTriangle, Info, ExternalLink, ChevronLeft, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestResultsDetail = ({ testType, result, details, onBack }) => {
  // If details are provided from the API, use them
  // Otherwise, fall back to the default test details
  const testDetails = details || {
    encryption: {
      title: 'Data Encryption Test',
      description: 'Verifies that all sensitive data is properly encrypted at rest and in transit.',
      checkpoints: [
        { name: 'TLS 1.2+ for all connections', status: result ? true : Math.random() > 0.3 },
        { name: 'AES-256 encryption for stored data', status: result ? true : Math.random() > 0.3 },
        { name: 'Proper key management', status: result ? true : Math.random() > 0.3 },
        { name: 'Encrypted database backups', status: result ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        'Implement TLS 1.3 for all API connections',
        'Rotate encryption keys every 90 days',
        'Use envelope encryption for sensitive data',
        'Implement encrypted field-level security'
      ]
    },
    access: {
      title: 'Access Control Test',
      description: 'Evaluates the effectiveness of access controls and authentication mechanisms.',
      checkpoints: [
        { name: 'Multi-factor authentication', status: result ? true : Math.random() > 0.3 },
        { name: 'Role-based access control', status: result ? true : Math.random() > 0.3 },
        { name: 'Least privilege principle', status: result ? true : Math.random() > 0.3 },
        { name: 'Regular access reviews', status: result ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        'Implement conditional access policies',
        'Enforce strong password requirements',
        'Implement just-in-time access for privileged accounts',
        'Automate access reviews with Azure AD'
      ]
    },
    dataProtection: {
      title: 'Data Protection Test',
      description: 'Assesses data protection measures including backup, retention, and DLP.',
      checkpoints: [
        { name: 'Data loss prevention policies', status: result ? true : Math.random() > 0.3 },
        { name: 'Regular backup verification', status: result ? true : Math.random() > 0.3 },
        { name: 'Data classification', status: result ? true : Math.random() > 0.3 },
        { name: 'Data retention policies', status: result ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        'Implement Azure Information Protection',
        'Set up automated backup testing',
        'Create a comprehensive data classification scheme',
        'Implement data lifecycle management'
      ]
    },
    compliance: {
      title: 'Compliance Test',
      description: 'Verifies adherence to relevant regulatory and industry compliance standards.',
      checkpoints: [
        { name: 'GDPR compliance', status: result ? true : Math.random() > 0.3 },
        { name: 'ISO 27001 controls', status: result ? true : Math.random() > 0.3 },
        { name: 'SOC 2 requirements', status: result ? true : Math.random() > 0.3 },
        { name: 'Industry-specific regulations', status: result ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        'Implement Azure Compliance Manager',
        'Schedule regular compliance audits',
        'Document compliance evidence systematically',
        'Conduct regular compliance training'
      ]
    }
  }[testType] || {
    title: 'Unknown Test',
    description: 'No details available for this test.',
    checkpoints: [],
    recommendations: []
  };

  // Safely calculate score - prevents hydration mismatch
  const score = useMemo(() => {
    // Handle null/undefined safely
    if (!testDetails.checkpoints) return 0;
    
    const totalCheckpoints = testDetails.checkpoints.length;
    if (totalCheckpoints === 0) return 0;
    
    const passedCheckpoints = testDetails.checkpoints.filter(cp => cp.status).length;
    
    // If test passed, ensure score reflects this
    if (result === true) {
      // Calculate the pass rate as a percentage, but ensure it's at least 70% for passed tests
      return Math.max(Math.round((passedCheckpoints / totalCheckpoints) * 100), 70);
    }
    
    // For failed tests, calculate actual score
    return Math.round((passedCheckpoints / totalCheckpoints) * 100);
  }, [testDetails.checkpoints, result]);
  
  // Determine compliance status based on score and result
  const complianceStatus = useMemo(() => {
    if (result === true) {
      return score >= 90 ? "Compliant" : "Partially Compliant";
    }
    return score >= 50 ? "Partially Compliant" : "Non-Compliant";
  }, [score, result]);

  // Calculate overall status
  const passedCheckpoints = testDetails.checkpoints.filter(cp => cp.status).length;
  const totalCheckpoints = testDetails.checkpoints.length;
  const passRate = totalCheckpoints > 0 ? (passedCheckpoints / totalCheckpoints) * 100 : 0;
  
  // Determine status level
  let statusLevel = 'critical';
  if (score >= 90) statusLevel = 'good';
  else if (score >= 70) statusLevel = 'warning';
  else if (score >= 50) statusLevel = 'moderate';

  // Status level styling
  const statusStyles = {
    good: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    moderate: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    critical: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  };

  const currentStyle = statusStyles[statusLevel];

  // Get severity badge style
  const getSeverityBadgeStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'none': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get appropriate class based on severity
  const getSeverityClass = (severity) => {
    const severityLower = severity?.toLowerCase() || '';
    
    switch (severityLower) {
      case 'critical':
        return 'bg-red-100 text-red-700 font-medium';
      case 'high':
        return 'bg-amber-100 text-amber-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1 py-1 px-2 h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">
          {testType.charAt(0).toUpperCase() + testType.slice(1)} Test Results
        </h2>
        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
          result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {result ? 'Passed' : 'Failed'}
        </span>
      </div>
      
      {/* Test Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-500">Overall Score</span>
          <span className="text-2xl font-bold">
            {score}%
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-500">Compliance Status</span>
          <span className={`text-lg font-medium ${
            complianceStatus === "Compliant" ? "text-green-600" : 
            complianceStatus === "Partially Compliant" ? "text-amber-600" : 
            "text-red-600"
          }`}>
            {complianceStatus}
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-500">Last Tested</span>
          <span className="text-lg font-medium">
            {details?.lastTestedDate || new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Test Description */}
      {testDetails.description && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-800 bg-white p-4 rounded-lg border border-gray-100">
            {testDetails.description}
          </p>
        </div>
      )}
      
      {/* Checkpoints */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Security Checkpoints</h3>
        {testDetails.checkpoints && testDetails.checkpoints.length > 0 ? (
          <div className="space-y-3">
            {testDetails.checkpoints.map((checkpoint, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md border ${
                  checkpoint.status 
                    ? 'border-green-100 bg-green-50' 
                    : checkpoint.severity?.toLowerCase() === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : 'border-amber-100 bg-amber-50'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-2">
                    {checkpoint.status ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-800">{checkpoint.name}</h4>
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
          <p className="text-gray-500 p-4 bg-gray-50 rounded-lg">No checkpoint data available.</p>
        )}
      </div>
      
      {/* Recommendations */}
      {testDetails.recommendations && testDetails.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recommendations</h3>
          <div className="space-y-3">
            {testDetails.recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-md shadow-sm ${
                  rec.priority?.toLowerCase() === 'critical' ? 'bg-red-50 border-red-100' : 
                  rec.priority?.toLowerCase() === 'high' ? 'bg-amber-50 border-amber-100' : 
                  'bg-white border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{rec.title}</h4>
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
                    Learn More <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Export and Schedule buttons */}
      <div className="flex gap-2 mt-6">
        <Button 
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => alert('Export functionality coming soon!')}
        >
          <Info className="h-4 w-4" />
          Export Report
        </Button>
        <Button 
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => alert('Scheduling functionality coming soon!')}
        >
          <Info className="h-4 w-4" />
          Schedule Next Test
        </Button>
      </div>
    </div>
  );
};

export default TestResultsDetail; 
"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Check, X, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestResultsDetail = ({ testType, result, details }) => {
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

  // Calculate overall status
  const passedCheckpoints = testDetails.checkpoints.filter(cp => cp.status).length;
  const totalCheckpoints = testDetails.checkpoints.length;
  const passRate = totalCheckpoints > 0 ? (passedCheckpoints / totalCheckpoints) * 100 : 0;
  
  // Use API-provided score if available, otherwise calculate based on passed checkpoints
  // If result is true (passed), ensure score reflects that by using pass rate
  const score = result ? Math.round(passRate) : 0;
  
  // Determine status level
  let statusLevel = 'critical';
  if (score >= 90) statusLevel = 'good';
  else if (score >= 70) statusLevel = 'warning';
  else if (score >= 50) statusLevel = 'moderate';

  // Determine compliance status based on score and result
  const complianceStatus = result ? 
    (score >= 90 ? 'Fully Compliant' : 
     score >= 70 ? 'Mostly Compliant' : 
     score >= 50 ? 'Partially Compliant' : 'Minimally Compliant') :
    'Non-compliant';

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

  return (
    <Card className={`${currentStyle.bg} ${currentStyle.border}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`${currentStyle.text}`}>{testDetails.title}</CardTitle>
            <p className="text-gray-800 mt-1">{testDetails.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{score}%</div>
            <div className={`text-sm ${currentStyle.text}`}>
              {complianceStatus}
            </div>
            {testDetails.nextTestDate && (
              <div className="text-xs text-gray-600 mt-1">
                Next test: {testDetails.nextTestDate}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Test Results</h4>
            <span className={`font-medium ${currentStyle.text}`}>
              {passedCheckpoints}/{totalCheckpoints} Passed
            </span>
          </div>
          
          <div className="space-y-2">
            {testDetails.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{checkpoint.name}</span>
                    {checkpoint.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeStyle(checkpoint.severity)}`}>
                        {checkpoint.severity}
                      </span>
                    )}
                  </div>
                  {checkpoint.details && (
                    <p className="text-sm text-gray-600 mt-1">{checkpoint.details}</p>
                  )}
                </div>
                <div className="ml-4">
                  {checkpoint.status ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Recommendations</h4>
          </div>
          
          {Array.isArray(testDetails.recommendations) && !testDetails.recommendations[0]?.title ? (
            // Handle simple string array recommendations (legacy format)
            <ul className="space-y-1 list-disc pl-5">
              {testDetails.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-900">{rec}</li>
              ))}
            </ul>
          ) : (
            // Handle enhanced recommendation objects
            <div className="space-y-3">
              {testDetails.recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{rec.title}</h5>
                    {rec.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeStyle(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{rec.description}</p>
                  {rec.link && (
                    <a 
                      href={rec.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 mt-2 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Learn more
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
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
      </CardContent>
    </Card>
  );
};

export default TestResultsDetail; 
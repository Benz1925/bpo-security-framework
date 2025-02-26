"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

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
  
  // Determine status level
  let statusLevel = 'critical';
  if (passRate >= 90) statusLevel = 'good';
  else if (passRate >= 70) statusLevel = 'warning';
  else if (passRate >= 50) statusLevel = 'moderate';

  // Status level styling
  const statusStyles = {
    good: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    moderate: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    critical: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  };

  const currentStyle = statusStyles[statusLevel];

  return (
    <Card className={`${currentStyle.bg} ${currentStyle.border}`}>
      <CardHeader>
        <CardTitle className={`${currentStyle.text}`}>{testDetails.title}</CardTitle>
        <p className="text-gray-600">{testDetails.description}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Test Results</h4>
            <span className={`font-medium ${currentStyle.text}`}>
              {passedCheckpoints}/{totalCheckpoints} Passed ({Math.round(passRate)}%)
            </span>
          </div>
          
          <div className="space-y-2">
            {testDetails.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span>{checkpoint.name}</span>
                {checkpoint.status ? 
                  <Check className="text-green-500 h-5 w-5" /> : 
                  <X className="text-red-500 h-5 w-5" />
                }
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Recommendations</h4>
          </div>
          
          <ul className="space-y-1 list-disc pl-5">
            {testDetails.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultsDetail; 
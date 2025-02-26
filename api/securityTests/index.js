module.exports = async function (context, req) {
  context.log('Security Test API triggered');

  const testType = context.bindingData.testType || '';
  
  // Simulate security test with more realistic success rate
  const success = Math.random() > 0.3;
  
  // Define test-specific details
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
        { name: 'Multi-factor authentication', status: success ? true : Math.random() > 0.3 },
        { name: 'Role-based access control', status: success ? true : Math.random() > 0.3 },
        { name: 'Least privilege principle', status: success ? true : Math.random() > 0.3 },
        { name: 'Regular access reviews', status: success ? true : Math.random() > 0.3 }
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
        { name: 'Data loss prevention policies', status: success ? true : Math.random() > 0.3 },
        { name: 'Regular backup verification', status: success ? true : Math.random() > 0.3 },
        { name: 'Data classification', status: success ? true : Math.random() > 0.3 },
        { name: 'Data retention policies', status: success ? true : Math.random() > 0.3 }
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
        { name: 'GDPR compliance', status: success ? true : Math.random() > 0.3 },
        { name: 'ISO 27001 controls', status: success ? true : Math.random() > 0.3 },
        { name: 'SOC 2 requirements', status: success ? true : Math.random() > 0.3 },
        { name: 'Industry-specific regulations', status: success ? true : Math.random() > 0.3 }
      ],
      recommendations: [
        'Implement Azure Compliance Manager',
        'Schedule regular compliance audits',
        'Document compliance evidence systematically',
        'Conduct regular compliance training'
      ]
    }
  };

  // Get details for the specific test type
  const details = testDetails[testType] || {
    title: 'Unknown Test',
    description: 'No details available for this test.',
    checkpoints: [],
    recommendations: []
  };

  // Create response
  const responseBody = {
    success: success,
    testType: testType,
    timestamp: new Date().toISOString(),
    details: details
  };

  context.res = {
    status: 200,
    body: responseBody,
    headers: {
      'Content-Type': 'application/json'
    }
  };
}; 
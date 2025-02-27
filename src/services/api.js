// Get API base URL from runtime config if available, fallback to env vars or default
const getApiBaseUrl = () => {
  // Check if window and APP_CONFIG are available (client-side)
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return window.APP_CONFIG.apiUrl;
  }
  // Fallback to environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

// Check if we should use mock data
const shouldUseMockData = () => {
  // Use mock data in development without API URL
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
    return true;
  }
  
  // Use mock data if configured in APP_CONFIG
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.useMockApi) {
    return true;
  }
  
  return false;
};

// Security Tests API
export const securityTestsApi = {
  // Run a security test
  runTest: async (testType, clientId = '1') => {
    try {
      // Check if we should use mock data
      if (shouldUseMockData()) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success/failure
        const success = Math.random() > 0.3;
        
        // Return mock data
        return {
          success,
          testType,
          timestamp: new Date().toISOString(),
          details: getMockTestDetails(testType, success)
        };
      }
      
      // Get the API base URL
      const API_BASE_URL = getApiBaseUrl();
      
      // Call the actual API
      try {
        // For encryption tests, use the new dedicated endpoint
        const endpoint = testType === 'encryption' 
          ? `${API_BASE_URL}/security-tests/encryption`
          : `${API_BASE_URL}/security-tests/${testType}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ clientId })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (apiError) {
        console.warn('API call failed, falling back to mock data:', apiError);
        
        // Fall back to mock data if API call fails
        const success = Math.random() > 0.3;
        return {
          success,
          testType,
          timestamp: new Date().toISOString(),
          details: getMockTestDetails(testType, success),
          isMock: true
        };
      }
    } catch (error) {
      console.error('Security test error:', error);
      throw error;
    }
  }
};

// Clients API
export const clientsApi = {
  // Get all clients
  getClients: async () => {
    // For now, return mock data
    // In a real app, this would call the API
    return [
      { id: '1', name: 'ACME Corp', industry: 'Manufacturing', complianceLevel: 'High' },
      { id: '2', name: 'Globex Inc', industry: 'Finance', complianceLevel: 'Critical' },
      { id: '3', name: 'Initech', industry: 'Technology', complianceLevel: 'Medium' }
    ];
  },
  
  // Add a new client
  addClient: async (client) => {
    // For now, just return the client with an ID
    // In a real app, this would call the API
    return {
      id: Date.now().toString(),
      ...client
    };
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

  return testDetails[testType] || {
    title: 'Unknown Test',
    description: 'No details available for this test.',
    checkpoints: [],
    recommendations: []
  };
} 
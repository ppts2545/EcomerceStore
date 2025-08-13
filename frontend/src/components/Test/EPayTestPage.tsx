import React, { useState } from 'react';

const EPayTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  const testEPayAPI = async () => {
    setLoading(true);
    clearLogs();
    
    const EPAY_BASE_URL = 'https://epay.tonow.net/689b6f2882c7bd60a6ef4bc6';
    
    // Test 1: Basic connection
    addLog('🔍 Testing basic connection...');
    try {
      const response = await fetch(EPAY_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      addLog(`Status: ${response.status}`);
      addLog(`Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
      
      const text = await response.text();
      addLog(`Response: ${text.slice(0, 500)}`);
    } catch (error) {
      addLog(`❌ Connection error: ${error}`);
    }
    
    // Test 2: Try POST to create payment
    addLog('\n🔍 Testing payment creation...');
    try {
      const testData = {
        amount: 100,
        order_id: 'TEST_001',
        description: 'Test payment'
      };
      
      const response = await fetch(`${EPAY_BASE_URL}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      addLog(`Payment Status: ${response.status}`);
      const text = await response.text();
      addLog(`Payment Response: ${text.slice(0, 500)}`);
    } catch (error) {
      addLog(`❌ Payment error: ${error}`);
    }
    
    // Test 3: Try different endpoints
    const endpoints = ['', '/api', '/payment', '/create', '/status'];
    
    for (const endpoint of endpoints) {
      try {
        addLog(`\n🔍 Testing ${EPAY_BASE_URL}${endpoint}...`);
        const response = await fetch(`${EPAY_BASE_URL}${endpoint}`, {
          method: 'GET'
        });
        addLog(`${endpoint || 'root'}: ${response.status}`);
        
        if (response.status < 400) {
          const text = await response.text();
          addLog(`Response: ${text.slice(0, 200)}`);
        }
      } catch (error) {
        addLog(`❌ ${endpoint}: ${error}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>ePay API Test Tool</h2>
      <p>ทดสอบ API: <code>https://epay.tonow.net/689b6f2882c7bd60a6ef4bc6</code></p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testEPayAPI} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test ePay API'}
        </button>
        
        <button 
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '15px',
        minHeight: '400px',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
      }}>
        {testResults.length === 0 ? 'Click "Test ePay API" to start testing...' : testResults.join('\n')}
      </div>
    </div>
  );
};

export default EPayTestPage;

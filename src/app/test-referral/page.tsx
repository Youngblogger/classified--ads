'use client';

import { useState, useEffect } from 'react';

export default function TestReferralPage() {
  const [data, setData] = useState<{code?: string; balance?: number}>({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token ? 'found' : 'not found');
    
    fetch('', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    .then(r => r.json())
    .then(d => {
      console.log('API Response:', d);
      setData({ code: d.referral_code });
    })
    .catch(e => console.error(e));
  }, []);

  return (
    <div style={{ padding: 50, textAlign: 'center' }}>
      <h1>Test Referral Page</h1>
      <p>Referral Code: {data.code || 'Loading...'}</p>
    </div>
  );
}

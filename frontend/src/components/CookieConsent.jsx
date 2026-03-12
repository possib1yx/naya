import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('janaawaz_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('janaawaz_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--secondary)',
        padding: '20px 24px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, flex: '1 1 300px', lineHeight: 1.5 }}>
          We use cookies and third-party vendors (like Google AdSense) to serve personalized ads based on your prior visits and to analyze website traffic. By clicking "Accept", you consent to our use of cookies according to our <Link to="/privacy" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={handleAccept}
            className="btn-premium"
            style={{ padding: '10px 24px', background: 'var(--secondary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

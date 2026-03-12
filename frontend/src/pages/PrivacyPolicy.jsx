import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
      <div className="glass-effect animate-fade-in" style={{ padding: '60px', background: 'var(--surface-1)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', letterSpacing: '-1px', fontWeight: 900, color: 'var(--primary)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '0.9rem', fontWeight: 600 }}>Last updated: March 2026</p>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '32px' }}>
            JanAawaz respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard the information you provide when using our website.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>Information We Collect</h3>
          <p style={{ marginBottom: '24px' }}>We may collect the following types of information:</p>
          
          <div style={{ marginBottom: '32px', paddingLeft: '20px', borderLeft: '3px solid var(--secondary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Account Information</h4>
            <p>When you register or log in, we may collect: Name, Email address, Profile photo (if using social login), and Account ID.</p>
          </div>

          <div style={{ marginBottom: '32px', paddingLeft: '20px', borderLeft: '3px solid var(--secondary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>User Content</h4>
            <p>When you use the platform, we collect content that you voluntarily provide, such as: Comments, Discussion topics, Votes, Reports or feedback.</p>
          </div>

          <div style={{ marginBottom: '40px', paddingLeft: '20px', borderLeft: '3px solid var(--secondary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Usage Data</h4>
            <p>We may collect technical information automatically, including: IP address, Browser type, Device information, Pages visited, and Interaction data.</p>
          </div>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>How We Use Your Information</h3>
          <ul style={{ marginBottom: '40px', paddingLeft: '20px' }}>
            <li>Provide and maintain the platform</li>
            <li>Allow users to participate in discussions</li>
            <li>Display comments and votes</li>
            <li>Improve the functionality of the website</li>
            <li>Detect spam, abuse, or harmful activity</li>
            <li>Send important service notifications</li>
          </ul>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>Cookies and Third-Party Advertising</h3>
          <p style={{ marginBottom: '16px' }}>
            Our website uses cookies or similar technologies to improve user experience, remember login sessions, analyze website traffic, and optimize platform performance. You can control cookie settings through your browser.
          </p>
          <p style={{ marginBottom: '40px' }}>
            <strong>Google AdSense:</strong> We use Google AdSense to display ads on our site. Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)' }}>Ads Settings</a>.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>Data Security</h3>
          <p style={{ marginBottom: '40px' }}>
            We take reasonable measures to protect your information from unauthorized access, loss, or misuse. However, no online service can guarantee absolute security.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>Contact Us</h3>
          <p>
            If you have any questions regarding this Privacy Policy or the platform, you may contact us through the official contact page on the website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

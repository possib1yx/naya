import React from 'react';

const TermsOfService = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
      <div className="glass-effect animate-fade-in" style={{ padding: '60px', background: 'var(--surface-1)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', letterSpacing: '-1px', fontWeight: 900, color: 'var(--primary)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '0.9rem', fontWeight: 600 }}>Last updated: March 2026</p>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '32px' }}>
            Welcome to JanAawaz. By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>1. Acceptance of Terms</h3>
          <p style={{ marginBottom: '32px' }}>
            By registering for an account, contributing content, or accessing the JanAawaz platform, you agree to comply with and be bound by these Terms, as well as our Privacy Policy.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>2. User Responsibilities and Content</h3>
          <p style={{ marginBottom: '16px' }}>
            You are entirely responsible for the content of, and any harm resulting from, your postings to the website (in the form of text/comments). When you create or make available content, you represent and warrant that:
          </p>
          <ul style={{ marginBottom: '32px', paddingLeft: '20px' }}>
            <li>Your content does not violate any local laws or regulations.</li>
            <li>Your content is not spam, not machine-generated, and does not contain unethical or unwanted commercial material designed to drive traffic to third-party sites or boost the search engine rankings of third-party sites.</li>
            <li>Your content is not pornographic, does not contain threats or incite violence, and does not violate the privacy or publicity rights of any third party.</li>
            <li>You will maintain a respectful tone in discussions and not engage in harassment or hate speech.</li>
          </ul>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>3. Intellectual Property Rights</h3>
          <p style={{ marginBottom: '32px' }}>
            By posting content to JanAawaz, you grant us a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any and all media or distribution methods.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>4. Termination</h3>
          <p style={{ marginBottom: '32px' }}>
            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>5. Third-Party Links and Ads</h3>
          <p style={{ marginBottom: '32px' }}>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by JanAawaz. Furthermore, we use Google AdSense to display advertisements. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>6. Disclaimer of Warranties</h3>
          <p style={{ marginBottom: '32px' }}>
            The website is provided "as is". JanAawaz and its suppliers and licensors hereby disclaim all warranties of any kind, express or implied, including, without limitation, the warranties of merchantability, fitness for a particular purpose and non-infringement.
          </p>

          <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.5rem' }}>Contact Us</h3>
          <p>
            If you have any questions or suggestions about our Terms of Service, do not hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

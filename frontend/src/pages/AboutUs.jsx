import React from 'react';

const AboutUs = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
      <div className="glass-effect animate-fade-in" style={{ padding: '60px', background: 'var(--surface-1)' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '40px', letterSpacing: '-1.5px', fontWeight: 900, color: 'var(--primary)' }}>About JanAawaz</h1>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>
            JanAawaz is a community-driven platform designed to encourage open discussion about public policies, governance, and civic ideas in Nepal. The goal of the platform is to provide a space where citizens can read policy topics, share opinions, suggest ideas, and participate in constructive conversations about issues that affect society.
          </p>

          <p style={{ marginBottom: '24px' }}>
            The platform allows users to explore different discussion topics, comment on manifesto ideas, vote on suggestions, and engage with other community members. By highlighting the most supported ideas through a voting system, the platform helps bring forward opinions that resonate with the public.
          </p>

          <p style={{ marginBottom: '24px' }}>
            JanAawaz is built to promote respectful dialogue, civic engagement, and transparency. The platform is intended to serve as a digital forum where citizens can express their perspectives, discuss policies, and collaborate on ideas that contribute to better governance and social development.
          </p>

          <p style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', fontSize: '1rem', fontStyle: 'italic' }}>
            The platform is independent and is not officially affiliated with any government body, political party, or public official. All opinions and comments published on the platform represent the views of individual users.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--primary)', borderTop: '1px solid var(--glass-border)', paddingTop: '32px', marginTop: '32px' }}>
            Our mission is to empower citizens by giving them a voice in public discussions and encouraging thoughtful participation in civic matters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

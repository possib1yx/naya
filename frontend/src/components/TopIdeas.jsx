import React from 'react';
import { Link } from 'react-router-dom';

const TopIdeas = ({ ideas }) => {
  const isMock = ideas.length === 0 || ideas.some(i => i.isMock);
  
  const displayIdeas = ideas.length > 0 ? ideas : [
    { id: 'mock-1', title: '[Mock] Decentralized Solar Grid for Kathmandu', voteCount: 1240, isMock: true },
    { id: 'mock-2', title: '[Mock] Vertical Farming in Public Parks', voteCount: 892, isMock: true },
    { id: 'mock-3', title: '[Mock] Smart Traffic Management via AI', voteCount: 756, isMock: true }
  ];

  return (
    <div className="glass-card" style={{ marginTop: '30px', padding: '24px', border: isMock ? '1px dashed var(--secondary)' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Top Ideas</h3>
        {isMock && (
          <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', background: 'rgba(230,57,70,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
            SIMULATED DATA
          </span>
        )}
      </div>
      
      <ul style={{ listStyle: 'none' }}>
        {displayIdeas.map(idea => (
          <li key={idea.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <Link 
              to={idea.isMock ? '#' : `/manifesto/${idea.id}`} 
              style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.95rem' }}
              onClick={(e) => idea.isMock && e.preventDefault()}
            >
              {idea.title}
            </Link>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '4px', fontWeight: 700 }}>
               {idea.voteCount} total votes
            </div>
          </li>
        ))}
      </ul>
      
      {isMock && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 500, lineHeight: 1.4 }}>
          * These entries are generated to demonstrate the community vision until more real-world proposals are submitted.
        </p>
      )}
    </div>
  );
};

export default TopIdeas;

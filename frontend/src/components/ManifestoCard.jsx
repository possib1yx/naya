import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManifestoCard = ({ id, title, description, commentCount, voteCount, category, createdById, onVote, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const formattedVotes = voteCount > 0 ? `+${voteCount}` : voteCount < 0 ? `${voteCount}` : '0';

  const handleVoteClick = (e, type) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (onVote) onVote(id, type);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this idea?')) {
      onDelete(id);
    }
  };

  const isOwner = user && (user.dbId === createdById || user.uid === createdById);

  return (
    <div
      className="glass-effect hover-glow animate-fade-in"
      onClick={() => navigate(`/manifesto/${id}`)}
      style={{ padding: '32px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: '340px', background: 'var(--surface-1)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', background: 'rgba(220, 38, 38, 0.05)', padding: '6px 14px', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
            {category}
          </span>
          {createdById === 'system-seed' && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '6px 14px', borderRadius: '100px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid var(--glass-border)' }}>
              EXAMPLE IDEA
            </span>
          )}
        </div>
        {isOwner && (
          <button 
            onClick={handleDeleteClick}
            style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, cursor: 'pointer' }}
          >
            DELETE
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', lineHeight: 1.3, color: 'var(--primary)', fontWeight: 800 }}>{title}</h3>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginBottom: '32px', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Enhanced Voting Pill */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface-2)', 
            padding: '4px', 
            borderRadius: '100px',
            border: '1px solid var(--glass-border)',
            gap: '8px'
          }}>
            <button
              onClick={(e) => handleVoteClick(e, 'UP')}
              style={{ padding: '6px 12px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', border: 'none' }}
            >
              UP
            </button>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', minWidth: '30px', textAlign: 'center', color: (voteCount || 0) > 0 ? 'var(--secondary)' : (voteCount || 0) < 0 ? '#dc2626' : 'var(--text-primary)' }}>
              {formattedVotes}
            </span>
            <button
              onClick={(e) => handleVoteClick(e, 'DOWN')}
              style={{ padding: '6px 12px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', border: 'none' }}
            >
              DOWN
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>{commentCount}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManifestoCard;

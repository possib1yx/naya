import React from 'react';

const TopCommentsToday = ({ comments, onVote, onReply }) => {
  return (
    <div className="glass-effect animate-float" style={{ padding: '40px', background: 'var(--surface-1)', border: '1px solid var(--glass-border)' }}>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px rgba(202, 138, 4, 0.3)' }}></div>
        TOP THOUGHTS TODAY
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {comments?.length > 0 ? comments.map((comment, index) => (
          <div key={index} style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent)', transition: 'transform 0.3s ease' }} className="hover-glow">
            <p style={{ marginBottom: '16px', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
              "{comment.content}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {comment.isAnonymous ? 'ANONYMOUS' : (comment.authorName || 'USER')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-1)', padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
                <button 
                  onClick={() => onVote?.(comment.manifestoId, comment.id, 'UP')} 
                  style={{ border: 'none', background: 'transparent', padding: '2px 4px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' }}
                >UP</button>
                <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--accent)' }}>{comment.voteCount || 0}</span>
                <button 
                  onClick={() => onVote?.(comment.manifestoId, comment.id, 'DOWN')} 
                  style={{ border: 'none', background: 'transparent', padding: '2px 4px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' }}
                >DOWN</button>
              </div>
            </div>
            
            <button 
              onClick={() => onReply?.(comment.manifestoId)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Join Discussion
            </button>
          </div>
        )) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Waiting for more comments.</p>
        )}
      </div>
    </div>
  );
};

export default TopCommentsToday;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const ManifestoDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manifesto, setManifesto] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [manResponse, commentsResponse] = await Promise.all([
        fetch(`${API_URL}/manifestos/${id}`),
        fetch(`${API_URL}/comments/manifesto/${id}`)
      ]);

      const manifestoData = await manResponse.json();
      const commentsData = await commentsResponse.json();

      setManifesto(manifestoData);
      setComments(buildTree(commentsData));
    } catch (error) {
      console.error('Error fetching manifesto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const [replyTo, setReplyTo] = useState(null); 
  const [replyText, setReplyText] = useState('');
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);

  const handlePostComment = async (parentId = null) => {
    const text = parentId ? replyText : commentText;
    const anonymous = parentId ? isReplyAnonymous : isAnonymous;
    if (!text.trim() || !user) return;

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          manifestoId: id,
          userId: user.dbId || user.uid,
          authorName: user.username || user.displayName || user.email.split('@')[0],
          parentId,
          isAnonymous: anonymous
        })
      });

      if (response.ok) {
        if (parentId) {
          setReplyTo(null);
          setReplyText('');
          setIsReplyAnonymous(false);
        } else {
          setCommentText('');
          setIsAnonymous(false);
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleVote = async (commentId, voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          manifestoId: id, 
          commentId, 
          userId: user.dbId || user.uid,
          voteType 
        })
      });

      if (response.ok) {
        fetchData();
      } else {
        const errData = await response.json();
        if (errData.error.includes('already')) {
           const delResponse = await fetch(`${API_URL}/votes`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ manifestoId: id, commentId, userId: user.dbId || user.uid })
          });
          if (delResponse.ok) fetchData();
        }
      }
    } catch (error) {
      console.error('Voting Error:', error);
    }
  };

  const handleTopicVote = async (voteType) => {
    if (!user) return navigate('/login');
    try {
        const response = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                manifestoId: id, 
                userId: user.dbId || user.uid,
                voteType 
            })
        });
        if (response.ok) {
            fetchData();
        } else {
            const errData = await response.json();
            if (errData.error.includes('already')) {
                const delResponse = await fetch(`${API_URL}/votes`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manifestoId: id, userId: user.dbId || user.uid })
                });
                if (delResponse.ok) fetchData();
            }
        }
    } catch (error) {
        console.error('Topic Voting Error:', error);
    }
  };

  const handleTopicDelete = async () => {
    if (!window.confirm('Erase this vision from the platform permanently?')) return;
    try {
      const response = await fetch(`${API_URL}/manifestos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        alert('Action failed: ' + (data.error || response.statusText));
      }
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Network failure. Please check your connection.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Discard this perspective?')) return;
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}?manifestoId=${id}&userId=${user.dbId || user.uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert('Action failed: ' + (data.error || response.statusText));
      }
    } catch (error) {
      console.error('Deletion error:', error);
      alert(`Connection failed to ${API_URL}/comments/${commentId}. \n\nDetails: ${error.message}\n\nCheck if your backend is running and matches this URL.`);
    }
  };

  const renderComments = (commentList, depth = 0) => {
    return commentList.map((comment) => {
      const displayName = comment.isAnonymous ? 'ANONYMOUS' : (comment.authorName?.toUpperCase() || 'USER');
      const initial = displayName[0]?.toUpperCase() || 'U';
      const isOwner = user && (user.dbId === comment.userId || user.uid === comment.userId);

      return (
        <div key={comment.id} style={{ marginLeft: depth > 0 ? '48px' : '0', marginTop: '32px', position: 'relative' }}>
          {depth > 0 && <div style={{ position: 'absolute', left: '-24px', top: '0', bottom: '20px', width: '2px', background: 'var(--glass-border)' }}></div>}
          <div className="glass-effect" style={{ padding: '32px', background: 'var(--surface-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: comment.isAnonymous ? 'var(--surface-2)' : 'var(--secondary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: '0.9rem',
                  border: '1px solid var(--glass-border)'
                }}>
                  {initial}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isOwner && (
                  <button 
                    onClick={() => handleCommentDelete(comment.id)}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 800, opacity: 0.6, marginLeft: '10px' }}
                  >
                    DISCARD
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '4px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={() => handleVote(comment.id, 'UP')}
                    style={{ padding: '6px 12px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', border: 'none' }}
                  >
                    UP
                  </button>
                  <span style={{ fontWeight: 900, minWidth: '20px', textAlign: 'center', fontSize: '0.85rem', color: (comment.voteCount || 0) > 0 ? 'var(--secondary)' : (comment.voteCount || 0) < 0 ? '#dc2626' : 'var(--text-primary)' }}>
                    {(comment.voteCount || 0) > 0 ? `+${comment.voteCount}` : comment.voteCount || 0}
                  </span>
                  <button
                    onClick={() => handleVote(comment.id, 'DOWN')}
                    style={{ padding: '6px 12px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', border: 'none' }}
                  >
                    DOWN
                  </button>
                </div>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Reply
                </button>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, lineHeight: 1.7, fontWeight: 400 }}>{comment.content}</p>

            {replyTo === comment.id && (
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--glass-border)' }}>
                <textarea
                  placeholder="Add your thoughts..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: '100%', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-primary)', minHeight: '120px', marginBottom: '20px', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={isReplyAnonymous} 
                      onChange={(e) => setIsReplyAnonymous(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }}
                    />
                    Submit Anonymously
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => { setReplyTo(null); setIsReplyAnonymous(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>CANCEL</button>
                    <button className="btn-premium" onClick={() => handlePostComment(comment.id)} disabled={!replyText.trim()} style={{ background: 'var(--secondary)', color: 'white', padding: '10px 24px', cursor: 'pointer', border: 'none' }}>POST REPLY</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
        </div>
      );
    });
  };

  const buildTree = (list) => {
    const map = {};
    const tree = [];
    list.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });
    list.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        tree.push(map[item.id]);
      }
    });
    return tree;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!manifesto) return <div style={{ textAlign: 'center', padding: '100px' }}>Manifesto not found.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="glass-effect animate-fade-in" style={{ padding: '60px', marginBottom: '60px', border: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', background: 'rgba(220, 38, 38, 0.05)', padding: '6px 16px', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
              {manifesto.category || 'POLICY VISION'}
            </span>
            {manifesto.createdById === 'system-seed' && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
                [ SIMULATED VISION ]
              </span>
            )}
            {user && (user.dbId === manifesto.createdById || user.uid === manifesto.createdById) && (
              <button 
                onClick={handleTopicDelete}
                style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 800, opacity: 0.6, letterSpacing: '1px' }}
              >
                DELETE VISION
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-2)', padding: '6px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
            <button
              onClick={() => handleTopicVote('UP')}
              style={{ padding: '8px 24px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', border: 'none' }}
            >
              UP
            </button>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', minWidth: '40px', textAlign: 'center', color: (manifesto.voteCount || 0) > 0 ? 'var(--secondary)' : (manifesto.voteCount || 0) < 0 ? '#dc2626' : 'var(--text-primary)' }}>
              {(manifesto.voteCount || 0) > 0 ? `+${manifesto.voteCount}` : manifesto.voteCount || 0}
            </span>
            <button
              onClick={() => handleTopicVote('DOWN')}
              style={{ padding: '8px 24px', borderRadius: '100px', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', border: 'none' }}
            >
              DOWN
            </button>
          </div>
        </div>
        
        <h1 style={{ fontSize: '3.5rem', marginBottom: '32px', letterSpacing: '-2px', lineHeight: 1.1, fontWeight: 900, color: 'var(--primary)' }}>{manifesto.title}</h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '0', lineHeight: '1.8', fontWeight: 400 }}>{manifesto.description}</p>
      </div>

      <section className="comment-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ width: '4px', height: '32px', background: 'var(--accent)', borderRadius: '2px' }}></div>
            <h2 style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
              Community Discussion <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{comments.length} Comments</span>
            </h2>
        </div>

        <div className="glass-effect" style={{ padding: '40px', marginBottom: '60px', background: 'var(--surface-1)' }}>
          {user ? (
            <>
              <h4 style={{ marginBottom: '24px', fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>CONTRIBUTE AS: {user.displayName?.toUpperCase() || user.email.split('@')[0].toUpperCase()}</h4>
              <textarea
                placeholder="Share your strategic perspective..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ width: '100%', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-primary)', minHeight: '160px', marginBottom: '24px', outline: 'none', fontSize: '1.1rem', fontFamily: 'inherit', transition: 'border-color 0.3s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--secondary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--secondary)' }}
                  />
                  Preserve Anonymity
                </label>
                  <button className="btn-premium" onClick={() => handlePostComment()} disabled={!commentText.trim()} style={{ background: 'var(--secondary)', color: 'white', padding: '14px 32px', cursor: 'pointer', border: 'none' }}>
                    POST COMMENT
                  </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Authentication required to join the deliberation.</p>
              <Link to="/login" className="btn-premium">SIGN IN</Link>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {renderComments(comments)}
        </div>
      </section>
    </div>
  );
};

export default ManifestoDetail;

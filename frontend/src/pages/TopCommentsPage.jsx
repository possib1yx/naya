import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const TopCommentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [topTopics, setTopTopics] = useState([]);
    const [dailyComments, setDailyComments] = useState([]);
    const [weeklyComments, setWeeklyComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const fetchData = async () => {
        try {
            const [topics, daily, weekly] = await Promise.all([
                fetch(`${API_URL}/manifestos/top`).then(res => res.json()),
                fetch(`${API_URL}/top/daily`).then(res => res.json()),
                fetch(`${API_URL}/top/weekly`).then(res => res.json())
            ]);
            setTopTopics(Array.isArray(topics) ? topics : []);
            setDailyComments(Array.isArray(daily) ? daily : []);
            setWeeklyComments(Array.isArray(weekly) ? weekly : []);
        } catch (err) {
            console.error('Error fetching top data:', err);
            setTopTopics([]);
            setDailyComments([]);
            setWeeklyComments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVote = async (manifestoId, commentId, voteType) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    manifestoId, 
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
                   await fetch(`${API_URL}/votes`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ manifestoId, commentId, userId: user.dbId || user.uid })
                    });
                    fetchData();
                }
            }
        } catch (error) {
            console.error('Voting Error:', error);
        }
    };

    const handlePostReply = async (manifestoId, parentId) => {
        if (!replyText.trim() || !user) return;

        try {
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: replyText,
                    manifestoId,
                    userId: user.dbId || user.uid,
                    authorName: user.displayName || user.email.split('@')[0],
                    parentId,
                    isAnonymous
                })
            });

            if (response.ok) {
                setReplyTo(null);
                setReplyText('');
                setIsAnonymous(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const renderCommentCard = (comment, isWeekly = false) => {
        const accentColor = isWeekly ? 'var(--accent)' : 'var(--secondary)';
        return (
            <div key={comment.id} className="glass-effect animate-fade-in" style={{ padding: '24px', background: 'var(--surface-1)', borderLeft: `4px solid ${accentColor}`, borderRadius: 'var(--radius-md)' }}>
                <Link to={`/manifesto/${comment.manifestoId}`} style={{ fontSize: '0.65rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', marginBottom: '12px', display: 'block' }}>
                    VIEW DISCUSSION
                </Link>
                <p style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>"{comment.content}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {comment.isAnonymous ? 'ANONYMOUS' : comment.authorName}
                        </span>
                    </div>
                    {/* Voting Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '4px 12px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
                        <button onClick={() => handleVote(comment.manifestoId, comment.id, 'UP')} style={{ border: 'none', background: 'transparent', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            UP
                        </button>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-primary)', minWidth: '20px', textAlign: 'center' }}>{comment.voteCount || 0}</span>
                        <button onClick={() => handleVote(comment.manifestoId, comment.id, 'DOWN')} style={{ border: 'none', background: 'transparent', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            DOWN
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading top ideas...</div>;

    return (
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', paddingBottom: '100px' }}>
            <header style={{ textAlign: 'center', marginBottom: '80px', padding: '0 24px' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '20px', letterSpacing: '-2px', fontWeight: 900, lineHeight: 1 }}>
                    TOP RATED <span style={{ color: 'var(--secondary)' }}>IDEAS</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>Exploration of the most impactful thoughts and visions from our community.</p>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '4px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px', padding: '0 24px' }}>
                {/* Left: Top Visions (Main Content) */}
                <div style={{ gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>LEADING VISIONS</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {topTopics.length > 0 ? topTopics.map((topic, i) => (
                            <div key={topic.id} className="glass-effect animate-fade-in hover-glow" style={{ padding: '32px', background: 'var(--surface-1)', animationDelay: `${i * 0.1}s`, border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(220, 38, 38, 0.05)', padding: '4px 12px', borderRadius: '4px' }}>{topic.category}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1} Trending</span>
                                </div>
                                <Link to={`/manifesto/${topic.id}`} style={{ display: 'block', marginBottom: '24px', fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', lineHeight: 1.2 }}>
                                    {topic.title}
                                </Link>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '6px 16px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
                                        <button onClick={() => handleVote(topic.id, undefined, 'UP')} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900 }}>UP</button>
                                        <span style={{ fontWeight: 900, minWidth: '40px', textAlign: 'center', color: 'var(--primary)', fontSize: '1rem' }}>{topic.voteCount}</span>
                                        <button onClick={() => handleVote(topic.id, undefined, 'DOWN')} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900 }}>DOWN</button>
                                    </div>
                                    <Link to={`/manifesto/${topic.id}`} style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {topic.commentCount} COMMENTS
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="glass-effect" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontWeight: 600 }}>Awaiting the first community vision.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Sidebar Content */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '60px' }}>
                    {/* Daily Top */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>DAILY TOP</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {dailyComments.length > 0 ? dailyComments.map(c => renderCommentCard(c)) : (
                                <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Waiting for today's top thoughts.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Weekly Best */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>THIS WEEK'S BEST</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {weeklyComments.length > 0 ? weeklyComments.map(c => renderCommentCard(c, true)) : (
                                <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Searching for the week's best insights.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TopCommentsPage;

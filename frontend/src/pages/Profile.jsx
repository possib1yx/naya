import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ManifestoCard from '../components/ManifestoCard';
import API_URL from '../config';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('visions');

    const [error, setError] = useState(null);

    const targetId = (id === 'me') 
        ? (currentUser ? (currentUser.dbId || currentUser.uid) : null) 
        : id;

    const fetchProfile = async (uid) => {
        if (!uid || uid === 'me') return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/users/${uid}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'User not found');
            }
            const data = await response.json();
            setProfile(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.message || 'Connection failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id === 'me' && !currentUser) {
            // Wait for auth to resolve
            return;
        }
        if (targetId) {
            fetchProfile(targetId);
        } else if (id === 'me' && !currentUser) {
            // Keep loading
        } else {
            setLoading(false);
            setError("Authentication required or User not found.");
        }
    }, [id, currentUser, targetId]);

    const handleTopicVote = async (topicId, voteType) => {
        try {
            const response = await fetch(`${API_URL}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    manifestoId: topicId, 
                    userId: currentUser?.dbId || currentUser?.uid,
                    voteType 
                })
            });
            if (response.ok) {
                fetchProfile(targetId);
            }
        } catch (error) {
            console.error('Voting error:', error);
        }
    };

    const handleTopicDelete = async (topicId) => {
        if (!window.confirm('Delete this vision permanently?')) return;
        try {
            const response = await fetch(`${API_URL}/manifestos/${topicId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchProfile(targetId);
            }
        } catch (error) {
            console.error('Deletion error:', error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading profile...</div>;
    if (error || !profile) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error || 'User profile not found.'}</p>
            {id === 'me' && !currentUser && <Link to="/login" className="btn-premium">SIGN IN TO VIEW PROFILE</Link>}
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '60px auto', paddingBottom: '100px' }}>
            <div className="glass-effect animate-fade-in" style={{ padding: '48px', marginBottom: '60px', background: 'var(--surface-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div style={{ 
                        width: '140px', 
                        height: '140px', 
                        borderRadius: '40px', 
                        background: 'linear-gradient(135deg, var(--secondary), #f87171)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '4rem', 
                        fontWeight: 900,
                        boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)'
                    }}>
                        {profile.username ? profile.username[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', letterSpacing: '-1.5px' }}>{profile.username}</h1>
                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
                            <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>{profile.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid var(--glass-border)', marginBottom: '40px', paddingLeft: '20px' }}>
                <button 
                    onClick={() => setActiveTab('visions')}
                    style={{ 
                        padding: '16px 24px', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'visions' ? '3px solid var(--secondary)' : '3px solid transparent',
                        color: activeTab === 'visions' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >IDEAS ({profile.topicsCreated})</button>
                <button 
                    onClick={() => setActiveTab('contributions')}
                    style={{ 
                        padding: '16px 24px', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'contributions' ? '3px solid var(--secondary)' : '3px solid transparent',
                        color: activeTab === 'contributions' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >THOUGHTS ({profile.totalComments})</button>
            </div>

            <div>
                {activeTab === 'visions' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {profile.manifestos?.map(v => (
                            <ManifestoCard 
                                key={v.id} 
                                {...v} 
                                onVote={handleTopicVote}
                                onDelete={handleTopicDelete}
                            />
                        ))}
                        {profile.manifestos?.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No visions proposed yet.</p>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {profile.comments?.map(c => (
                            <div key={c.id} className="glass-effect hover-glow" style={{ padding: '24px', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.6, fontWeight: 500 }}>"{c.content}"</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Link to={`/manifesto/${c.manifestoId}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        View Discussion →
                                    </Link>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        {c.voteCount || 0} VOTES
                                    </span>
                                </div>
                            </div>
                        ))}
                        {profile.comments?.length === 0 && <p style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No contributions shared yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

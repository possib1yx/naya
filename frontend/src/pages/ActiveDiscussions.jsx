import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManifestoCard from '../components/ManifestoCard';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';

const ActiveDiscussions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [manifestos, setManifestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/manifestos`);
            const data = await response.json();
            setManifestos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTopicVote = async (topicId, voteType) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    manifestoId: topicId, 
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
                        body: JSON.stringify({ manifestoId: topicId, userId: user.dbId || user.uid })
                    });
                    if (delResponse.ok) fetchData();
                }
            }
        } catch (error) {
            console.error('Voting Error:', error);
        }
    };

    const handleTopicDelete = async (topicId) => {
        if (!window.confirm('Are you sure you want to delete this vision?')) return;
        try {
            const response = await fetch(`${API_URL}/manifestos/${topicId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                setManifestos(prev => prev.filter(m => m.id !== topicId));
            } else {
                const data = await response.json();
                alert('Action failed: ' + (data.error || response.statusText));
            }
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert('Network failure. Please check your connection.');
        }
    };

    const categories = ['all', ...new Set(manifestos.map(m => m.category).filter(Boolean))];

    const filteredManifestos = filter === 'all' 
        ? manifestos 
        : manifestos.filter(m => m.category === filter);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Synchronizing community visions...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '16px' }}>
                    ACTIVE <span style={{ color: 'var(--secondary)' }}>VISIONS</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Explore, debate, and refine the proposals shaping Nepal's future.
                </p>
            </header>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{ 
                            padding: '10px 24px', 
                            borderRadius: '100px', 
                            border: '1px solid var(--glass-border)',
                            background: filter === cat ? 'var(--secondary)' : 'var(--surface-1)',
                            color: filter === cat ? 'white' : 'var(--text-primary)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
                {filteredManifestos.map(topic => (
                    <ManifestoCard
                        key={topic.id}
                        id={topic.id}
                        title={topic.title}
                        description={topic.description}
                        category={topic.category}
                        commentCount={topic.commentCount || 0}
                        voteCount={topic.voteCount || 0}
                        createdById={topic.createdById}
                        onVote={handleTopicVote}
                        onDelete={handleTopicDelete}
                    />
                ))}
                {filteredManifestos.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No visions found in this category. Be the first to propose one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveDiscussions;

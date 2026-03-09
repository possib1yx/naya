import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManifestoCard from '../components/ManifestoCard';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';

const ForPM = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/manifestos`);
            const data = await response.json();
            // Filter only for "Citizen Demand" or "Task for PM" - or just show all if we haven't tagged them yet.
            // For now, let's assume we tag them with category "Citizen Demand"
            const filtered = Array.isArray(data) ? data.filter(m => m.category === 'Citizen Demand') : [];
            setDemands(filtered);
        } catch (error) {
            console.error('Error fetching PM demands:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVote = async (topicId, voteType) => {
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
            console.error('Voting error:', error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading citizen tasks...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: 'clamp(-1px, -0.3vw, -2px)', marginBottom: '16px' }}>
                    FOR THE <span style={{ color: 'var(--secondary)' }}>PRIME MINISTER</span>
                </h1>
                <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '800px', margin: '0 auto' }}>
                    Directly outlining the urgent tasks and priorities the people of Nepal demand from their leadership.
                </p>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 24px', background: 'var(--surface-2)', borderRadius: '100px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        DEMANDS WITH HIGHEST CONSENSUS ARE HIGHLIGHTED
                    </div>
                    {user && (
                        <button 
                            onClick={() => navigate('/create-topic')}
                            style={{ 
                                padding: '8px 24px', 
                                background: 'var(--secondary)', 
                                color: 'white', 
                                borderRadius: '100px', 
                                border: 'none', 
                                fontWeight: 800, 
                                fontSize: '0.85rem', 
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(220, 38, 38, 0.15)'
                            }}
                        >
                            PROPOSE A DEMAND
                        </button>
                    )}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
                {demands.map(topic => (
                    <ManifestoCard
                        key={topic.id}
                        {...topic}
                        onVote={handleVote}
                    />
                ))}
                {demands.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No specific demands found. Be the first to voice a task for the PM!</p>
                        <button 
                            onClick={() => navigate('/create-topic')}
                            className="btn-premium" 
                            style={{ marginTop: '24px' }}
                        >
                            SUBMIT A DEMAND
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForPM;

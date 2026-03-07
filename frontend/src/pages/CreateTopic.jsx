import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const CreateTopic = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('Discussion');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const categories = [
        'Discussion', 
        'Infrastructure', 
        'Education', 
        'Healthcare', 
        'Economy', 
        'Environment', 
        'Agriculture', 
        'e-Governance',
        'Citizen Demand'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/manifestos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    createdById: user.dbId || user.uid,
                    authorName: user.username || user.displayName || user.email.split('@')[0]
                })
            });

            if (response.ok) {
                const data = await response.json();
                navigate(`/manifesto/${data.id}`);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to create topic');
            }
        } catch (error) {
            console.error('Error creating topic:', error);
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Please sign in to create a new discussion topic.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto' }}>
            <div className="glass-effect animate-fade-in" style={{ padding: '60px', background: 'var(--surface-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
                    <div style={{ width: '4px', height: '40px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                    <h2 style={{ fontSize: '2.5rem', letterSpacing: '-2px', fontWeight: 900, color: 'var(--text-primary)' }}>PROPOSE A VISION</h2>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '32px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>VISION TITLE</label>
                        <input
                            type="text"
                            placeholder="e.g. STRATEGIC URBAN TRANSFORMATION"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none', fontSize: '1.1rem', transition: 'border-color 0.3s' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>STRATEGIC CATEGORY</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ width: '100%', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat} style={{ background: 'var(--surface-1)' }}>{cat.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>DETAILED ELABORATION</label>
                        <textarea
                            placeholder="Detail your proposed solution for the collective advancement of the nation..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{ width: '100%', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-primary)', minHeight: '200px', outline: 'none', fontFamily: 'inherit', fontSize: '1.1rem', lineHeight: 1.6, transition: 'border-color 0.3s' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', userSelect: 'none' }}>
                            <input 
                                type="checkbox" 
                                checked={isAnonymous} 
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                style={{ width: '22px', height: '22px', accentColor: 'var(--secondary)', cursor: 'pointer' }}
                            />
                            Stay Private (Post Anonymously)
                        </label>
                    </div>

                    <button className="btn-premium" style={{ width: '100%', padding: '20px', background: 'var(--secondary)', color: 'white', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }} disabled={loading}>
                        {loading ? 'INITIALIZING VISION...' : 'PUBLISH VISION'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTopic;

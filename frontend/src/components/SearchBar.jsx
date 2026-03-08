import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], manifestos: [] });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ users: [], manifestos: [] });
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Search Users
                const userRes = await fetch(`${API_URL}/users/search/${query}`);
                const userData = await userRes.json();

                // Search Manifestos (Existing Topics)
                const topicRes = await fetch(`${API_URL}/manifestos`);
                const topicData = await topicRes.json();
                const filteredTopics = topicData.filter(t => 
                    t.title.toLowerCase().includes(query.toLowerCase()) || 
                    t.description.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);

                setResults({ users: userData, manifestos: filteredTopics });
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div style={{ position: 'relative', width: '300px' }} ref={dropdownRef}>
            <div style={{ position: 'relative' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
                <input
                    type="text"
                    placeholder="Search people or visions..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowDropdown(true)}
                    style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        borderRadius: '100px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query) {
                            setShowDropdown(false);
                            // Potentially navigate to a full search results page
                        }
                    }}
                />
            </div>

            {showDropdown && (results.users.length > 0 || results.manifestos.length > 0) && (
                <div className="glass-effect" style={{
                    position: 'absolute',
                    top: '50px',
                    left: '0',
                    right: '0',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    zIndex: 2000,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '8px 0'
                }}>
                    {results.users.length > 0 && (
                        <div>
                            <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>PEOPLE</div>
                            {results.users.map(u => (
                                <Link 
                                    key={u.id} 
                                    to={`/profile/${u.id}`} 
                                    onClick={() => { setShowDropdown(false); setQuery(''); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', textDecoration: 'none', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <img 
                                        src={u.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`} 
                                        alt={u.username} 
                                        style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
                                    />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{u.username}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.manifestos.length > 0 && (
                        <div style={{ borderTop: results.users.length > 0 ? '1px solid var(--glass-border)' : 'none', marginTop: results.users.length > 0 ? '8px' : '0' }}>
                            <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>VISIONS</div>
                            {results.manifestos.map(m => (
                                <Link 
                                    key={m.id} 
                                    to={`/manifesto/${m.id}`} 
                                    onClick={() => { setShowDropdown(false); setQuery(''); }}
                                    style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{m.title}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.description}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;

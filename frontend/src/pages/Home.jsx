import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManifestoCard from '../components/ManifestoCard';
import TopCommentsToday from '../components/TopCommentsToday';
import TopIdeas from '../components/TopIdeas';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manifestos, setManifestos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topComments, setTopComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 4;
  const RETRY_DELAY = 5000; // 5 seconds between retries

  const fetchData = async (attempt = 0) => {
    try {
      const [manifestoRes, trendRes, topRes] = await Promise.all([
        fetch(`${API_URL}/manifestos`),
        fetch(`${API_URL}/manifestos/trending`),
        fetch(`${API_URL}/top/daily`)
      ]);

      // Server is reachable — check if it returned errors
      if (!manifestoRes.ok) {
        const errData = await manifestoRes.json().catch(() => ({}));
        const isQuota = errData?.error?.includes('Quota') || errData?.error?.includes('RESOURCE_EXHAUSTED');
        setError(isQuota
          ? '⚠️ Firebase daily read quota has been reached. Data will be available again in a few hours.'
          : `Server error: ${errData.error || manifestoRes.statusText}`
        );
        setLoading(false);
        return;
      }

      const [all, trend, top] = await Promise.all([
        manifestoRes.json(),
        trendRes.json().catch(() => []),
        topRes.json().catch(() => [])
      ]);

      setManifestos(Array.isArray(all) ? all : []);
      setTrending(Array.isArray(trend) ? trend : []);
      setTopComments(Array.isArray(top) ? top : []);
      setError(null);
      setLoading(false);
    } catch (err) {
      // Network error — server is unreachable (cold start)
      console.error(err);
      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt + 1);
        setTimeout(() => fetchData(attempt + 1), RETRY_DELAY);
      } else {
        setError(`Could not connect to the server. It may be starting up — please refresh in 30 seconds.`);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(0);
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
      console.error('Topic Voting Error:', error);
    }
  };

  const handleCommentVote = async (manifestoId, commentId, voteType) => {
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
      console.error('Comment Voting Error:', error);
    }
  };

  const handleTopicDelete = async (topicId) => {
    try {
      const response = await fetch(`${API_URL}/manifestos/${topicId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setManifestos(prev => prev.filter(m => m.id !== topicId));
        setTrending(prev => prev.filter(m => m.id !== topicId));
      } else {
        const data = await response.json();
        alert('Failed to delete topic: ' + (data.error || response.statusText));
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Network error or server unreachable while deleting topic.');
    }
  };


  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 40px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '24px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1.5rem' }}>Starting up...</h2>
      {retryCount > 0 ? (
        <p style={{ fontWeight: 500 }}>The server is waking up (attempt {retryCount}/{MAX_RETRIES}). This takes about 30 seconds on first load.</p>
      ) : (
        <p style={{ fontWeight: 500 }}>Loading JanAawaz platform...</p>
      )}
      <div style={{ marginTop: '32px', width: '200px', height: '4px', background: 'var(--surface-2)', borderRadius: '100px', margin: '32px auto 0' }}>
        <div style={{ height: '100%', borderRadius: '100px', background: 'var(--secondary)', width: `${(retryCount / MAX_RETRIES) * 100}%`, transition: 'width 0.5s ease' }}></div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '120px 40px' }}>
      <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '16px' }}>⚠️ {error}</p>
      <button className="btn-premium" onClick={() => { setLoading(true); setRetryCount(0); fetchData(0); }}>
        RETRY
      </button>
    </div>
  );

  return (
    <>
      <section className="hero animate-float" style={{ textAlign: 'center', marginBottom: '100px', paddingTop: '40px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', marginBottom: '24px', letterSpacing: 'clamp(-1px, -0.3vw, -3px)', lineHeight: 1, fontWeight: 900 }}>
          Building the Nepal <span style={{ 
            background: 'linear-gradient(to right, var(--secondary), #f87171)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
          }}>of Tomorrow</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.4rem)', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', marginBottom: '48px', fontWeight: 500, lineHeight: 1.6 }}>
          A community-driven sanctuary to debate, refine, and champion the policies that will define our future.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user && (
            <Link to="/create-topic" className="btn-premium" style={{ padding: '16px 36px', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', letterSpacing: '0.5px', background: 'var(--secondary)', color: 'white' }}>
              Propose a Vision
            </Link>
          )}
          <Link to="/top" style={{ padding: '16px 36px', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 700, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', color: 'var(--primary)', background: 'var(--surface-1)' }}>
            Explore Top Ideas
          </Link>
        </div>
      </section>

      <div className="home-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {/* Priorities for the PM Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '4px', height: '32px', background: '#dc2626', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '2.2rem', letterSpacing: '-1px', color: 'var(--primary)' }}>Priorities for the PM</h2>
              </div>
              <Link to="/for-pm" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>View All Demands</Link>
            </div>

            {error && (
              <div className="glass-effect" style={{ background: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.1)', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
                <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {manifestos.filter(m => m.category === 'Citizen Demand').slice(0, 3).map(topic => (
                <ManifestoCard
                  key={topic.id}
                  {...topic}
                  onVote={handleTopicVote}
                  onDelete={handleTopicDelete}
                />
              ))}
              {manifestos.filter(m => m.category === 'Citizen Demand').length === 0 && !loading && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>No urgent tasks currently listed for the PM.</p>
              )}
            </div>
          </section>

          {/* Active Discussions Section (Balen) */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '4px', height: '32px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '2.2rem', letterSpacing: '-1px', color: 'var(--primary)' }}>Active Discussions</h2>
              </div>
              <Link to="/discussions" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Explore All</Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading visions...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                {manifestos.filter(m => m.createdById === 'SYSTEM').slice(0, 6).map(topic => (
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
              </div>
            )}
          </section>

            {/* Trending Discussions Section */}
          <section>
            <div className="glass-effect" style={{ padding: '48px', background: 'var(--surface-1)' }}>
              <h2 style={{ marginBottom: '40px', fontSize: '2rem', color: 'var(--primary)' }}>Trending Now</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
                {trending.length > 0 ? trending.map(topic => (
                  <div key={topic.id} className="hover-glow" style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}>
                    <Link to={`/manifesto/${topic.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.2rem', display: 'block', marginBottom: '12px' }}>
                      {topic.title}
                    </Link>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <span>{topic.voteCount || 0} votes</span>
                      <span style={{ opacity: 0.3 }}>|</span>
                      <span>{topic.commentCount || 0} comments</span>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-muted)' }}>The trending board is awaiting your input.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <TopCommentsToday 
            comments={topComments} 
            onVote={handleCommentVote}
            onReply={(mid) => navigate(`/manifesto/${mid}`)}
          />
          
          <div className="glass-effect" style={{ padding: '32px', background: 'var(--surface-1)' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--primary)', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>COMMUNITY IMPACT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Ideas</span>
                <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{manifestos.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Comments</span>
                <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{manifestos.reduce((acc, m) => acc + (m.commentCount || 0), 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Votes</span>
                <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{manifestos.reduce((acc, m) => acc + (m.voteCount || 0), 0)}</span>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
                  * Metrics represent real-time community engagement and policy consensus across the platform.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Home;

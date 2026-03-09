import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useState, useRef, useEffect } from 'react';
import '../index.css';
import SearchBar from './SearchBar';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  const getNotificationText = (n) => {
    switch (n.type) {
      case 'VOTE': return `upvoted your ${n.commentId ? 'comment' : 'vision'}`;
      case 'COMMENT': return 'commented on your vision';
      case 'REPLY': return 'replied to your comment';
      default: return 'interacted with your content';
    }
  };

  const handleMenuLinkClick = () => setMenuOpen(false);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-effect" style={{ height: '80px', position: 'sticky', top: 0, zIndex: 1000, borderRadius: 0, width: '100%', borderTop: 'none', borderLeft: 'none', borderRight: 'none', overflow: 'visible' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 24px' }}>
          <Link to="/" onClick={handleMenuLinkClick} className="logo" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '1px', flexShrink: 0 }}>
            जनआवाज
          </Link>

          {/* Desktop SearchBar */}
          <div className="desktop-only" style={{ flex: 1, maxWidth: '320px', margin: '0 24px' }}>
            <SearchBar />
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-only" style={{ alignItems: 'center', gap: '28px' }}>
            <Link to="/top" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Top Ideas</Link>
            {user && <Link to="/messages" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Messages</Link>}
            <Link to="/for-pm" style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>For the PM</Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{ background: 'transparent', border: 'none', color: unreadCount > 0 ? 'var(--secondary)' : 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
                  >
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc2626', color: 'white', fontSize: '0.65rem', padding: '2px 5px', borderRadius: '10px', minWidth: '18px', fontWeight: 800 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="glass-effect" style={{ position: 'absolute', top: '50px', right: '0', width: '320px', maxHeight: '400px', overflowY: 'auto', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '16px', zIndex: 1100 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>NOTIFICATIONS</span>
                        <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <Link 
                            key={n.id} 
                            to={`/manifesto/${n.manifestoId}`}
                            onClick={() => { markAsRead(n.id); setShowNotifications(false); }}
                            style={{ 
                              display: 'block', 
                              textDecoration: 'none', 
                              padding: '12px', 
                              borderRadius: 'var(--radius-sm)', 
                              marginBottom: '8px', 
                              background: n.isRead ? 'transparent' : 'rgba(220, 38, 38, 0.03)', 
                              border: '1px solid', 
                              borderColor: n.isRead ? 'var(--glass-border)' : 'rgba(220, 38, 38, 0.1)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: '4px', fontWeight: n.isRead ? 400 : 600 }}>
                              <span style={{ fontWeight: 800, color: n.isRead ? 'var(--text-muted)' : 'var(--secondary)' }}>{n.senderName}</span> {getNotificationText(n)}
                            </div>
                            {n.contentPreview && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: n.isRead ? 0.6 : 1 }}>
                                "{n.contentPreview}..."
                              </div>
                            )}
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, opacity: n.isRead ? 0.5 : 0.8 }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Link to="/profile/me" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Profile" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--secondary)', padding: '2px' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email.split('@')[0]}</span>
                </Link>
                <button onClick={() => logout()} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign Out</button>
              </div>
            ) : (
              <Link to="/login" className="btn-premium">Sign In</Link>
            )}
          </nav>

          {/* Mobile: bell icon (if logged in) + hamburger */}
          <div className="mobile-only" style={{ alignItems: 'center', gap: '12px' }}>
            {user && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'transparent', border: 'none', color: unreadCount > 0 ? 'var(--secondary)' : 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc2626', color: 'white', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '10px', minWidth: '16px', fontWeight: 800 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="glass-effect" style={{ position: 'fixed', top: '80px', right: '12px', left: '12px', maxHeight: '380px', overflowY: 'auto', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '16px', zIndex: 1100 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>NOTIFICATIONS</span>
                      <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <Link 
                          key={n.id} 
                          to={`/manifesto/${n.manifestoId}`}
                          onClick={() => { markAsRead(n.id); setShowNotifications(false); }}
                          style={{ display: 'block', textDecoration: 'none', padding: '12px', borderRadius: '8px', marginBottom: '8px', background: n.isRead ? 'transparent' : 'rgba(220,38,38,0.03)', border: '1px solid', borderColor: n.isRead ? 'var(--glass-border)' : 'rgba(220,38,38,0.1)' }}
                        >
                          <div style={{ fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: n.isRead ? 400 : 600 }}>
                            <span style={{ fontWeight: 800, color: n.isRead ? 'var(--text-muted)' : 'var(--secondary)' }}>{n.senderName}</span> {getNotificationText(n)}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '1.1rem', color: 'var(--primary)', cursor: 'pointer' }}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-menu-overlay${menuOpen ? ' open' : ''}`}>
        {/* Search on mobile */}
        <div style={{ marginBottom: '8px' }}>
          <SearchBar />
        </div>
        <div className="mobile-nav-divider" />
        <Link to="/top" onClick={handleMenuLinkClick} className="mobile-nav-link">Top Ideas</Link>
        <Link to="/for-pm" onClick={handleMenuLinkClick} className="mobile-nav-link red">For the PM</Link>
        {user && <Link to="/messages" onClick={handleMenuLinkClick} className="mobile-nav-link">Messages</Link>}
        {user && <Link to="/profile/me" onClick={handleMenuLinkClick} className="mobile-nav-link">My Profile</Link>}
        {user && <Link to="/create-topic" onClick={handleMenuLinkClick} className="mobile-nav-link">Propose a Vision</Link>}
        <div className="mobile-nav-divider" />
        {user ? (
          <button onClick={() => { logout(); handleMenuLinkClick(); }} className="mobile-nav-link" style={{ color: '#dc2626', fontWeight: 700 }}>Sign Out</button>
        ) : (
          <Link to="/login" onClick={handleMenuLinkClick} className="btn-premium" style={{ textAlign: 'center', marginTop: '8px' }}>Sign In</Link>
        )}
      </div>

      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        {children}
      </main>
      <footer style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--primary)', margin: 0 }}>&copy; 2026 जनआवाज. ALL RIGHTS RESERVED.</p>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/about" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>About Us</Link>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Privacy Policy</Link>
            <a href="https://www.instagram.com/dahal.binayak/?hl=en" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
              <i className="fab fa-instagram" style={{ fontSize: '1.2rem' }}></i> @dahal.binayak
            </a>
            <a href="https://www.facebook.com/dahal.binayak/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
              <i className="fab fa-facebook" style={{ fontSize: '1.2rem' }}></i> Binayak Dahal
            </a>
          </div>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Connect with us: <a href="mailto:avisionportal.connect@gmail.com" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 700 }}>avisionportal.connect@gmail.com</a>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.6, fontWeight: 600 }}>
              Developed with passion by Binayak Dahal
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

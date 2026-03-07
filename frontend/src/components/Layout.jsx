import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-effect" style={{ height: '80px', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, width: '100%', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 24px' }}>
          <Link to="/" className="logo" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '1px' }}>
            जनआवाज
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/top" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Top Ideas</Link>
            <Link to="/for-pm" style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.95rem' }}>For the PM</Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/profile/me" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                  <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--secondary)', padding: '2px' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user.displayName || user.email.split('@')[0]}</span>
                </Link>
                <button onClick={() => logout()} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 160x', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
              </div>
            ) : (
              <Link to="/login" className="btn-premium">Sign In</Link>
            )}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        {children}
      </main>
      <footer style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--primary)', margin: 0 }}>&copy; 2026 जनआवाज. ALL RIGHTS RESERVED.</p>
          
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
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

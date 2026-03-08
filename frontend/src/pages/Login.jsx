import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '../firebase';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Google Login Error:', error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Email Auth Error:', error);
    }
  };

  if (user) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto' }}>
        <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} 
            alt={user.displayName} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px', border: '3px solid var(--secondary)', padding: '3px' }} 
          />
          <h2 style={{ marginBottom: '10px' }}>Namaste, {user.displayName || user.email.split('@')[0]}!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>You are signed in.</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '450px', margin: '100px auto' }}>
      <div className="glass-effect animate-fade-in" style={{ padding: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2rem', letterSpacing: '-1px', fontWeight: 900 }}>
          {isSignUp ? 'ESTABLISH IDENTITY' : 'WELCOME BACK'}
        </h2>

        {error && <div style={{ color: '#ef4444', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <form onSubmit={handleEmailAuth}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '1px' }}>EMAIL</label>
            <input
              type="email"
              placeholder="strategic@janaawaz.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="premium-input"
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '1px' }}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="premium-input"
            />
          </div>
          <button className="btn-premium" style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'black' }}>
            {isSignUp ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already registered?' : "New to the collective?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ foreground: 'none', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}
          >
            {isSignUp ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '32px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>EXTERNAL AUTH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            transition: 'all 0.3s ease'
          }}
          className="hover-glow"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
          AUTHENTICATE WITH GOOGLE
        </button>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage('✅ Login successful! Redirecting...');
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#e9f5f5',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#2d3748',
            fontWeight: 600,
          }}
        >
          🏥 MediPal Hospital Login
        </h2>

        <form onSubmit={handleLogin}>
          <label style={{ fontWeight: 500, color: '#4a5568' }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.25rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e0',
              fontSize: '1rem',
            }}
          />

          <label style={{ fontWeight: 500, color: '#4a5568' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.25rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e0',
              fontSize: '1rem',
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3182ce',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔐 Login
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '1rem',
              color: message.includes('successful') ? 'green' : 'red',
              textAlign: 'center',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

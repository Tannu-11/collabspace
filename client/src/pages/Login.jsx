import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      {/* Left */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>⚡</div>
            <span style={s.brandName}>CollabSpace</span>
          </div>
          <h1 style={s.hero}>
            Collaborate.<br />
            <span className="gold-text">Ship faster.</span>
          </h1>
          <p style={s.sub}>The project management tool built for students and startups. Free, fast, powerful.</p>
          <div style={s.features}>
            {['🗂️  Kanban boards with drag & drop', '💬  Real-time team chat', '📅  Deadlines & priority tracking', '👥  Invite teammates instantly'].map((f, i) => (
              <div key={i} style={s.feat} className={`anim-fade d${i+1}`}>{f}</div>
            ))}
          </div>
        </div>
        <div style={s.orb} />
      </div>

      {/* Right */}
      <div style={s.right}>
        <div style={s.card} className="anim-scale">
          <h2 style={s.title}>Sign in</h2>
          <p style={s.cardSub}>Welcome back to your workspace</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div>
              <label className="field-label">Email</label>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" placeholder="••••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <p style={s.footer}>
            No account? <Link to="/register" style={s.link}>Create one free</Link>
          </p>
        </div>
      </div>

      {/* Bottom orb */}
      <div style={s.orb2} />
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: '#000', position: 'relative', overflow: 'hidden',
  },
  left: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '60px',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
  },
  leftInner: { position: 'relative', zIndex: 2, maxWidth: '480px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' },
  brandIcon: {
    width: '36px', height: '36px', borderRadius: '9px',
    background: 'linear-gradient(135deg,#f5c518,#e6b800)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '17px', boxShadow: '0 4px 20px rgba(245,197,24,0.35)',
  },
  brandName: { fontFamily: 'Outfit,sans-serif', fontWeight: '800', fontSize: '20px' },
  hero: { fontSize: '52px', lineHeight: 1.1, marginBottom: '18px', fontFamily: 'Outfit,sans-serif', fontWeight: '900' },
  sub: { color: '#666', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' },
  features: { display: 'flex', flexDirection: 'column', gap: '10px' },
  feat: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px', padding: '13px 18px',
    fontSize: '14px', color: '#888',
    backdropFilter: 'blur(10px)',
  },
  orb: {
    position: 'absolute', bottom: '-20%', left: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,24,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  right: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '60px 40px',
  },
  card: {
    width: '100%', maxWidth: '420px',
    background: '#0f0f0f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '40px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(245,197,24,0.05)',
  },
  title: { fontSize: '28px', fontFamily: 'Outfit,sans-serif', fontWeight: '800', marginBottom: '6px' },
  cardSub: { color: '#555', fontSize: '14px', marginBottom: '32px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#555' },
  link: { color: '#f5c518', textDecoration: 'none', fontWeight: '600' },
  orb2: {
    position: 'fixed', top: '-30%', right: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,24,0.03) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
};
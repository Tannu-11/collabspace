import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.inner}>
          <div style={s.brand}>
            <div style={s.icon}>⚡</div>
            <span style={s.bname}>CollabSpace</span>
          </div>
          <h1 style={s.hero}>Your team.<br /><span className="gold-text">One workspace.</span></h1>
          <p style={s.sub}>Everything your team needs to stay organized and ship on time.</p>
          <div style={s.stats}>
            {[{v:'Free',l:'Forever'},{v:'Real-time',l:'Collaboration'},{v:'No limit',l:'On Projects'}].map((s2,i)=>(
              <div key={i} style={s.stat} className={`anim-fade d${i+1}`}>
                <div style={s.sv}>{s2.v}</div>
                <div style={s.sl}>{s2.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.orb} />
      </div>

      <div style={s.right}>
        <div style={s.card} className="anim-scale">
          <h2 style={s.title}>Create account</h2>
          <p style={s.csub}>Free forever. No credit card needed.</p>
          <form onSubmit={handleSubmit} style={s.form}>
            <div>
              <label className="field-label">Full Name</label>
              <input placeholder="Your full name" value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})} required />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{width:'100%',marginTop:'4px'}} disabled={loading}>
              {loading ? <><span className="spinner"/>Creating...</> : 'Get Started Free →'}
            </button>
          </form>
          <p style={s.footer}>
            Have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'#000' },
  left: { display:'flex', alignItems:'center', justifyContent:'center', padding:'60px', borderRight:'1px solid rgba(255,255,255,0.05)', position:'relative', overflow:'hidden' },
  inner: { position:'relative', zIndex:2, maxWidth:'460px' },
  brand: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'52px' },
  icon: { width:'36px', height:'36px', borderRadius:'9px', background:'linear-gradient(135deg,#f5c518,#e6b800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', boxShadow:'0 4px 20px rgba(245,197,24,0.35)' },
  bname: { fontFamily:'Outfit,sans-serif', fontWeight:'800', fontSize:'20px' },
  hero: { fontSize:'50px', lineHeight:1.1, marginBottom:'18px', fontFamily:'Outfit,sans-serif', fontWeight:'900' },
  sub: { color:'#666', fontSize:'15px', lineHeight:1.7, marginBottom:'44px' },
  stats: { display:'flex', gap:'32px' },
  stat: { display:'flex', flexDirection:'column', gap:'4px' },
  sv: { fontFamily:'Outfit,sans-serif', fontSize:'22px', fontWeight:'800', color:'#f5c518' },
  sl: { fontSize:'12px', color:'#555', letterSpacing:'0.05em' },
  orb: { position:'absolute', top:'-10%', right:'-15%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,197,24,0.06) 0%,transparent 70%)', pointerEvents:'none' },
  right: { display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px' },
  card: { width:'100%', maxWidth:'420px', background:'#0f0f0f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'40px', boxShadow:'0 32px 80px rgba(0,0,0,0.8)' },
  title: { fontSize:'28px', fontFamily:'Outfit,sans-serif', fontWeight:'800', marginBottom:'6px' },
  csub: { color:'#555', fontSize:'14px', marginBottom:'32px' },
  form: { display:'flex', flexDirection:'column', gap:'20px' },
  footer: { textAlign:'center', marginTop:'24px', fontSize:'14px', color:'#555' },
  link: { color:'#f5c518', textDecoration:'none', fontWeight:'600' },
};
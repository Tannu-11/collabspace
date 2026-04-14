import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/projects', form);
      toast.success('Project created!');
      setProjects(prev => [...prev, data]);
      setForm({ name: '', description: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
    toast.success('Deleted');
  };

  const COLORS = ['#f5c518','#4ade80','#60a5fa','#f472b6','#fb923c','#a78bfa'];
  const gc = (name) => COLORS[name?.charCodeAt(0) % COLORS.length];

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header} className="anim-fade">
          <div>
            <p style={s.greet}>Good day, {user?.name?.split(' ')[0]} 👋</p>
            <h1 style={s.title}>Your Workspace</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}
            style={{ padding: '12px 24px' }}>
            {showForm ? '✕ Cancel' : '+ New Project'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={s.formBox} className="anim-scale">
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:'17px', marginBottom:'20px' }}>
              New Project
            </h3>
            <form onSubmit={createProject}>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:'200px' }}>
                  <label className="field-label">Project Name *</label>
                  <input placeholder="e.g. Final Year Project"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div style={{ flex:2, minWidth:'200px' }}>
                  <label className="field-label">Description</label>
                  <input placeholder="What's this project about?"
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary"
                  style={{ alignSelf:'flex-end', padding:'11px 24px' }}>
                  Create →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={s.stats} className="anim-fade d1">
          {[
            { icon:'🗂️', label:'Projects',      val: projects.length,                                      col:'#f5c518' },
            { icon:'👥', label:'Team Members',  val: [...new Set(projects.flatMap(p => p.members.map(m => m._id)))].length, col:'#4ade80' },
            { icon:'⚡', label:'Active',         val: projects.length,                                      col:'#60a5fa' },
          ].map((st, i) => (
            <div key={i} style={s.statCard}>
              <span style={{ fontSize:'28px' }}>{st.icon}</span>
              <div>
                <div style={{ ...s.statVal, color: st.col }}>{st.val}</div>
                <div style={s.statLbl}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={s.center}>
            <span className="spinner spinner-gold" style={{ width:'36px', height:'36px', borderWidth:'3px' }} />
          </div>
        ) : projects.length === 0 ? (
          <div style={s.empty} className="anim-fade">
            <div style={{ fontSize:'56px', marginBottom:'16px' }} className="anim-float">🚀</div>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:'22px', marginBottom:'8px' }}>No projects yet</h3>
            <p style={{ color:'#555', marginBottom:'24px' }}>Create your first project and start collaborating</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Project</button>
          </div>
        ) : (
          <div style={s.grid}>
            {projects.map((p, i) => (
              <div key={p._id} style={s.card}
                className={`anim-fade d${Math.min(i+1,5)}`}
                onClick={() => navigate(`/project/${p._id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'rgba(245,197,24,0.3)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(245,197,24,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ ...s.cardTop, background: gc(p.name) + '15', borderBottom:`1px solid ${gc(p.name)}20` }}>
                  <div style={{ ...s.cardAvatar, background: gc(p.name) + '20', color: gc(p.name) }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <button className="btn btn-danger btn-sm"
                    onClick={e => deleteProject(e, p._id)}>
                    Delete
                  </button>
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardName}>{p.name}</h3>
                  <p style={s.cardDesc}>{p.description || 'No description'}</p>
                  <div style={s.cardFoot}>
                    <div style={s.memberStack}>
                      {p.members.slice(0,4).map((m,mi) => (
                        <div key={m._id} style={{ ...s.dot, background: COLORS[mi%COLORS.length], marginLeft: mi>0?'-8px':'0' }} title={m.name}>
                          {m.name[0].toUpperCase()}
                        </div>
                      ))}
                      <span style={s.memCount}>{p.members.length} member{p.members.length!==1?'s':''}</span>
                    </div>
                    <span style={s.open}>Open →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#000' },
  wrap: { maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'32px' },
  greet: { color:'#555', fontSize:'14px', marginBottom:'6px' },
  title: { fontSize:'38px', fontFamily:'Outfit,sans-serif', fontWeight:'900' },
  formBox: { background:'#0f0f0f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'28px' },
  stats: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' },
  statCard: { background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px 24px', display:'flex', alignItems:'center', gap:'16px' },
  statVal: { fontFamily:'Outfit,sans-serif', fontSize:'32px', fontWeight:'900', lineHeight:1 },
  statLbl: { fontSize:'12px', color:'#555', marginTop:'4px', letterSpacing:'0.05em' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' },
  card: { background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', cursor:'pointer', transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)' },
  cardTop: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  cardAvatar: { width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:'800', fontSize:'18px' },
  cardBody: { padding:'16px 20px 20px' },
  cardName: { fontSize:'17px', fontFamily:'Outfit,sans-serif', fontWeight:'700', marginBottom:'6px' },
  cardDesc: { fontSize:'13px', color:'#555', lineHeight:1.6, marginBottom:'16px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  cardFoot: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  memberStack: { display:'flex', alignItems:'center', gap:'6px' },
  dot: { width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:'#000', border:'2px solid #0a0a0a' },
  memCount: { fontSize:'12px', color:'#555', marginLeft:'8px' },
  open: { fontSize:'13px', color:'#f5c518', fontWeight:'600', fontFamily:'Outfit,sans-serif' },
  center: { display:'flex', justifyContent:'center', padding:'80px' },
  empty: { textAlign:'center', padding:'80px 20px' },
};
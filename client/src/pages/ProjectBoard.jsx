import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import ChatBox from '../components/ChatBox';
import toast from 'react-hot-toast';

const COLS = [
  { id:'todo',       label:'To Do',       icon:'📋', color:'#666',     glow:'rgba(100,100,100,0.08)' },
  { id:'inprogress', label:'In Progress', icon:'⚡', color:'#f5c518',  glow:'rgba(245,197,24,0.08)'  },
  { id:'done',       label:'Done',        icon:'✅', color:'#4ade80',  glow:'rgba(74,222,128,0.08)'  },
];

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [modal, setModal]       = useState(false);
  const [addMem, setAddMem]     = useState(false);
  const [memEmail, setMemEmail] = useState('');
  const [chat, setChat]         = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pr, tr] = await Promise.all([
          API.get('/projects'),
          API.get(`/tasks/${id}`)
        ]);
        const found = pr.data.find(p => p._id === id);
        if (!found) { navigate('/'); return; }
        setProject(found);
        setTasks(tr.data);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const onDragEnd = async ({ draggableId, destination }) => {
    if (!destination) return;
    setTasks(p => p.map(t => t._id === draggableId ? {...t, status: destination.droppableId} : t));
    await API.put(`/tasks/${draggableId}`, { status: destination.droppableId });
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/projects/${id}/add-member`, { email: memEmail });
      setProject(data); setMemEmail(''); setAddMem(false);
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'User not found'); }
  };

  const colTasks = (cid) => tasks.filter(t => t.status === cid);

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#000'}}>
      <Navbar />
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'calc(100vh - 60px)'}}>
        <span className="spinner spinner-gold" style={{width:'40px',height:'40px',borderWidth:'3px'}} />
        <p style={{color:'#444',marginTop:'16px'}}>Loading project...</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header} className="anim-fade">
          <div style={s.hl}>
            <div style={s.badge}>{project?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 style={s.title}>{project?.name}</h1>
              {project?.description && <p style={s.desc}>{project.description}</p>}
            </div>
          </div>
          <div style={s.hr}>
            <div style={s.mems}>
              {project?.members?.slice(0,5).map((m,i) => (
                <div key={m._id} title={m.name} style={{...s.memAv, marginLeft: i>0?'-10px':'0', zIndex:10-i}}>
                  {m.name[0].toUpperCase()}
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{marginLeft:'10px'}}
                onClick={() => setAddMem(!addMem)}>+ Member</button>
            </div>
            <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Task</button>
            <button className={`btn btn-${chat?'secondary':'ghost'} btn-sm`}
              style={{border:'1px solid rgba(255,255,255,0.08)'}}
              onClick={() => setChat(!chat)}>
              💬 {chat ? 'Hide' : 'Chat'}
            </button>
          </div>
        </div>

        {/* Add member */}
        {addMem && (
          <div style={s.memBox} className="anim-scale">
            <form onSubmit={addMember} style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <label className="field-label">Add member by email</label>
                <input type="email" placeholder="teammate@example.com"
                  value={memEmail} onChange={e => setMemEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{padding:'11px 20px'}}>Add</button>
              <button type="button" className="btn btn-ghost" onClick={() => setAddMem(false)}
                style={{padding:'11px 16px',border:'1px solid rgba(255,255,255,0.08)'}}>Cancel</button>
            </form>
          </div>
        )}

        {/* Stats bar */}
        <div style={s.statsBar} className="anim-fade d1">
          {COLS.map(c => (
            <div key={c.id} style={{...s.statPill, background:c.glow, borderColor:c.color+'30'}}>
              <span>{c.icon}</span>
              <span style={{color:c.color,fontWeight:'700',fontFamily:'Outfit,sans-serif'}}>{colTasks(c.id).length}</span>
              <span style={{color:'#555',fontSize:'13px'}}>{c.label}</span>
            </div>
          ))}
          <div style={s.totalPill}>
            <span style={{color:'#555',fontSize:'13px'}}>Total</span>
            <span style={{color:'#f5c518',fontWeight:'700',fontFamily:'Outfit,sans-serif'}}>{tasks.length} tasks</span>
          </div>
        </div>

        {/* Board + Chat */}
        <div style={{display:'grid', gridTemplateColumns: chat ? '1fr 360px' : '1fr', gap:'20px', alignItems:'start'}}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={s.board}>
              {COLS.map((col, ci) => (
                <div key={col.id} style={s.col} className={`anim-fade d${ci+1}`}>
                  <div style={s.colHead}>
                    <div style={s.colLeft}>
                      <div style={{...s.colDot, background:col.color, boxShadow:`0 0 8px ${col.color}80`}} />
                      <span style={s.colLabel}>{col.icon} {col.label}</span>
                    </div>
                    <span style={{...s.colCount, background:col.glow, color:col.color, borderColor:col.color+'30'}}>
                      {colTasks(col.id).length}
                    </span>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(prov, snap) => (
                      <div ref={prov.innerRef} {...prov.droppableProps}
                        style={{...s.drop, background: snap.isDraggingOver ? col.glow : 'transparent', borderColor: snap.isDraggingOver ? col.color+'40' : 'transparent'}}>
                        {colTasks(col.id).map((task, idx) => (
                          <Draggable key={task._id} draggableId={task._id} index={idx}>
                            {(prov2, snap2) => (
                              <div ref={prov2.innerRef} {...prov2.draggableProps} {...prov2.dragHandleProps}
                                style={{...prov2.draggableProps.style, opacity: snap2.isDragging ? 0.85 : 1}}>
                                <TaskCard task={task} onDelete={did => setTasks(p => p.filter(t => t._id !== did))} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {prov.placeholder}
                        {colTasks(col.id).length === 0 && !snap.isDraggingOver && (
                          <div style={s.emptyCol}>
                            <span style={{fontSize:'28px',opacity:0.15}}>{col.icon}</span>
                            <p style={{color:'#333',fontSize:'12px',marginTop:'8px'}}>Drop tasks here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>

          {chat && (
            <div style={{position:'sticky', top:'80px', height:'calc(100vh - 120px)'}}>
              <ChatBox projectId={id} />
            </div>
          )}
        </div>
      </div>

      {modal && (
        <CreateTaskModal projectId={id} members={project?.members||[]}
          onClose={() => setModal(false)}
          onCreated={task => setTasks(p => [...p, task])} />
      )}
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#000' },
  wrap: { maxWidth:'1400px', margin:'0 auto', padding:'32px 24px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' },
  hl: { display:'flex', alignItems:'center', gap:'16px' },
  badge: { width:'52px', height:'52px', borderRadius:'13px', background:'linear-gradient(135deg,#f5c518,#e6b800)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:'900', fontSize:'22px', color:'#000', boxShadow:'0 4px 24px rgba(245,197,24,0.3)', flexShrink:0 },
  title: { fontSize:'26px', fontFamily:'Outfit,sans-serif', fontWeight:'800' },
  desc: { fontSize:'13px', color:'#555', marginTop:'2px' },
  hr: { display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' },
  mems: { display:'flex', alignItems:'center' },
  memAv: { width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#f5c518,#e6b800)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:'800', fontSize:'12px', color:'#000', border:'2px solid #000', cursor:'default' },
  memBox: { background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px 24px', marginBottom:'24px' },
  statsBar: { display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' },
  statPill: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'99px', border:'1px solid', fontSize:'13px' },
  totalPill: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'99px', background:'rgba(245,197,24,0.05)', border:'1px solid rgba(245,197,24,0.15)', fontSize:'13px', marginLeft:'auto' },
  board: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' },
  col: { background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'16px', minHeight:'520px', display:'flex', flexDirection:'column' },
  colHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', paddingBottom:'14px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  colLeft: { display:'flex', alignItems:'center', gap:'8px' },
  colDot: { width:'8px', height:'8px', borderRadius:'50%' },
  colLabel: { fontFamily:'Outfit,sans-serif', fontWeight:'700', fontSize:'14px' },
  colCount: { borderRadius:'99px', padding:'2px 10px', fontSize:'12px', fontWeight:'700', border:'1px solid', fontFamily:'Outfit,sans-serif' },
  drop: { flex:1, borderRadius:'10px', border:'2px dashed transparent', transition:'all 0.2s', padding:'4px', minHeight:'400px' },
  emptyCol: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'180px', textAlign:'center' },
};
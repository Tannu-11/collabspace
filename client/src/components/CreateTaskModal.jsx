import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title:'', description:'', priority:'medium', deadline:'', assignedTo:'' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/tasks', { ...form, project: projectId });
      toast.success('Task created!');
      onCreated(data); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
    setLoading(false);
  };

  const PC = { high:'#ff4d4d', medium:'#f5c518', low:'#4ade80' };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px'}}>
          <div>
            <h3 style={{fontSize:'22px',fontFamily:'Outfit,sans-serif',fontWeight:'800',marginBottom:'4px'}}>New Task</h3>
            <p style={{fontSize:'13px',color:'#555'}}>Add a task to this board</p>
          </div>
          <button onClick={onClose}
            style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
              color:'#666',cursor:'pointer',borderRadius:'8px',width:'32px',height:'32px',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>✕</button>
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          <div>
            <label className="field-label">Title *</label>
            <input placeholder="What needs to be done?" value={form.title} autoFocus
              onChange={e=>setForm({...form,title:e.target.value})} required />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea placeholder="Add more details..." rows={3}
              value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
          <div style={{display:'flex',gap:'16px'}}>
            <div style={{flex:1}}>
              <label className="field-label">Priority</label>
              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <label className="field-label">Deadline</label>
              <input type="date" value={form.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e=>setForm({...form,deadline:e.target.value})} />
            </div>
          </div>
          <div>
            <label className="field-label">Assign To</label>
            <select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}>
              <option value="">Unassigned</option>
              {members.map(m=><option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
            </select>
          </div>

          {/* Preview */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'10px',padding:'12px 16px'}}>
            <p style={{fontSize:'11px',color:'#444',fontFamily:'Outfit,sans-serif',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'8px'}}>Preview</p>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:PC[form.priority],flexShrink:0,boxShadow:`0 0 6px ${PC[form.priority]}`}} />
              <span style={{fontSize:'13px',fontWeight:'600',fontFamily:'Outfit,sans-serif'}}>{form.title||'Task title...'}</span>
              <span style={{fontSize:'11px',color:'#444',marginLeft:'auto'}}>{form.priority}</span>
            </div>
          </div>

          <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}
              style={{border:'1px solid rgba(255,255,255,0.08)'}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/>Creating...</> : '+ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
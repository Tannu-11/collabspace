import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const P = {
  high:   { color:'#ff4d4d', bg:'rgba(255,77,77,0.08)',   border:'rgba(255,77,77,0.2)',   label:'High'   },
  medium: { color:'#f5c518', bg:'rgba(245,197,24,0.08)',  border:'rgba(245,197,24,0.2)',  label:'Medium' },
  low:    { color:'#4ade80', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.2)',  label:'Low'    },
};

export default function TaskCard({ task, onDelete }) {
  const [hov, setHov] = useState(false);
  const p = P[task.priority] || P.medium;
  const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const fmt = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});

  const del = async (e) => {
    e.stopPropagation();
    await API.delete(`/tasks/${task._id}`);
    toast.success('Task deleted');
    onDelete(task._id);
  };

  return (
    <div
      style={{
        position:'relative', borderRadius:'12px', overflow:'hidden',
        border:`1px solid ${hov ? p.border : 'rgba(255,255,255,0.06)'}`,
        background: hov ? '#111' : '#0d0d0d',
        padding:'14px', marginBottom:'10px', cursor:'grab',
        transition:'all 0.2s ease', userSelect:'none',
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${p.color}10` : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Left stripe */}
      <div style={{position:'absolute',top:0,left:0,bottom:0,width:'3px',background:p.color,borderRadius:'12px 0 0 12px'}} />

      <div style={{paddingLeft:'8px'}}>
        {/* Top row */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <span style={{fontSize:'10px',fontWeight:'700',fontFamily:'Outfit,sans-serif',
            letterSpacing:'0.05em', padding:'3px 8px', borderRadius:'6px',
            background:p.bg, color:p.color, border:`1px solid ${p.border}`}}>
            {p.label}
          </span>
          <button onClick={del}
            style={{background:'rgba(255,77,77,0.08)',border:'1px solid rgba(255,77,77,0.15)',
              color:'#ff4d4d',cursor:'pointer',borderRadius:'6px',
              width:'24px',height:'24px',display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:'11px',
              opacity: hov ? 1 : 0, transition:'opacity 0.2s'}}>✕</button>
        </div>

        <h4 style={{fontSize:'14px',fontWeight:'600',lineHeight:'1.4',marginBottom:'6px',fontFamily:'Outfit,sans-serif'}}>
          {task.title}
        </h4>

        {task.description && (
          <p style={{fontSize:'12px',color:'#555',lineHeight:'1.5',marginBottom:'10px',
            display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {task.description}
          </p>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'6px'}}>
          {task.deadline && (
            <span style={{fontSize:'11px',fontWeight:'500',
              color: overdue ? '#ff4d4d' : '#555',
              background: overdue ? 'rgba(255,77,77,0.08)' : 'transparent',
              padding: overdue ? '2px 8px' : '0', borderRadius:'6px'}}>
              {overdue ? '⚠️' : '📅'} {fmt(task.deadline)}
            </span>
          )}
          {task.assignedTo && (
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <div style={{width:'18px',height:'18px',borderRadius:'50%',
                background:'linear-gradient(135deg,#f5c518,#e6b800)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'9px',fontWeight:'800',color:'#000'}}>
                {task.assignedTo.name?.[0]?.toUpperCase()}
              </div>
              <span style={{fontSize:'11px',color:'#555'}}>{task.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
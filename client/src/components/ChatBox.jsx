import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

let socket;
const COLS = ['#f5c518','#4ade80','#60a5fa','#f472b6','#fb923c','#a78bfa'];
const gc = name => COLS[name?.charCodeAt(0) % COLS.length];

export default function ChatBox({ projectId }) {
  const { user } = useAuth();
  const [msgs, setMsgs]       = useState([]);
  const [text, setText]       = useState('');
  const [live, setLive]       = useState(false);
  const bottomRef             = useRef();
  const inputRef              = useRef();

  useEffect(() => {
    API.get(`/messages/${projectId}`).then(({ data }) => setMsgs(data));
    socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => setLive(true));
    socket.on('disconnect', () => setLive(false));
    socket.emit('joinRoom', projectId);
    socket.on('receiveMessage', msg => setMsgs(p => [...p, msg]));
    return () => socket.disconnect();
  }, [projectId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !live) return;
    socket.emit('sendMessage', { content: text.trim(), senderId: user.id, senderName: user.name, projectId });
    setText('');
    inputRef.current?.focus();
  };

  const isMe = msg => (msg.sender?._id || msg.sender) === user.id;
  const fmt  = d => new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

  return (
    <div style={s.box}>
      {/* Header */}
      <div style={s.head}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={s.headTitle}>Team Chat</span>
          <div style={{...s.dot, background: live?'#4ade80':'#ff4d4d', boxShadow: live?'0 0 6px #4ade80':'none'}} />
          <span style={{fontSize:'11px',color:live?'#4ade80':'#555'}}>{live?'Live':'Offline'}</span>
        </div>
        <span style={{fontSize:'11px',color:'#444'}}>{msgs.length} messages</span>
      </div>

      {/* Messages */}
      <div style={s.msgs}>
        {msgs.length === 0 && (
          <div style={s.empty}>
            <div style={{fontSize:'28px',marginBottom:'8px'}}>💬</div>
            <p style={{color:'#444',fontSize:'12px'}}>No messages yet. Say hello!</p>
          </div>
        )}
        {msgs.map((msg, i) => {
          const mine = isMe(msg);
          const name = msg.sender?.name || 'Unknown';
          const color = gc(name);
          const showAv = !mine && (i===0 || isMe(msgs[i-1]) || (msgs[i-1]?.sender?._id||msgs[i-1]?.sender) !== (msg.sender?._id||msg.sender));
          return (
            <div key={msg._id||i} style={{display:'flex',justifyContent:mine?'flex-end':'flex-start',marginBottom:'4px'}}>
              {!mine && <div style={{...s.av, background:color, opacity:showAv?1:0}}>{name[0]?.toUpperCase()}</div>}
              <div style={{maxWidth:'78%'}}>
                {!mine && showAv && <div style={{fontSize:'11px',fontWeight:'600',fontFamily:'Outfit,sans-serif',color,marginBottom:'3px',paddingLeft:'2px'}}>{name}</div>}
                <div style={{
                  background: mine ? 'linear-gradient(135deg,#f5c518,#e6b800)' : '#111',
                  border: mine ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: mine ? '14px 3px 14px 14px' : '3px 14px 14px 14px',
                  padding:'10px 13px',
                  boxShadow: mine ? '0 4px 16px rgba(245,197,24,0.2)' : 'none',
                }}>
                  <p style={{fontSize:'13px',lineHeight:'1.5',wordBreak:'break-word',color:mine?'#000':'#ccc'}}>{msg.content}</p>
                  <span style={{fontSize:'10px',display:'block',marginTop:'4px',textAlign:'right',color:mine?'rgba(0,0,0,0.4)':'#444'}}>{fmt(msg.createdAt)}</span>
                </div>
              </div>
              {mine && <div style={{width:'28px',flexShrink:0}} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={s.input}>
        <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
          placeholder={live?'Type a message...':'Connecting...'}
          disabled={!live} style={{flex:1,borderRadius:'10px'}} />
        <button type="submit" className="btn btn-primary btn-sm"
          disabled={!text.trim()||!live}
          style={{padding:'10px 16px',borderRadius:'10px',flexShrink:0}}>↑</button>
      </form>
    </div>
  );
}

const s = {
  box: { display:'flex', flexDirection:'column', height:'100%', background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' },
  head: { padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#0d0d0d' },
  headTitle: { fontFamily:'Outfit,sans-serif', fontWeight:'700', fontSize:'14px' },
  dot: { width:'7px', height:'7px', borderRadius:'50%', transition:'all 0.3s' },
  msgs: { flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'4px' },
  empty: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', textAlign:'center' },
  av: { width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', fontFamily:'Outfit,sans-serif', color:'#000', flexShrink:0, marginRight:'8px', alignSelf:'flex-end' },
  input: { display:'flex', gap:'8px', padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'#0d0d0d' },
};
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2'];
const gc = n => COLORS[n?.charCodeAt(0) % COLORS.length];

// Module-level socket so it persists across re-renders
let socketInstance = null;

export default function ChatBox({ projectId, onClose }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [live, setLive] = useState(false);
  const bottomRef = useRef();
  const inputRef  = useRef();
  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);

  // Load history + establish socket once
  useEffect(() => {
    // Load message history
    API.get(`/messages/${projectId}`).then(({ data }) => setMsgs(data)).catch(() => {});

    // Create or reuse socket
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    const onConnect = () => {
      setLive(true);
      // Join the project room after connect/reconnect
      socket.emit('joinRoom', projectId);
      currentRoomRef.current = projectId;
    };

    const onDisconnect = () => setLive(false);

    const onReceive = (msg) => {
      setMsgs(prev => {
        // Deduplicate by _id
        if (prev.some(m => m._id && m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receiveMessage', onReceive);

    // If already connected, join room immediately
    if (socket.connected) {
      setLive(true);
      socket.emit('joinRoom', projectId);
      currentRoomRef.current = projectId;
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receiveMessage', onReceive);
      // Don't disconnect — keep alive for potential re-open
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = useCallback((e) => {
    e.preventDefault();
    if (!text.trim() || !live || !socketRef.current) return;
    socketRef.current.emit('sendMessage', {
      content: text.trim(),
      senderId: user.id,
      senderName: user.name,
      projectId,
    });
    setText('');
    inputRef.current?.focus();
  }, [text, live, user, projectId]);

  const isMe  = msg => (msg.sender?._id || msg.sender) === user.id;
  const fmt   = d   => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={s.box}>
      <div style={s.head}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={s.headTitle}>Team Chat</span>
          <div style={{ ...s.dot, background: live ? 'var(--green)' : 'var(--red)', boxShadow: live ? '0 0 5px var(--green)' : 'none' }} />
          <span style={{ fontSize: '10px', color: live ? 'var(--green)' : 'var(--red)', fontWeight: '500' }}>
            {live ? 'Live' : 'Connecting...'}
          </span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
      </div>

      <div style={s.msgs}>
        {msgs.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
            <p style={{ color: 'var(--text3)', fontSize: '12px', fontWeight: '500' }}>No messages yet — say hello!</p>
          </div>
        )}

        {msgs.map((msg, i) => {
          const mine  = isMe(msg);
          const name  = msg.sender?.name || 'Unknown';
          const color = gc(name);
          const prevSame = i > 0 && !isMe(msgs[i-1]) && (msgs[i-1]?.sender?._id || msgs[i-1]?.sender) === (msg.sender?._id || msg.sender);
          const showAvatar = !mine && !prevSame;

          return (
            <div key={msg._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '3px', alignItems: 'flex-end', gap: '6px' }}>
              {!mine && (
                <div style={{ ...s.av, background: color, opacity: showAvatar ? 1 : 0 }}>
                  {name[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth: '78%' }}>
                {!mine && showAvatar && (
                  <div style={{ fontSize: '10px', fontWeight: '600', color, marginBottom: '3px', paddingLeft: '2px' }}>{name}</div>
                )}
                <div style={{
                  background: mine ? 'var(--blue)' : 'var(--bg3)',
                  border: mine ? 'none' : '1px solid var(--border)',
                  borderRadius: mine ? '14px 4px 14px 14px' : showAvatar ? '4px 14px 14px 14px' : '14px 14px 14px 4px',
                  padding: '8px 12px',
                }}>
                  <p style={{ fontSize: '13px', lineHeight: '1.5', color: mine ? '#fff' : 'var(--text)', wordBreak: 'break-word' }}>
                    {msg.content}
                  </p>
                  <span style={{ fontSize: '9px', color: mine ? 'rgba(255,255,255,0.55)' : 'var(--text3)', display: 'block', textAlign: 'right', marginTop: '3px' }}>
                    {fmt(msg.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={s.input}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={live ? 'Send a message...' : 'Connecting...'}
          disabled={!live}
          style={{ flex: 1, borderRadius: '10px', fontSize: '13px' }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!text.trim() || !live}
          style={{ padding: '9px 16px', borderRadius: '10px' }}
        >
          ↑
        </button>
      </form>
    </div>
  );
}

const s = {
  box:  {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
  },
  head: {
    padding: '12px 14px', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)',
  },
  headTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--text)' },
  dot:  { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  msgs: {
    flex: 1, overflowY: 'auto',
    padding: '14px 12px',
    display: 'flex', flexDirection: 'column', gap: '0',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flex: 1, padding: '40px',
  },
  av: {
    width: '24px', height: '24px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: '700', color: '#fff',
    flexShrink: 0,
  },
  input: {
    display: 'flex', gap: '8px',
    padding: '12px', borderTop: '1px solid var(--border)',
    background: 'var(--bg2)',
  },
};
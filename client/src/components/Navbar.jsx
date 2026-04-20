import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/axios';

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const diff = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff < 3) return 'urgent';
  if (diff < 7) return 'warn';
  return 'safe';
}

export default function Navbar({ onAIOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [projects, setProjects]         = useState([]);
  const notifRef = useRef();

  // Build notifications from projects + tasks
  useEffect(() => {
    const load = async () => {
      try {
        const { data: projs } = await API.get('/projects');
        setProjects(projs);
        const notifs = [];

        for (const p of projs) {
          const { data: tasks } = await API.get(`/tasks/${p._id}`);

          // Overdue tasks
          const overdue = tasks.filter(t =>
            t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
          );
          if (overdue.length > 0) {
            notifs.push({
              id: `overdue-${p._id}`,
              type: 'urgent',
              icon: '⚠',
              title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
              body: `in "${p.name}"`,
              projectId: p._id,
            });
          }

          // Deadline approaching (< 3 days)
          const urgent = tasks.filter(t => {
            if (!t.deadline || t.status === 'done') return false;
            const diff = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff < 3;
          });
          if (urgent.length > 0) {
            notifs.push({
              id: `urgent-${p._id}`,
              type: 'warn',
              icon: '🔔',
              title: `Deadline in < 3 days`,
              body: `${urgent.length} task${urgent.length > 1 ? 's' : ''} in "${p.name}"`,
              projectId: p._id,
            });
          }

          // Not visited long time — use updatedAt heuristic (> 7 days)
          const lastUpdate = new Date(p.updatedAt || p.createdAt);
          const daysSince = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
          if (daysSince > 7 && tasks.some(t => t.status !== 'done')) {
            notifs.push({
              id: `stale-${p._id}`,
              type: 'info',
              icon: '💤',
              title: `Inactive project`,
              body: `"${p.name}" hasn't been updated in ${Math.floor(daysSince)} days`,
              projectId: p._id,
            });
          }
        }

        setNotifications(notifs);
      } catch {
        // silent fail
      }
    };
    load();
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const urgentCount = notifications.filter(n => n.type === 'urgent' || n.type === 'warn').length;

  const notifColors = {
    urgent: { bg: 'var(--red-dim)',   border: 'var(--red-border)',   color: 'var(--red)',   dot: '#dc2626' },
    warn:   { bg: 'var(--amber-dim)', border: 'var(--amber-border)', color: 'var(--amber)', dot: '#d97706' },
    info:   { bg: 'var(--blue-dim)',  border: 'var(--blue-border)',  color: 'var(--blue)',  dot: '#2563eb' },
  };

  return (
    <nav style={s.nav}>
      {/* Left: logo + links */}
      <div style={s.left}>
        <div style={s.logo} onClick={() => navigate('/')}>
          <div style={s.logoMark}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="url(#grad-nav)" />
              <defs>
                <linearGradient id="grad-nav" x1="0" y1="0" x2="16" y2="16">
                  <stop offset="0%" stopColor="#2563eb"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={s.logoText}>CollabSpace</span>
        </div>

        <div style={s.navLinks}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/')}
            style={{
              color: location.pathname === '/' ? 'var(--text)' : 'var(--text2)',
              background: location.pathname === '/' ? 'var(--bg3)' : 'transparent',
              fontWeight: location.pathname === '/' ? '600' : '500',
            }}
          >
            Dashboard
          </button>
          {location.pathname.includes('/project/') && (
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text)', background: 'var(--bg3)', fontWeight: '600' }}>
              Board
            </button>
          )}
        </div>
      </div>

      {/* Right: AI button + notifications + user */}
      <div style={s.right}>

        {/* AI Tools button — only on project board */}
        {location.pathname.includes('/project/') && onAIOpen && (
          <button
            onClick={onAIOpen}
            style={s.aiBtn}
            title="Open AI Tools"
          >
            <span style={{ fontSize: '14px' }}>✦</span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>AI Tools</span>
          </button>
        )}

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              ...s.iconBtn,
              background: notifOpen ? 'var(--bg3)' : 'transparent',
              border: `1px solid ${notifOpen ? 'var(--border2)' : 'transparent'}`,
            }}
            title="Notifications"
          >
            <span style={{ fontSize: '16px', animation: urgentCount > 0 ? 'bellShake 2s ease-in-out infinite' : 'none' }}>🔔</span>
            {urgentCount > 0 && (
              <span style={s.badge}>{urgentCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div style={s.notifHead}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>Notifications</span>
                {notifications.length > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{notifications.length} alert{notifications.length > 1 ? 's' : ''}</span>
                )}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={s.notifEmpty}>
                    <span style={{ fontSize: '24px', marginBottom: '6px', display: 'block' }}>✅</span>
                    <p style={{ fontSize: '12px', color: 'var(--text3)' }}>All caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const c = notifColors[n.type] || notifColors.info;
                    return (
                      <div
                        key={n.id}
                        onClick={() => { n.projectId && navigate(`/project/${n.projectId}`); setNotifOpen(false); }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border)',
                          cursor: n.projectId ? 'pointer' : 'default',
                          display: 'flex', gap: '10px', alignItems: 'flex-start',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (n.projectId) e.currentTarget.style.background = 'var(--bg3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: c.dot, flexShrink: 0, marginTop: '5px',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '1px' }}>
                            {n.icon} {n.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{n.body}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div style={s.divider} />

        {/* User */}
        <div style={s.userArea}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name}</span>
            <span style={s.userEmail}>{user?.email}</span>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--text2)' }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    height: '54px',
    background: 'rgba(248,247,244,0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 0 var(--border)',
  },
  left:     { display: 'flex', alignItems: 'center', gap: '4px' },
  logo:     { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '16px' },
  logoMark: {
    width: '28px', height: '28px', borderRadius: '7px',
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontWeight: '800', fontSize: '15px', letterSpacing: '-0.04em', color: 'var(--text)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '2px' },
  right:    { display: 'flex', alignItems: 'center', gap: '8px' },

  aiBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px',
    background: 'var(--purple)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
  },

  iconBtn: {
    width: '34px', height: '34px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s',
  },
  badge: {
    position: 'absolute',
    top: '2px', right: '2px',
    minWidth: '16px', height: '16px',
    borderRadius: '99px',
    background: 'var(--red)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 3px',
    border: '2px solid var(--bg2)',
  },

  notifHead: {
    padding: '14px 16px 10px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  notifEmpty: {
    padding: '32px 16px',
    textAlign: 'center',
  },

  divider:   { width: '1px', height: '20px', background: 'var(--border2)', marginLeft: '4px' },
  userArea:  { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'var(--grad)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  userInfo:  { display: 'flex', flexDirection: 'column' },
  userName:  { fontSize: '12px', fontWeight: '600', lineHeight: 1.2, color: 'var(--text)' },
  userEmail: { fontSize: '10px', color: 'var(--text3)', lineHeight: 1.2 },
};
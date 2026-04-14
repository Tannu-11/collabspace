import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isBoard = location.pathname.includes('/project/');

  const handleLogout = () => {
    logout();
    toast.success('See you soon!');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>CollabSpace</span>
        </div>
        {isBoard && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginLeft: '8px' }}>
            ← Dashboard
          </button>
        )}
      </div>

      <div style={styles.right}>
        <div style={styles.userChip}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={styles.userName}>{user?.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: '62px',
    background: 'rgba(13,13,26,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky', top: 0, zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: '4px' },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer', textDecoration: 'none',
  },
  logoIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'var(--grad-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', boxShadow: '0 2px 12px rgba(99,179,237,0.25)',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontWeight: '800',
    fontSize: '17px', color: 'var(--text-primary)',
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    padding: '5px 14px 5px 5px',
  },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'var(--grad-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '13px',
  },
  userName: { fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' },
};
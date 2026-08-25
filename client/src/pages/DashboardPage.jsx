import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Player } from '@lordicon/react';
import { useRef } from 'react';
import bookIcon from '../assets/bookIcon.json';

function Icon() {
  const playerRef = useRef(null);

  return (
    <div
      onMouseEnter={() => playerRef.current?.playFromBeginning()}
      style={{ display: 'inline-block', cursor: 'pointer' }}
    >
      <Player
        ref={playerRef}
        icon={bookIcon}
        size={50}
        colors="primary:#121331,secondary:#f4dc9c,quaternary:#e8b730"
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="app-title"><img src="/notesIcon.png" width={38} alt="Notes icon" /> Notes App</h1>
        <div className="header-right">
          {user && <span className="user-greeting">Hi, {user.name}</span>}
          <button onClick={handleLogout} className="btn btn-outline" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <h2>My Notes</h2>
          <Link to="/notes/new" className="btn btn-primary" id="new-note-btn">
            + New Note
          </Link>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon"><Icon /></div>
          <p className="empty-state-text">No notes yet — create your first note!</p>
        </div>
      </main>
    </div>
  );
}


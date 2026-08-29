import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import {
  getNotesApi,
  deleteNoteApi,
  searchNotesApi,
  importNotesApi,
} from '../api/notes';
import { Player } from '@lordicon/react';
import bookIcon from '../assets/bookIcon.json';
import pencilIcon from '../assets/pencilL.json';
import deleteIcon from '../assets/trash.json';

const DEBOUNCE_DELAY_MS = 300;

function BookIcon() {
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

function PencilIcon({ playerRef }) {
  return (
    <div style={{ display: 'inline-block', cursor: 'pointer' }}>
      <Player
        ref={playerRef}
        icon={pencilIcon}
        size={22}
        colors="primary:#000000,secondary:#ffc738,quaternary:#e83a30"
      />
    </div>
  );
}

function DeleteIcon({ playerRef }) {
  return (
    <div style={{ display: 'inline-block', cursor: 'pointer' }}>
      <Player
        ref={playerRef}
        icon={deleteIcon}
        size={22}
        colors="primary:#000000,secondary:#848484,quaternary:#646e78"
      />
    </div>
  );
}

function EditLink({ noteId }) {
  const playerRef = useRef(null);

  return (
    <Link
      to={`/notes/${noteId}/edit`}
      className="btn btn-sm edit-btn btn-primary"
      id={`edit-note-${noteId}`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => playerRef.current?.playFromBeginning()}
    >
      <PencilIcon playerRef={playerRef} /> Edit
    </Link>
  );
}

function DeleteButton({ noteId, noteTitle, handleDelete }) {
  const playerRef = useRef(null);

  return (
    <button
      className="btn btn-sm delete-btn btn-danger"
      onClick={(e) => { e.stopPropagation(); handleDelete(noteId, noteTitle); }}
      onMouseEnter={() => playerRef.current?.playFromBeginning()}
    >
      <DeleteIcon playerRef={playerRef} /> Delete
    </button>
  );
}

function stripHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const debounceTimerRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    try {
      setError('');
      const data = await getNotesApi();
      setNotes(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load notes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    try {
      setError('');
      if (!query.trim()) {
        const data = await getNotesApi();
        setNotes(data);
      } else {
        const data = await searchNotesApi(query.trim());
        setNotes(data);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Search failed';
      setError(message);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(query);
    }, DEBOUNCE_DELAY_MS);
  }, [handleSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = useCallback(async (noteId, noteTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${noteTitle}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNoteApi(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete note';
      setError(message);
    }
  }, []);

  const handleExport = useCallback(() => {
    const exportData = notes.map(({ title, content }) => ({ title, content }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `notes-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedNotes = JSON.parse(text);

      if (!Array.isArray(importedNotes)) {
        setError('Invalid file format. Expected a JSON array of notes.');
        return;
      }

      const valid = importedNotes.every(
        (n) => typeof n.title === 'string' && typeof n.content === 'string'
      );

      if (!valid) {
        setError('Each note must have "title" and "content" string fields.');
        return;
      }

      await importNotesApi(importedNotes);
      await fetchNotes();
      setError('');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON file.');
      } else {
        const message = err.response?.data?.message || 'Import failed';
        setError(message);
      }
    }

    e.target.value = '';
  }, [fetchNotes]);

  const handleNoteEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case 'created':
        setNotes((prev) => [data, ...prev]);
        break;
      case 'updated':
        setNotes((prev) =>
          prev.map((n) => (n.id === data.id ? data : n))
        );
        break;
      case 'deleted':
        setNotes((prev) => prev.filter((n) => n.id !== data.id));
        break;
      default:
        break;
    }
  }, []);

  const openNoteModal = useCallback((note) => {
    setSelectedNote(note);
  }, []);

  const closeNoteModal = useCallback(() => {
    setSelectedNote(null);
  }, []);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') closeNoteModal();
    }
    if (selectedNote) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [selectedNote, closeNoteModal]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <SocketProvider onNoteEvent={handleNoteEvent}>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1 className="app-title">
            <img src="/notesIcon.png" width={38} alt="Notes icon" /> Notes App
          </h1>
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
            <div className="toolbar-actions">
              <Link to="/notes/new" className="btn btn-primary" id="new-note-btn">
                + New Note
              </Link>
            </div>
          </div>

          <div className="dashboard-search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearchChange}
              id="search-notes-input"
            />
            <div className="utility-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleExport}
                disabled={notes.length === 0}
                id="export-notes-btn"
              >
                ⬇ Export
              </button>
              <label className="btn btn-outline btn-sm import-label" id="import-notes-btn">
                ⬆ Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="import-input"
                />
              </label>
            </div>
          </div>

          {error && <div className="error-banner" role="alert">{error}</div>}

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><BookIcon /></div>
              <p className="empty-state-text">
                {searchQuery
                  ? 'No notes match your search.'
                  : 'No notes yet — create your first note!'}
              </p>
            </div>
          ) : (
            <>
              <div className="notes-grid">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="note-card"
                    onClick={() => openNoteModal(note)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') openNoteModal(note); }}
                    id={`note-card-${note.id}`}
                  >
                    <div className="note-card-body">
                      <h3 className="note-card-title">{note.title}</h3>
                      <p className="note-card-preview">
                        {stripHtml(note.content).slice(0, 150)}
                        {stripHtml(note.content).length > 150 ? '...' : ''}
                      </p>
                      <span className="note-card-date">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                    <div className="note-card-actions">
                      <EditLink noteId={note.id} />

                      <DeleteButton noteId={note.id} noteTitle={note.title} handleDelete={handleDelete} />
                    </div>
                  </div>
                ))}
              </div>

              {selectedNote && (
                <div className="note-modal-overlay" onClick={closeNoteModal} id="note-modal-overlay">
                  <div className="note-modal" onClick={(e) => e.stopPropagation()} id="note-modal">
                    <button
                      className="note-modal-close"
                      onClick={closeNoteModal}
                      aria-label="Close"
                      id="note-modal-close-btn"
                    >
                      ✕
                    </button>
                    <h2 className="note-modal-title">{selectedNote.title}</h2>
                    <span className="note-modal-date">{formatDate(selectedNote.updated_at)}</span>
                    <div
                      className="note-modal-content"
                      dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                    />
                    <div className="note-modal-actions">
                      <EditLink noteId={selectedNote.id} />

                      <DeleteButton noteId={selectedNote.id} noteTitle={selectedNote.title} handleDelete={handleDelete} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </SocketProvider>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

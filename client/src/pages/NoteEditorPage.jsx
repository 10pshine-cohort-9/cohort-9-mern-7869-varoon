import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createNoteApi, updateNoteApi, getNoteByIdApi } from '../api/notes';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'blockquote', 'code-block',
  'link', 'image',
];

export default function NoteEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function fetchNote() {
      try {
        const note = await getNoteByIdApi(id);
        if (!cancelled) {
          setTitle(note.title);
          setContent(note.content);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.message || 'Failed to load note';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    fetchNote();

    return () => { cancelled = true; };
  }, [id, isEditMode]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim() || content.trim() === '<p><br></p>') {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await updateNoteApi(id, title.trim(), content);
      } else {
        await createNoteApi(title.trim(), content);
      }
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save note';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [title, content, id, isEditMode, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  if (fetching) {
    return (
      <div className="editor-page">
        <div className="editor-container">
          <div className="editor-loading">Loading note...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-container">
        <div className="editor-header">
          <h1>{isEditMode ? 'Edit Note' : 'Create Note'}</h1>
        </div>

        {error && <div className="error-banner" role="alert">{error}</div>}

        <div className="form-group">
          <label htmlFor="note-title">Title</label>
          <input
            id="note-title"
            type="text"
            className="editor-title-input"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
          />
        </div>

        <div className="form-group editor-content-group">
          <label>Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Start writing your note..."
          />
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-primary editor-save-btn"
            onClick={handleSave}
            disabled={loading}
            id="save-note-btn"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
          <button
            type="button"
            className="btn btn-outline editor-cancel-btn"
            onClick={handleCancel}
            disabled={loading}
            id="cancel-note-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

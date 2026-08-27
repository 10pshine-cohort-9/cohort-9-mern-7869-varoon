import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NoteEditorPage from '../pages/NoteEditorPage';

/* ── Mocks ────────────────────────────────────── */

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCreateNote = vi.fn();
const mockUpdateNote = vi.fn();
const mockGetNoteById = vi.fn();

vi.mock('../api/notes', () => ({
  createNoteApi: (...args) => mockCreateNote(...args),
  updateNoteApi: (...args) => mockUpdateNote(...args),
  getNoteByIdApi: (...args) => mockGetNoteById(...args),
}));

/* Mock react-quill-new — renders a simple textarea for testing */
vi.mock('react-quill-new', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="quill-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));
vi.mock('react-quill-new/dist/quill.snow.css', () => ({}));

/* ── Helpers ──────────────────────────────────── */

function renderCreateMode() {
  return render(
    <MemoryRouter initialEntries={['/notes/new']}>
      <Routes>
        <Route path="/notes/new" element={<NoteEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditMode(noteId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/notes/${noteId}/edit`]}>
      <Routes>
        <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/* ── Tests ────────────────────────────────────── */

describe('NoteEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create mode', () => {
    it('renders title input and editor', () => {
      renderCreateMode();

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
      expect(screen.getByText('Create Note')).toBeInTheDocument();
    });

    it('shows error when saving with empty title', async () => {
      const user = userEvent.setup();
      renderCreateMode();

      await user.click(screen.getByRole('button', { name: /save note/i }));

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockCreateNote).not.toHaveBeenCalled();
    });

    it('calls createNoteApi and navigates on save', async () => {
      const user = userEvent.setup();
      mockCreateNote.mockResolvedValue({ id: 1, title: 'Test', content: '<p>Body</p>' });

      renderCreateMode();

      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByTestId('quill-editor'), 'Body content');
      await user.click(screen.getByRole('button', { name: /save note/i }));

      await waitFor(() => {
        expect(mockCreateNote).toHaveBeenCalledWith('Test', 'Body content');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to dashboard on cancel without API call', async () => {
      const user = userEvent.setup();
      renderCreateMode();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockCreateNote).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Edit mode', () => {
    it('pre-loads existing note data', async () => {
      mockGetNoteById.mockResolvedValue({
        id: 1,
        title: 'Existing Title',
        content: '<p>Existing content</p>',
      });

      renderEditMode('1');

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Title')).toBeInTheDocument();
      });

      expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    it('calls updateNoteApi on save in edit mode', async () => {
      const user = userEvent.setup();
      mockGetNoteById.mockResolvedValue({
        id: 1,
        title: 'Old Title',
        content: '<p>Old content</p>',
      });
      mockUpdateNote.mockResolvedValue({
        id: 1,
        title: 'Updated Title',
        content: '<p>Old content</p>',
      });

      renderEditMode('1');

      await waitFor(() => {
        expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');
      await user.click(screen.getByRole('button', { name: /save note/i }));

      await waitFor(() => {
        expect(mockUpdateNote).toHaveBeenCalledWith(
          '1',
          'Updated Title',
          '<p>Old content</p>',
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('shows error when note fails to load', async () => {
      mockGetNoteById.mockRejectedValue({
        response: { data: { message: 'Note not found' } },
      });

      renderEditMode('999');

      await waitFor(() => {
        expect(screen.getByText('Note not found')).toBeInTheDocument();
      });
    });
  });
});

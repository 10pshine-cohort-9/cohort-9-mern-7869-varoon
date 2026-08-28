import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    token: 'fake-token',
    isAuthenticated: true,
    logout: vi.fn().mockResolvedValue(undefined),
  }),
}));

const mockGetNotes = vi.fn();
const mockDeleteNote = vi.fn();
const mockSearchNotes = vi.fn();
const mockImportNotes = vi.fn();

vi.mock('../api/notes', () => ({
  getNotesApi: (...args) => mockGetNotes(...args),
  deleteNoteApi: (...args) => mockDeleteNote(...args),
  searchNotesApi: (...args) => mockSearchNotes(...args),
  importNotesApi: (...args) => mockImportNotes(...args),
}));

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  }),
}));

vi.mock('@lordicon/react', () => ({
  Player: () => <div data-testid="lordicon-player" />,
}));

const sampleNotes = [
  {
    id: 1,
    title: 'First Note',
    content: '<p>Content of first note</p>',
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Second Note',
    content: '<p>Content of second note</p>',
    created_at: '2026-08-21T12:00:00Z',
    updated_at: '2026-08-21T12:00:00Z',
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNotes.mockResolvedValue(sampleNotes);
  });

  describe('Note listing', () => {
    it('renders note cards from API', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
        expect(screen.getByText('Second Note')).toBeInTheDocument();
      });
    });

    it('shows empty state when no notes', async () => {
      mockGetNotes.mockResolvedValue([]);
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete flow', () => {
    it('shows confirmation prompt when delete is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('First Note'),
      );

      confirmSpy.mockRestore();
    });

    it('calls deleteNoteApi and removes card when confirmed', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockDeleteNote.mockResolvedValue({ success: true });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      await waitFor(() => {
        expect(mockDeleteNote).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        expect(screen.queryByText('First Note')).not.toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('does not call deleteNoteApi when cancelled', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      expect(mockDeleteNote).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Search/filter', () => {
    it('calls searchNotesApi with debounced input', async () => {
      const user = userEvent.setup();
      mockSearchNotes.mockResolvedValue([sampleNotes[0]]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, 'First');

      await waitFor(
        () => {
          expect(mockSearchNotes).toHaveBeenCalledWith('First');
        },
        { timeout: 1000 },
      );
    });

    it('fetches all notes when search is cleared', async () => {
      const user = userEvent.setup();
      mockSearchNotes.mockResolvedValue([sampleNotes[0]]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, 'First');

      await waitFor(
        () => { expect(mockSearchNotes).toHaveBeenCalled(); },
        { timeout: 1000 },
      );

      mockGetNotes.mockClear();
      mockGetNotes.mockResolvedValue(sampleNotes);
      await user.clear(searchInput);

      await waitFor(
        () => { expect(mockGetNotes).toHaveBeenCalled(); },
        { timeout: 1000 },
      );
    });

    it('shows "no notes match" when search returns empty', async () => {
      const user = userEvent.setup();
      mockSearchNotes.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(
        () => {
          expect(screen.getByText(/no notes match/i)).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });
  });
});

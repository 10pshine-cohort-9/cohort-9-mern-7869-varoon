import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth API module (required by AuthProvider)
vi.mock('../api/auth', () => ({
  signupApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
}));

function renderWithRoute({ initialEntries, authenticated = false }) {
  // If authenticated, seed localStorage before render
  if (authenticated) {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, name: 'Test User', email: 'test@example.com' })
    );
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects unauthenticated users to /login', () => {
    renderWithRoute({ initialEntries: ['/dashboard'], authenticated: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    renderWithRoute({ initialEntries: ['/dashboard'], authenticated: true });
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});

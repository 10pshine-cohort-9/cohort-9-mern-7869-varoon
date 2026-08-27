import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function SocketProvider({ children, onNoteEvent }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      /* Connected successfully */
    });

    socket.on('note:created', (note) => {
      onNoteEvent?.('created', note);
    });

    socket.on('note:updated', (note) => {
      onNoteEvent?.('updated', note);
    });

    socket.on('note:deleted', (data) => {
      onNoteEvent?.('deleted', data);
    });

    socket.on('connect_error', () => {
      /* Socket connection error — will auto-retry */
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, onNoteEvent]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;

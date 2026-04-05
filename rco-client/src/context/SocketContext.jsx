/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectToken, selectIsAuthenticated, selectAuthInitialized } from '../store/authSlice';

const SocketContext = createContext({ socket: null, status: 'disconnected' });

// Backwards-compatible hook that returns the socket instance
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx?.socket || null;
};

// New hook to read socket connection status: 'connected'|'connecting'|'disconnected'
export const useSocketStatus = () => {
  const ctx = useContext(SocketContext);
  return ctx?.status || 'disconnected';
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialized = useSelector(selectAuthInitialized);

  useEffect(() => {
    // Wait until auth initialization is complete
    if (!initialized) return;

    // Only instantiate socket when authenticated and token present
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
        Promise.resolve().then(() => setSocket(null));
        Promise.resolve().then(() => setStatus('disconnected'));
      }
      return;
    }

    const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    Promise.resolve().then(() => setStatus('connecting'));

    const newSocket = io(SERVER_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      auth: { token },
    });

    socketRef.current = newSocket;
    Promise.resolve().then(() => setSocket(newSocket));

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnectError = (err) => {
      console.warn('[Socket] connect_error', err);
      setStatus('disconnected');
    };
    const onReconnectAttempt = () => setStatus('connecting');

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);
    newSocket.on('reconnect_attempt', onReconnectAttempt);

    // Start the connection after handlers are attached
    try {
      newSocket.connect();
    } catch (err) {
      console.error('[Socket] connect threw', err);
    }

    return () => {
      try {
        newSocket.off('connect', onConnect);
        newSocket.off('disconnect', onDisconnect);
        newSocket.off('connect_error', onConnectError);
        newSocket.off('reconnect_attempt', onReconnectAttempt);
        newSocket.removeAllListeners();
        newSocket.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
      Promise.resolve().then(() => setSocket(null));
      Promise.resolve().then(() => setStatus('disconnected'));
    };
  }, [initialized, isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  );
};

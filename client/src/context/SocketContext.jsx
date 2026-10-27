import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket.io] Connected to server with ID: ${newSocket.id}`);
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.warn(`[Socket.io] Disconnected: ${reason}`);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error(`[Socket.io] Connection Error: ${error.message}`);
      setConnectionStatus('disconnected');
    });

    newSocket.on('reconnect_attempt', () => {
      setConnectionStatus('connecting');
    });

    newSocket.on('active-users', ({ users }) => {
      setActiveUsers(users || []);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectionStatus, isConnected: connectionStatus === 'connected', activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

import { useEffect } from 'react';
import socketService from '../services/socket/socket.service';
import { useSelector } from 'react-redux';

export const useSocket = (event, callback) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Set up event listener
    if (event && callback) {
      socketService.on(event, callback);
    }

    // Cleanup on unmount
    return () => {
      if (event && callback) {
        socketService.off(event, callback);
      }
    };
  }, [isAuthenticated, event, callback]);

  return {
    socket: socketService.socket,
    isConnected: socketService.isConnected(),
    emit: socketService.emit.bind(socketService),
  };
};


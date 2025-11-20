import io from 'socket.io-client';
import { SOCKET_URL } from '../../utils/constants';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('No token available for socket connection');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();


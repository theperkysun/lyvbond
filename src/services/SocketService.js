import io from 'socket.io-client';
import { BASE_URL } from '../config/apiConfig';

// Strip '/api' from BASE_URL to get root URL for socket
const SOCKET_URL = BASE_URL.replace('/api', '');

class SocketService {
    socket = null;
    listeners = {};

    connect(userId) {
        try {
            if (this.socket && this.socket.connected) {
                console.log("Socket already connected");
                return;
            }

            console.log("Connecting to socket:", SOCKET_URL);

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                jsonp: false,
                forceNew: true
            });

            this.socket.on('connect', () => {
                console.log("✅ Socket connected:", this.socket.id);
                if (userId) {
                    this.emit('user:online', { userId });
                }
            });

            this.socket.on('disconnect', () => {
                console.log("❌ Socket disconnected");
            });

            this.socket.on('connect_error', (err) => {
                console.log("⚠️ Socket connection error:", err);
            });

            // Re-attach pending listeners
            Object.keys(this.listeners).forEach(event => {
                this.listeners[event].forEach(cb => {
                    this.socket.on(event, cb);
                });
            });

        } catch (e) {
            console.log("Socket init error:", e);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.log("Socket not connected, cannot emit:", event);
        }
    }

    on(event, cb) {
        // Store listener
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(cb);

        // Attach if socket exists
        if (this.socket) {
            this.socket.on(event, cb);
        }
    }

    off(event, cb) {
        // Remove from storage
        if (this.listeners[event]) {
            if (cb) {
                this.listeners[event] = this.listeners[event].filter(l => l !== cb);
            } else {
                delete this.listeners[event];
            }
        }

        // Remove from socket
        if (this.socket) {
            if (cb) {
                this.socket.off(event, cb);
            } else {
                this.socket.off(event);
            }
        }
    }

    getSocket() {
        return this.socket;
    }
}

export default new SocketService();

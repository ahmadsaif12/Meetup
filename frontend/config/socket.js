import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

let socketInstance = null;

export const getSocket = (token) => {
  if (socketInstance?.connected) return socketInstance;

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    autoConnect: false,
    withCredentials: true,
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

import { io } from 'socket.io-client';
import { addMessage, addNotification } from './store/index.js';

let socket = null;

export const initSocket = (userId, dispatch) => {
  if (socket) return socket;

  socket = io(window.location.origin, {
    transports: ['websocket'],
    upgrade: false
  });

  socket.on('connect', () => {
    console.log('Socket.IO Client connected');
    socket.emit('join_user', userId);
  });

  // Listener for message events
  socket.on('new_message', (msg) => {
    dispatch(addMessage(msg));
  });

  // Listener for user mentions
  socket.on('mention_received', (data) => {
    dispatch(addNotification({
      title: 'New Mention',
      message: data.message,
      type: 'General',
      createdAt: new Date()
    }));
  });

  // Live administrative/alerts dashboard pushes
  socket.on('system_alert', (alert) => {
    dispatch(addNotification({
      title: alert.title,
      message: alert.message,
      type: alert.type || 'General',
      createdAt: new Date()
    }));
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

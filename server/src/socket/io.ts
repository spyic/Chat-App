import { Server as SocketServer } from 'socket.io';

/**
 * Shared Socket.IO instance holder.
 * Set once in server.ts after setupSocketIO(), used by REST controllers to broadcast events.
 */
let ioInstance: SocketServer | null = null;

export function setIO(io: SocketServer): void {
  ioInstance = io;
}

export function getIO(): SocketServer | null {
  return ioInstance;
}


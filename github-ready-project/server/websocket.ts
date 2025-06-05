import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';
import { Notification } from '@shared/schema';

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  isAdmin?: boolean;
  isPublisher?: boolean;
}

// Store active connections for users
const userConnections = new Map<number, ExtendedWebSocket[]>();

// Initialize the WebSocket server
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  log('WebSocket server initialized');
  
  wss.on('connection', (ws: ExtendedWebSocket) => {
    log('WebSocket connection established');
    
    // Handle client authentication
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message
        if (data.type === 'auth') {
          ws.userId = data.userId;
          ws.isAdmin = data.isAdmin;
          ws.isPublisher = data.isPublisher;
          
          log(`WebSocket authenticated: User ID ${ws.userId}, isAdmin: ${ws.isAdmin}, isPublisher: ${ws.isPublisher}`);
          
          // Save the connection for this user
          if (ws.userId) {
            if (!userConnections.has(ws.userId)) {
              userConnections.set(ws.userId, []);
            }
            userConnections.get(ws.userId)?.push(ws);
          }
          
          // Acknowledge successful authentication
          ws.send(JSON.stringify({ type: 'auth_success' }));
        }
      } catch (err) {
        log(`WebSocket message error: ${err}`);
      }
    });
    
    // Clean up when connection is closed
    ws.on('close', () => {
      if (ws.userId) {
        const connections = userConnections.get(ws.userId) || [];
        const index = connections.indexOf(ws);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        
        // Remove the user from the map if no connections remain
        if (connections.length === 0) {
          userConnections.delete(ws.userId);
        }
      }
      
      log('WebSocket connection closed');
    });
  });
  
  return wss;
}

// Send a notification to a specific user
export function sendNotificationToUser(userId: number, notification: Notification) {
  const connections = userConnections.get(userId);
  
  if (connections && connections.length > 0) {
    const message = JSON.stringify({
      type: 'notification',
      notification
    });
    
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
    
    log(`Notification sent to user ${userId}`);
    return true;
  }
  
  log(`No active connections for user ${userId}`);
  return false;
}

// Send a notification to all admins
export function sendNotificationToAdmins(notification: Notification) {
  let sentToAnyone = false;
  
  userConnections.forEach((connections, userId) => {
    connections.forEach(ws => {
      if (ws.isAdmin && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          notification
        }));
        sentToAnyone = true;
      }
    });
  });
  
  log(`Notification sent to all admins: ${sentToAnyone}`);
  return sentToAnyone;
}

// Send a notification to all publishers
export function sendNotificationToPublishers(notification: Notification) {
  let sentToAnyone = false;
  
  userConnections.forEach((connections, userId) => {
    connections.forEach(ws => {
      if ((ws.isPublisher || ws.isAdmin) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          notification
        }));
        sentToAnyone = true;
      }
    });
  });
  
  log(`Notification sent to all publishers: ${sentToAnyone}`);
  return sentToAnyone;
}

// Send a notification to all users
export function broadcastNotification(notification: Notification) {
  let sentToAnyone = false;
  
  userConnections.forEach((connections, userId) => {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          notification
        }));
        sentToAnyone = true;
      }
    });
  });
  
  log(`Broadcast notification: ${sentToAnyone}`);
  return sentToAnyone;
}
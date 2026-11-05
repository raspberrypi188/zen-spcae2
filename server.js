const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get('room') || 'main';
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  const room = rooms.get(roomId);
  const clientId = Math.random().toString(36).slice(2, 8);

  const angle = Math.random() * Math.PI * 2;
  const radius = 1.5 + Math.random() * 3; // 半径在 1.5 到 4.5 之间
  const player = {
    id: clientId,
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    action: 'sit',
    ws,
  };

  // 发送初始化信息给新加入的玩家
  ws.send(JSON.stringify({
    type: 'init',
    selfId: clientId,
    users: Array.from(room.values()).map(u => ({ id: u.id, x: u.x, z: u.z, action: u.action })),
  }));

  // 将新玩家加入房间并广播
  room.set(clientId, player);
  broadcast(room, { type: 'user_joined', user: { id: clientId, x: player.x, z: player.z, action: 'sit' } }, clientId);
  broadcast(room, { type: 'population', count: room.size });

  // 处理消息
  ws.on('message', (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    const p = room.get(clientId);
    if (!p) return;

    if (msg.type === 'move') {
      p.x = msg.x; p.z = msg.z; p.action = msg.action;
      broadcast(room, { type: 'move', id: clientId, x: p.x, z: p.z, action: p.action }, clientId);
    }
    if (msg.type === 'action') {
      p.action = msg.action;
      broadcast(room, { type: 'action', id: clientId, action: p.action }, null);
    }
  });

  // 断开连接
  ws.on('close', () => {
    room.delete(clientId);
    broadcast(room, { type: 'user_left', id: clientId });
    broadcast(room, { type: 'population', count: room.size });
  });
});

function broadcast(room, message, excludeId = null) {
  const data = JSON.stringify(message);
  for (const [id, user] of room) {
    if (id !== excludeId && user.ws.readyState === WebSocket.OPEN) user.ws.send(data);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🏯 空山静舍运行在 http://localhost:${PORT}`));
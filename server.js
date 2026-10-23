const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Serve static files
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.zip': 'application/zip'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket Real-time Chat & Sanction Protocol
const wss = new WebSocket.Server({ server });

// Rooms data structure:
// rooms[code] = { code, creatorId, users: Map<ws, { id, name, isBoss, banUntil }> }
const rooms = {};

function generateId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

wss.on('connection', (ws) => {
    ws.userId = generateId();
    ws.roomCode = null;
    ws.userName = 'Usuario_' + ws.userId.substring(0, 2);
    ws.isBoss = false;
    ws.banUntil = 0;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (e) {
            console.error('Invalid JSON message:', e);
        }
    });

    ws.on('close', () => {
        leaveCurrentRoom(ws);
    });
});

function handleMessage(ws, data) {
    const { type, payload } = data;

    if (type === 'CREATE_ROOM') {
        leaveCurrentRoom(ws);
        const code = payload.code || Math.floor(100000 + Math.random() * 900000).toString();
        ws.roomCode = code;
        ws.isBoss = true;
        if (payload.userName) ws.userName = payload.userName;

        rooms[code] = {
            code: code,
            creatorId: ws.userId,
            createdTime: Date.now(),
            users: new Set()
        };

        rooms[code].users.add(ws);

        ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
                code,
                userId: ws.userId,
                userName: ws.userName,
                isBoss: true
            }
        }));

        broadcastUserList(code);
        broadcastSystemMessage(code, `${ws.userName} (Jefe / Creador) ha creado la sala.`);
    }
    else if (type === 'JOIN_ROOM') {
        leaveCurrentRoom(ws);
        const code = String(payload.code).trim();
        if (!rooms[code]) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'El código de invitación no existe.' }
            }));
            return;
        }

        ws.roomCode = code;
        ws.isBoss = (rooms[code].creatorId === ws.userId);
        if (payload.userName) ws.userName = payload.userName;

        rooms[code].users.add(ws);

        ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
                code,
                userId: ws.userId,
                userName: ws.userName,
                isBoss: ws.isBoss
            }
        }));

        broadcastUserList(code);
        broadcastSystemMessage(code, `${ws.userName} se ha unido al chat.`);
    }
    else if (type === 'CHAT_MESSAGE') {
        if (!ws.roomCode || !rooms[ws.roomCode]) return;

        // Check if user is currently banned
        if (ws.banUntil > Date.now()) {
            const remaining = Math.ceil((ws.banUntil - Date.now()) / 1000);
            ws.send(JSON.stringify({
                type: 'SANCTION_ACTIVE',
                payload: { remainingSeconds: remaining }
            }));
            return;
        }

        const msgText = String(payload.text || '').trim();
        if (!msgText) return;

        const packet = {
            type: 'CHAT_MESSAGE',
            payload: {
                id: generateId(),
                senderId: ws.userId,
                senderName: ws.userName,
                isBoss: ws.isBoss,
                text: msgText,
                timestamp: new Date().toLocaleTimeString()
            }
        };

        broadcastToRoom(ws.roomCode, packet);
    }
    else if (type === 'ISSUE_BAN') {
        if (!ws.roomCode || !rooms[ws.roomCode]) return;
        if (!ws.isBoss) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Solo el Jefe/Creador puede aplicar sanciones.' }
            }));
            return;
        }

        const targetUserId = payload.targetUserId;
        const durationSeconds = parseInt(payload.durationSeconds) || 0;
        const room = rooms[ws.roomCode];

        let targetClient = null;
        for (let client of room.users) {
            if (client.userId === targetUserId) {
                targetClient = client;
                break;
            }
        }

        if (!targetClient) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Usuario no encontrado en la sala.' }
            }));
            return;
        }

        if (durationSeconds > 0) {
            targetClient.banUntil = Date.now() + (durationSeconds * 1000);

            // Notify target client
            targetClient.send(JSON.stringify({
                type: 'SANCTION_APPLIED',
                payload: {
                    durationSeconds,
                    issuedBy: ws.userName,
                    reason: payload.reason || 'Comportamiento inadecuado'
                }
            }));

            broadcastSystemMessage(ws.roomCode, `🚨 SANCIÓN: El Jefe ${ws.userName} ha suspendido a ${targetClient.userName} durante ${durationSeconds} segundos.`);
        } else {
            // Lift ban / Unban
            targetClient.banUntil = 0;
            targetClient.send(JSON.stringify({
                type: 'SANCTION_LIFTED',
                payload: {
                    issuedBy: ws.userName
                }
            }));

            broadcastSystemMessage(ws.roomCode, `✅ El Jefe ${ws.userName} ha retirado la sanción de ${targetClient.userName}.`);
        }

        broadcastUserList(ws.roomCode);
    }
}

function leaveCurrentRoom(ws) {
    if (ws.roomCode && rooms[ws.roomCode]) {
        const code = ws.roomCode;
        rooms[code].users.delete(ws);
        broadcastSystemMessage(code, `${ws.userName} ha salido del chat.`);

        if (rooms[code].users.size === 0) {
            delete rooms[code];
        } else {
            broadcastUserList(code);
        }
        ws.roomCode = null;
    }
}

function broadcastToRoom(roomCode, packet) {
    if (!rooms[roomCode]) return;
    const data = JSON.stringify(packet);
    for (let client of rooms[roomCode].users) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

function broadcastSystemMessage(roomCode, text) {
    broadcastToRoom(roomCode, {
        type: 'SYSTEM_MESSAGE',
        payload: { text, timestamp: new Date().toLocaleTimeString() }
    });
}

function broadcastUserList(roomCode) {
    if (!rooms[roomCode]) return;
    const userList = Array.from(rooms[roomCode].users).map(client => ({
        id: client.userId,
        name: client.userName,
        isBoss: client.isBoss,
        isBanned: client.banUntil > Date.now(),
        banRemaining: client.banUntil > Date.now() ? Math.ceil((client.banUntil - Date.now()) / 1000) : 0
    }));

    broadcastToRoom(roomCode, {
        type: 'USER_LIST_UPDATED',
        payload: { users: userList }
    });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`MicroOS PC Chat Server running on http://0.0.0.0:${PORT}`);
});

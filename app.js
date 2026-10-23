let ws = null;
let currentRoomCode = null;
let myUserId = null;
let myUserName = "Usuario";
let isBoss = false;
let banInterval = null;
let banRemainingSeconds = 0;

// UI Elements
const roomModal = document.getElementById('room-modal');
const chatWindow = document.getElementById('chat-window');
const downloadWindow = document.getElementById('download-window');
const infoWindow = document.getElementById('info-window');
const sanctionOverlay = document.getElementById('sanction-overlay');

const userNicknameInput = document.getElementById('user-nickname');
const roomCodeInput = document.getElementById('room-code-input');
const btnJoinRoom = document.getElementById('btn-join-room');
const btnCreateRoom = document.getElementById('btn-create-room');
const modalError = document.getElementById('modal-error');

const roomBadge = document.getElementById('room-badge');
const roleBadge = document.getElementById('role-badge');
const userCount = document.getElementById('user-count');
const userListEl = document.getElementById('user-list');

const bossPanel = document.getElementById('boss-panel');
const banTargetSelect = document.getElementById('ban-target-select');

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sanctionTimer = document.getElementById('sanction-timer');

// Connect to WebSocket Server
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to MicroOS PC Server');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerPacket(data);
        } catch (e) {
            console.error('Error parsing packet:', e);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
    };
}

function handleServerPacket(packet) {
    const { type, payload } = packet;

    if (type === 'ROOM_JOINED') {
        currentRoomCode = payload.code;
        myUserId = payload.userId;
        myUserName = payload.userName;
        isBoss = payload.isBoss;

        roomBadge.textContent = `Código: ${currentRoomCode}`;
        roleBadge.textContent = isBoss ? '👑 Jefe / Creador' : 'Usuario';
        roleBadge.style.background = isBoss ? '#ffc107' : '#17a2b8';
        roleBadge.style.color = isBoss ? '#111' : '#fff';

        roomModal.classList.add('hidden');
        chatWindow.classList.remove('hidden');

        if (isBoss) {
            bossPanel.classList.remove('hidden');
        } else {
            bossPanel.classList.add('hidden');
        }
    }
    else if (type === 'ERROR') {
        modalError.textContent = payload.message || 'Error de conexión.';
    }
    else if (type === 'CHAT_MESSAGE') {
        appendChatMessage(payload.senderName, payload.text, payload.senderId === myUserId, payload.isBoss, payload.timestamp);
    }
    else if (type === 'SYSTEM_MESSAGE') {
        appendSystemMessage(payload.text);
    }
    else if (type === 'USER_LIST_UPDATED') {
        renderUserList(payload.users);
    }
    else if (type === 'SANCTION_APPLIED') {
        startSanctionLockdown(payload.durationSeconds, payload.issuedBy);
    }
    else if (type === 'SANCTION_LIFTED') {
        stopSanctionLockdown();
    }
}

// Render User List & Boss Target Select
function renderUserList(users) {
    userCount.textContent = users.length;
    userListEl.innerHTML = '';
    banTargetSelect.innerHTML = '<option value="">-- Seleccionar usuario --</option>';

    users.forEach(u => {
        const li = document.createElement('li');
        if (u.isBanned) li.classList.add('banned');

        let roleTag = u.isBoss ? '👑' : '';
        let banTag = u.isBanned ? ` 🚫 (${u.banRemaining}s)` : '';
        li.textContent = `${roleTag} ${u.name} ${banTag}`;
        userListEl.appendChild(li);

        if (isBoss && u.id !== myUserId) {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.name} ${u.isBanned ? '[Baneado]' : ''}`;
            banTargetSelect.appendChild(opt);
        }
    });
}

// Append Messages
function appendChatMessage(sender, text, isMine, senderIsBoss, time) {
    const div = document.createElement('div');
    div.className = `chat-msg ${isMine ? 'mine' : 'other'}`;

    const senderDiv = document.createElement('div');
    senderDiv.className = 'sender';
    senderDiv.textContent = `${senderIsBoss ? '👑 ' : ''}${sender} • ${time}`;

    const textDiv = document.createElement('div');
    textDiv.textContent = text;

    div.appendChild(senderDiv);
    div.appendChild(textDiv);

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'system-msg';
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Sanction Lockdown System
function startSanctionLockdown(durationSeconds, issuedBy) {
    banRemainingSeconds = durationSeconds;
    sanctionOverlay.classList.remove('hidden');
    sanctionTimer.textContent = `${banRemainingSeconds}s`;

    if (banInterval) clearInterval(banInterval);

    banInterval = setInterval(() => {
        banRemainingSeconds -= 1;
        if (banRemainingSeconds <= 0) {
            stopSanctionLockdown();
        } else {
            sanctionTimer.textContent = `${banRemainingSeconds}s`;
        }
    }, 1000);
}

function stopSanctionLockdown() {
    if (banInterval) clearInterval(banInterval);
    banRemainingSeconds = 0;
    sanctionOverlay.classList.add('hidden');
}

// Event Listeners
btnJoinRoom.addEventListener('click', () => {
    const name = userNicknameInput.value.trim() || 'Usuario';
    const code = roomCodeInput.value.trim();
    if (!code) {
        modalError.textContent = 'Ingresa un código de invitación de 6 dígitos.';
        return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'JOIN_ROOM',
            payload: { code, userName: name }
        }));
    }
});

btnCreateRoom.addEventListener('click', () => {
    const name = userNicknameInput.value.trim() || 'Jefe';
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'CREATE_ROOM',
            payload: { userName: name }
        }));
    }
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'CHAT_MESSAGE',
            payload: { text }
        }));
        chatInput.value = '';
    }
});

// Quick Chat Buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        chatInput.value = btn.textContent;
        chatForm.dispatchEvent(new Event('submit'));
    });
});

// Boss Sanction Buttons
document.querySelectorAll('.sanction-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetUserId = banTargetSelect.value;
        if (!targetUserId) {
            alert('Por favor selecciona un usuario objetivo.');
            return;
        }

        const durationSeconds = parseInt(btn.dataset.seconds) || 0;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'ISSUE_BAN',
                payload: {
                    targetUserId,
                    durationSeconds
                }
            }));
        }
    });
});

// OS Window Controls & Desktop Icons
document.getElementById('open-chat-app').addEventListener('click', () => {
    if (!currentRoomCode) {
        roomModal.classList.remove('hidden');
    } else {
        chatWindow.classList.remove('hidden');
    }
});

document.getElementById('open-download-app').addEventListener('click', () => {
    downloadWindow.classList.remove('hidden');
});

document.getElementById('open-info-app').addEventListener('click', () => {
    infoWindow.classList.remove('hidden');
});

document.getElementById('win-close').addEventListener('click', () => {
    chatWindow.classList.add('hidden');
});

document.getElementById('download-close').addEventListener('click', () => {
    downloadWindow.classList.add('hidden');
});

document.getElementById('info-close').addEventListener('click', () => {
    infoWindow.classList.add('hidden');
});

// Clock
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) {
        clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}, 1000);

// Initialize WebSocket on Load
window.addEventListener('DOMContentLoaded', initWebSocket);

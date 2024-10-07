const socket = io();
let localStream;
const peerConnections = {};
const config = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

// Acessa o microfone do usuário
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        localStream = stream;

        // Mostra o áudio local
        const localAudio = document.getElementById('localAudio');
        localAudio.srcObject = stream;

        document.getElementById('joinButton').addEventListener('click', () => {
            const roomId = document.getElementById('roomId').value;
            if (roomId) {
                socket.emit('join-room', roomId);
                console.log(`Tentando entrar na sala: ${roomId}`);
            } else {
                console.error("Insira um ID de sala válido.");
            }
        });

        // Recebe confirmação de conexão
        socket.on('room-joined', (roomId) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<p>Você entrou na sala ${roomId}.</p>`;
            console.log(`Você entrou na sala: ${roomId}`);
        });

        // Recebe notificação quando outro usuário se conecta
        socket.on('user-connected', (userId) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<p>Usuário ${userId} entrou na sala.</p>`;
            console.log(`Usuário ${userId} entrou na sala.`);
        });

        // Recebe notificação quando outro usuário se desconecta
        socket.on('user-disconnected', (userId) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<p>Usuário ${userId} saiu da sala.</p>`;
            console.log(`Usuário ${userId} saiu da sala.`);
        });

        // Recebe mensagens de chat
        socket.on('message', (data) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<p><strong>${data.senderId}:</strong> ${data.message}</p>`;
        });

        // Enviar mensagem de chat
        document.getElementById('sendMessageButton').addEventListener('click', () => {
            const message = document.getElementById('messageInput').value;
            const roomId = document.getElementById('roomId').value;
            if (roomId && message) {
                socket.emit('message', { roomId, message });
                document.getElementById('messageInput').value = '';
            } else {
                console.error("Insira uma mensagem válida.");
            }
        });

        // Troca de streams de áudio
        socket.on('signal', async (data) => {
            if (data.type === 'offer') {
                const peerConnection = new RTCPeerConnection(config);
                peerConnections[data.senderId] = peerConnection;

                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit('signal', {
                    roomId: data.roomId,
                    signal: peerConnection.localDescription,
                    to: data.senderId
                });

                peerConnection.ontrack = event => {
                    const remoteAudio = document.getElementById('remoteAudio');
                    remoteAudio.srcObject = event.streams[0];
                };
            } else if (data.type === 'answer') {
                peerConnections[data.senderId].setRemoteDescription(new RTCSessionDescription(data.signal));
            } else if (data.type === 'candidate') {
                peerConnections[data.senderId].addIceCandidate(new RTCIceCandidate(data.signal));
            }
        });
    })
    .catch(error => {
        console.error('Erro ao acessar o microfone:', error);
    });

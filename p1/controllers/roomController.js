const RoomRepository = require('../repositories/RoomRepository');

exports.createRoom = async (req, res) => {
    const { name, description, capacity } = req.body;
    const userId = req.user;

    try {
        const roomData = {
            name,
            description,
            capacity,
            isActive: true,
        };

        const room = await RoomRepository.createRoom(roomData);
        res.status(201).json({ msg: 'Sala criada com sucesso', room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro ao criar sala', error: error.message });
    }
};

exports.listRooms = async (req, res) => {
    try {
        const rooms = await RoomRepository.findAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro ao listar salas' });
    }
};

exports.joinRoom = (io) => async (req, res) => {
    const { uuid } = req.params;
    const userId = req.user;

    console.log(`Tentando entrar na sala com UUID: ${uuid}`);

    try {
        const room = await RoomRepository.findByUUID(uuid);
        console.log('Sala encontrada:', room);

        if (!room) return res.status(404).json({ msg: 'Sala não encontrada' });

        await RoomRepository.addParticipant(room._id, userId);

        if (!io) {
            console.error('io não está definido');
            return res.status(500).json({ msg: 'Erro no servidor' });
        }

        io.to(uuid).emit('userJoined', { userId });
        console.log(`Usuário ${userId} entrou na sala ${uuid}`);

        res.status(200).json({ msg: 'Você entrou na sala', room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro ao entrar na sala' });
    }
};
exports.leaveRoom = (io) => async (req, res) => {
    const { uuid } = req.params;
    const userId = req.user;

    try {
        const room = await RoomRepository.findByUUID(uuid);
        if (!room) return res.status(404).json({ msg: 'Sala não encontrada' });

        await RoomRepository.removeParticipant(room._id, userId);

        if (!io) {
            console.error('io não está definido');
            return res.status(500).json({ msg: 'Erro no servidor' });
        }

        io.to(uuid).emit('userLeft', { userId });
        console.log(`Usuário ${userId} saiu da sala ${uuid}`);

        res.status(200).json({ msg: 'Você saiu da sala', room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro ao sair da sala' });
    }
};
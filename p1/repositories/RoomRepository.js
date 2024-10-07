const Room = require('../models/Room');

class RoomRepository {
    async createRoom(roomData) {
        const room = new Room(roomData);
        return await room.save();
    }

    async findById(roomId) {
        return await Room.findById(roomId);
    }

    async findByUUID(uuid) {
        return await Room.findById(uuid); 
    }

    async findAll() {
        return await Room.find();
    }

    async addParticipant(roomId, userId) {
        const room = await Room.findById(roomId);
        if (!room) return null;
        if (!room.participants) room.participants = []; 
        room.participants.push(userId);
        return await room.save();
    }
    

    async removeParticipant(roomId, userId) {
        const room = await Room.findById(roomId);
        if (!room) return null;
        room.participants = room.participants.filter(p => p.toString() !== userId);
        return await room.save();
    }
}

module.exports = new RoomRepository();

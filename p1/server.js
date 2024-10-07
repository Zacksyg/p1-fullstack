require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoConnection = require('./db/mongoConnection');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(express.json());
mongoConnection.connect();


const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Api da Prova",
      version: "1.0.0",
      description: "Documentação da API da prova de Full-Stack",
      contact: {
        name: "Gabriel",
        email: "gabriel.limapn@gmail.com"
      },
      servers: [
        {
          url: "http://localhost:5000"
        }
      ]
    },
  },
  apis: ["./routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);


const server = http.createServer(app);
const io = socketIo(server); 


io.on('connection', (socket) => {
    console.log('Um usuário conectado:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId); 
        socket.to(roomId).emit('user-connected', socket.id); 
        socket.emit('room-joined', roomId); 

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id); 
            console.log('Um usuário desconectado:', socket.id);
        });

        socket.on('message', (data) => {
            socket.to(data.roomId).emit('message', { senderId: socket.id, message: data.message });
        });

        socket.on('signal', (data) => {
            socket.to(data.roomId).emit('signal', {
                senderId: socket.id,
                ...data,
            });
        });
    });
});


server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = { app, io };

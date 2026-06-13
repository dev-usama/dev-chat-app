const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.mongoDbURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB error:', err));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.clientURL,
        methods: ['GET', 'POST']
    }
});

const onlineUsers = new Map();

app.get('/messages', async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(50);
    res.json(messages);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (name) => {
        onlineUsers.set(socket.id, name);
        socket.emit('onlineCount', onlineUsers.size);
        io.emit('onlineCount', onlineUsers.size);
        console.log(`${name} joined the chat`);
    });

    socket.on('sendMessage', async (message) => {
        const saved = await Message.create({
            senderId: socket.id,
            senderName: message.senderName,
            text: message.text,
            time: message.time
        });

        io.emit('receiveMessage', {
            ...message,
            senderId: socket.id,
            id: saved._id
        });
    });

    socket.on('disconnect', () => {
        const name = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);
        io.emit('onlineCount', onlineUsers.size);
        console.log(`${name} disconnected`);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
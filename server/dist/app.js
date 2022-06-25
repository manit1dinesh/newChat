"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:8100',
    optionsSuccessStatus: 200,
    methods: "get, put"
};
app.use(cors(corsOptions));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: corsOptions
});
// signaling
io.on('connection', (socket) => {
    let createdRoom;
    console.log('a user connected', socket.id);
    socket.on('createOrJoin', room => {
        var _a;
        createdRoom = room;
        console.log('create or join to room ', room, socket.id);
        var myRoom = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
        var numClients = myRoom;
        console.log(room, ' has ', numClients, ' clients');
        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', room);
        }
        else if (numClients == 1) {
            socket.join(room);
            socket.emit('joined', room);
        }
        else {
            socket.emit('full', true);
        }
        console.log(io.sockets.adapter.rooms);
    });
    socket.on('ready', function (room) {
        socket.emit('ready');
        console.log('ready');
    });
    socket.on('candidate', function (event) {
        socket.broadcast.to(createdRoom).emit('candidate', event);
        console.log('candidate');
    });
    socket.on('offer', function (event) {
        socket.broadcast.to(createdRoom).emit('offer', event.sdp);
        console.log('offer');
    });
    socket.on('answer', function (event) {
        socket.broadcast.to(createdRoom).emit('answer', event.sdp);
        console.log('answer');
    });
    io.on('connection', (socket) => {
        console.log('Connected...');
        socket.on('message', (msg) => {
            socket.broadcast.emit('message', msg);
        });
    });
});
app.get("/", cors(), (request, response) => {
    response.status(200).send("yes i am in");
});
httpServer.listen(3000, () => { console.log("io server is listening on port 3000"); });

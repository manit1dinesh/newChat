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
io.on('connection', (socket) => {
    console.log('Connected...');
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg);
    });
});
app.get("/", cors(), (request, response) => {
    response.status(200).send("yes i am in");
});
httpServer.listen(3000, () => { console.log("io server is listening on port 3000"); });

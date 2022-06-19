import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:8100',
    optionsSuccessStatus: 200,
    methods: "get, put"
}
app.use(cors(corsOptions))

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: corsOptions
});

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

})



app.get("/", cors(), (request, response) => {
    response.status(200).send("yes i am in");
});

httpServer.listen(3000, () => { console.log("io server is listening on port 3000") })
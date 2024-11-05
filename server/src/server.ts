import express from "express" ;
import {createServer} from 'http' ;
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import mongoose from "mongoose";
import * as usersController from './controllers/users' ;
import * as boardsController from './controllers/boards' ;
import * as columnController from './controllers/column' ;
import * as tasksController from './controllers/tasks'
import bodyParser from "body-parser";
import authMiddleware from './middlewares/auth' ;
import cors from "cors" ;
import { SocketEventsEnum } from "./types/socketEvents.enum";
import jwt from "jsonwebtoken";
import { secret } from "./config";
import User from "./models/user";

const app = express() ;
const httpServer = createServer(app) ;
const io = new Server(httpServer,{
    cors: {
        origin: "*",
    }
}) ;

app.use(cors());
app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({extended: true})) ;

mongoose.set("toJSON", {
    virtuals: true,
    transform: (_,converted)=> {
        delete converted._id;
    },
});
// app.use(function(req, res, next) {
//     // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4001');
  
//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
// //   res.setHeader('Access-Control-Allow-Credentials', true);
  
//   // Pass to next layer of middleware
//   next();
//   });

app.get('/',(req,res) => {
    res.send("API is UP");
});

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware ,usersController.currentUser);
app.get('/api/boards',authMiddleware,boardsController.getBoards) ;
app.get('/api/boards/:boardId',authMiddleware,boardsController.getBoard) ;
app.get('/api/boards/:boardId/columns',authMiddleware,columnController.getColumns) ;
app.get('/api/boards/:boardId/tasks',authMiddleware,tasksController.getTasks) ;
app.post('/api/boards',authMiddleware,boardsController.createBoard) ;

io.use(async (socket: Socket,next) => {
    try {
        const token = (socket.handshake.auth.token as string) ?? "" ;
        const data = jwt.verify(token.split(' ')[1],secret) as {
            id: string;
            email: string;
        } ;
        const user = await User.findById(data.id) ;
        if(!user) {
            return next(new Error("Authentication Error")) ;
        }
        socket.user = user ;
        next();
    } catch (err) {
        next(new Error("Authentication error")) ;
    }
}).on("connection",(Socket)=> {
    Socket.on(SocketEventsEnum.boardsJoin, (data)=> {
        boardsController.joinBoard(io,Socket,data) ;
    });
    Socket.on(SocketEventsEnum.boardsLeave, (data)=> {
        boardsController.leaveBoard(io,Socket,data) ;
    });
    Socket.on(SocketEventsEnum.columnsCreate,(data)=> {
        columnController.createColumn(io,Socket,data)
    });
    Socket.on(SocketEventsEnum.tasksCreate,(data)=> {
        tasksController.createTask(io,Socket,data)
    });
    Socket.on(SocketEventsEnum.boardsUpdate,(data)=> {
        boardsController.updateBoard(io,Socket,data)
    });
    Socket.on(SocketEventsEnum.boardsDelete, (data) => {
        boardsController.deleteBoard(io, Socket, data);
    });
    Socket.on(SocketEventsEnum.columnsDelete, (data) => {
        columnController.deleteColumn(io, Socket, data);
    });
    Socket.on(SocketEventsEnum.columnsUpdate, (data) => {
        columnController.updateColumn(io, Socket, data);
    });
    Socket.on(SocketEventsEnum.tasksUpdate, (data) => {
        tasksController.updateTask(io, Socket, data);
    });
    Socket.on(SocketEventsEnum.tasksDelete, (data) => {
        tasksController.deleteTask(io, Socket, data);
    });
});

mongoose.connect('mongodb://localhost:27017/eltrello').then(()=>{
    console.log(`connected to mongodb`) ;
    httpServer.listen(4001, ()=> {
        console.log(`API is listening on port 4001`);
    });
}) ;
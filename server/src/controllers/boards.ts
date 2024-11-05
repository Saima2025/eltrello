import { NextFunction, Request, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import board from "../models/board";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";

export const getBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) =>{
    try {
        if(!req.user) {
            res.sendStatus(401) ;
            return ;
        }
        const boards = await board.find({
            userId: req.user.id
        });
        res.send(boards) ;

    }catch (err) {
        next(err) ;
    }
}

export const getBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) =>{
    try {
        if(!req.user) {
            res.sendStatus(401) ;
            return ;
        }
        const boards = await board.findById(req.params.boardId);
        res.send(boards) ;

    }catch (err) {
        next(err) ;
    }
}

export const createBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) =>{
    try {
        if(!req.user) {
            res.sendStatus(401) ;
            return ;
        }
        const newBoard = new board({
            title: req.body.title,
            userId: req.user.id
        })
        const savedBoard = newBoard.save() ;
        console.log(savedBoard) ;
        res.send(savedBoard) ;

    }catch (err) {
        next(err) ;
    }
}

export const joinBoard = (
    io: Server,
    socket: Socket,
    data: { boardId: string}
) => {
    console.log("server socket join board",socket.user)
    socket.join(data.boardId) ;
}

export const leaveBoard = (
    io: Server,
    socket: Socket,
    data: { boardId: string}
) => {
    console.log("server socket leave board",data.boardId)
    socket.leave(data.boardId) ;
}

export const updateBoard = async (
    io: Server,
    socket: Socket,
    data: { boardId: string, fields : { title: string}}
) => {
    try {
        if(!socket.user) {
            socket.emit(SocketEventsEnum.boardsUpdateFailure,
                "User is not authorized"
            );
            return;
        }
        const updatedBoard = await board.findByIdAndUpdate(
            data.boardId,
            data.fields,
            {new: true}
        );
        io.to(data.boardId).emit(SocketEventsEnum.boardsUpdateSuccess, updatedBoard) ;
    } catch(err) {
        socket.emit(SocketEventsEnum.boardsUpdateFailure , getErrorMessage(err))
    }

}

export const deleteBoard = async (
    io: Server,
    socket: Socket,
    data: { boardId: string }
  ) => {
    try {
      if (!socket.user) {
        socket.emit(
          SocketEventsEnum.boardsDeleteFailure,
          "User is not authorized"
        );
        return;
      }
      await board.deleteOne({ _id: data.boardId });
      io.to(data.boardId).emit(SocketEventsEnum.boardsDeleteSuccess);
    } catch (err) {
      socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(err));
    }
  };
  
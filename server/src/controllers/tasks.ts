import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { NextFunction,Response } from "express";
import { Socket } from "../types/socket.interface";
import { Server } from "socket.io";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import task from "../models/task";

export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) =>{
    try {
        if(!req.user) {
            res.sendStatus(401) ;
            return ;
        }
        const tasks = await task.find({ boardId: req.params.boardId});
        res.send(tasks) ;

    }catch (err) {
        next(err) ;
    }
}

export const createTask = async (
    io: Server,
    socket: Socket,
    data: { boardId: string, title: string, columnId: string}
) =>{
    try {
        if(!socket.user) {
            socket.emit(SocketEventsEnum.tasksCreateFailure,
                "User is not authorized") ;
                return ;
        }
        const newTask = new task({
            title: data.title ,
            boardId: data.boardId,
            userId: socket.user.id,
            columnId: data.columnId
        }) ;
        const savedTask = await newTask.save() ;
        io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess,savedTask) ;
    } catch (err) {
        socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(err)) ;
    }
}

export const updateTask = async (
    io: Server,
    socket: Socket,
    data: {
      boardId: string;
      taskId: string;
      fields: { title?: string; description?: string; columnId?: string };
    }
  ) => {
    try {
      if (!socket.user) {
        socket.emit(
          SocketEventsEnum.tasksUpdateFailure,
          "User is not authorized"
        );
        return;
      }
      const updatedTask = await task.findByIdAndUpdate(
        data.taskId,
        data.fields,
        { new: true }
      );
      io.to(data.boardId).emit(SocketEventsEnum.tasksUpdateSuccess, updatedTask);
    } catch (err) {
      socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(err));
    }
  };

  export const deleteTask = async (
    io: Server,
    socket: Socket,
    data: { boardId: string; taskId: string }
  ) => {
    try {
      if (!socket.user) {
        socket.emit(
          SocketEventsEnum.tasksDeleteFailure,
          "User is not authorized"
        );
        return;
      }
      await task.deleteOne({ _id: data.taskId });
      io.to(data.boardId).emit(SocketEventsEnum.tasksDeleteSuccess, data.taskId);
    } catch (err) {
      socket.emit(SocketEventsEnum.tasksDeleteFailure, getErrorMessage(err));
    }
  };

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { combineLatest, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { SocketEventsEnum } from 'src/app/shared/types/socketEvents.enum';
import { SocketService } from 'src/app/shared/services/socket.service';
import { BoardService } from '../../services/board.service';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { ColumnsService } from 'src/app/shared/services/column.service';
import { ColumnInterface } from 'src/app/shared/types/columns.interface';
import { ColumnInputInterface } from 'src/app/shared/types/columnInput.interface';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { TasksService } from 'src/app/shared/services/task.service';
import { TaskInputInterface } from 'src/app/shared/types/taskInput.interface';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit,OnDestroy {
  boardId: string;
  // board$: Observable<BoardInterface> ;
  // columns$: Observable<ColumnInterface[]>;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>
  unsubscribe$ = new Subject<void>() ;

  constructor(
    private boardsService: BoardService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardsService,
    private socketService: SocketService,
    private columnService: ColumnsService,
    private taskService: TasksService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error('Cant get boardID from url');
    }

    this.boardId = boardId;
    // this.board$ = this.boardsService.board$.pipe(filter(Boolean));
    // this.columns$ = this.boardsService.columns$ ;
    this.data$ = combineLatest([
      this.boardsService.board$.pipe(filter(Boolean)),
      this.boardsService.columns$,
      this.boardsService.tasks$
    ]).pipe(
      map(([board, columns, tasks]) => ({
        board,
        columns,
        tasks
      }))
    );
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEventsEnum.boardsJoin,{boardId: this.boardId})
    this.fetchData();
    this.initializeListeners() ;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete() ;
  }

  initializeListeners(): void {
    this.router.events.subscribe(event=> {
      if(event instanceof NavigationStart && !event.url.includes('/boards/')) {
        console.log('leaving') ;
        this.boardsService.leaveBoard(this.boardId) ;
      }
    })

    this.socketService
    .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((column) => {
      this.boardsService.addColumn(column);
    });

    this.socketService
    .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((task) => {
      this.boardsService.addTask(task);
    });

    this.socketService
    .listen<string>(SocketEventsEnum.columnsDeleteSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((columnId) => {
      this.boardsService.deleteColumn(columnId);
    });

    this.socketService
    .listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((updatedBoard) => {
      this.boardsService.updateBoard(updatedBoard);
    });

    this.socketService
    .listen<ColumnInterface>(SocketEventsEnum.columnsUpdateSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((updatedColumn) => {
      this.boardsService.updateColumn(updatedColumn);
    });

    this.socketService
    .listen<TaskInterface>(SocketEventsEnum.tasksUpdateSuccess)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((updatedTask) => {
      this.boardsService.updateTask(updatedTask);
    });

    this.socketService
      .listen<void>(SocketEventsEnum.boardsDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigateByUrl('/boards');
      });

      this.socketService
      .listen<string>(SocketEventsEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((taskId) => {
        this.boardsService.deleteTask(taskId);
      });
  }

  fetchData(): void {
    this.boardService.getBoard(this.boardId).subscribe((board) => {
      this.boardsService.setBoard(board) ;
    });
    this.columnService.getColumns(this.boardId).subscribe((columns) => {
      this.boardsService.setColumns(columns) ;
    })
    this.taskService.getTasks(this.boardId).subscribe((task)=> {
      this.boardsService.setTasks(task) ;
    })
  }

  createColumn(title: string): void {
    const columnInput: ColumnInputInterface = {
      title,
      boardId: this.boardId,
    };
    this.columnService.createColumn(columnInput);
  }

  
  createTask(title: string, columnId: string): void {
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.taskService.createTask(taskInput);
  }


  getTasksByColumn(columnId: string, tasks: TaskInterface[]) {
    return tasks.filter((task)=> task.columnId == columnId)
  }

  updateBoardName(boardName: string): void {
    this.boardService.updateBoard(this.boardId, { title: boardName });
  }

  deleteBoard(): void {
    if (confirm('Are you sure you want to delete the board?')) {
      this.boardService.deleteBoard(this.boardId);
    }
  }

  deleteColumn(columnId: string): void {
    this.columnService.deleteColumn(this.boardId ,columnId) ;
  }
  updateColumnName(columnName: string, columnId: string): void {
    this.columnService.updateColumn(this.boardId, columnId, {
      title: columnName,
    });
  }

  openTask(taskId: string) {
    this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
  }
}

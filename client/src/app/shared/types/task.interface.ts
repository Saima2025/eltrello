export interface TaskInterface {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    columnId: string;
    boardId: string;
    userId: string;
}
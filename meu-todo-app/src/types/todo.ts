// types/todo.ts
export interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  user_email: string
  created_at: string
  updated_at?: string
  processing_status?: 'processing' | 'ready' | 'failed'
}

export interface CreateTodoRequest {
  title: string
  description?: string
  userEmail: string
}

export interface UpdateTodoRequest {
  todoId: number
  title?: string
  description?: string
  completed?: boolean
}

export interface DeleteTodoRequest {
  todoId: number
}
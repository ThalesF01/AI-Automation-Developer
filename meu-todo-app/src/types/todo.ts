export interface Todo {
    id: number
    created_at: string
    title: string
    description?: string
    completed: boolean
    user_email: string
  }
// lib/api.ts
import type { Todo, CreateTodoRequest, UpdateTodoRequest, DeleteTodoRequest } from '@/types/todo'

const API_BASE = '/api/todos'

/**
 * API Service for handling todo operations
 */
export class TodoAPI {
  
  /**
   * Fetch all todos for a user
   */
  static async getTodos(userEmail: string): Promise<Todo[]> {
    const response = await fetch(`${API_BASE}?userEmail=${encodeURIComponent(userEmail)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch todos')
    }
    
    return response.json()
  }

  /**
   * Create a new todo (with AI enhancement)
   */
  static async createTodo(data: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create todo')
    }
    
    return response.json()
  }

  /**
   * Update an existing todo
   */
  static async updateTodo(data: UpdateTodoRequest): Promise<Todo> {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update todo')
    }
    
    return response.json()
  }

  /**
   * Delete a todo
   */
  static async deleteTodo(data: DeleteTodoRequest): Promise<void> {
    const response = await fetch(API_BASE, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete todo')
    }
  }

  /**
   * Toggle todo completion status
   */
  static async toggleTodo(todoId: number, completed: boolean): Promise<Todo> {
    return this.updateTodo({ todoId, completed })
  }
}
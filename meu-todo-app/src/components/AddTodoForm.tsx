// components/AddTodoForm.tsx
'use client'
import { useState } from 'react'
import type { Todo } from '@/types/todo'

interface AddTodoFormProps {
  userEmail: string
  onTodoAdded: (optimizedTask?: Todo) => void
}

interface ApiErrorResponse {
  error: string
}

export default function AddTodoForm({ userEmail, onTodoAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !userEmail) return
    setIsLoading(true)

    try {
      // Call the internal API to add & enhance task
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, userEmail })
      })

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json()
        throw new Error(error.error || 'Failed to add task')
      }

      const optimizedTask: Todo = await response.json()
      onTodoAdded(optimizedTask)

      setTitle('')
      setDescription('')
    } catch (error) {
      const err = error as Error
      console.error('Adding task failed', err)
      alert(`Error adding task: ${err.message}`)
      onTodoAdded() // refresh list anyway
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={addTodo} className="mb-6 space-y-3">
      <input
        type="text"
        placeholder="Enter task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        disabled={isLoading}
      />
      <textarea
        placeholder="Task description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  )
}
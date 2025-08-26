'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddTodoFormProps {
  userEmail: string
  onTodoAdded: () => void
}

export default function AddTodoForm({ userEmail, onTodoAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !userEmail) return

    setIsLoading(true)
    
    const { error } = await supabase
      .from('todos')
      .insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          user_email: userEmail,
          completed: false
        }
      ])

    if (error) {
      console.error('Error adding task:', error)
      alert(`Error adding task: ${error.message}`)
    } else {
      setTitle('')
      setDescription('')
      onTodoAdded() // Reload the list
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={addTodo} className="mb-6">
      <div className="space-y-3">
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
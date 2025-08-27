// components/AddTodoForm.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { enhanceTask } from '@/lib/n8n'
import type { Todo } from '@/types/todo'

interface AddTodoFormProps {
  userEmail: string
  onTodoAdded: (optimizedTask?: Todo) => void
}

export default function AddTodoForm({ userEmail, onTodoAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !userEmail) return
    setIsLoading(true)

    // 1️⃣ Inserir no Supabase com status 'processing'
    const { data, error } = await supabase
      .from('todos')
      .insert([{
        title: title.trim(),
        description: description.trim() || null,
        user_email: userEmail,
        completed: false,
        processing_status: 'processing'
      }])
      .select()

    if (error || !data || !data[0]) {
      alert(`Error adding task: ${error?.message}`)
      setIsLoading(false)
      return
    }

    const taskId = data[0].id as number

    try {
      // 2️⃣ Chamar o N8N e esperar retorno
      const enhanced = await enhanceTask(taskId)
      if (enhanced) {
        // 3️⃣ Atualizar a task com os dados otimizados
        await supabase.from('todos')
          .update({
            title: enhanced.title ?? title,
            description: enhanced.description ?? description,
            processing_status: 'ready'
          })
          .eq('id', taskId)
      }

      onTodoAdded() // atualizar lista
      setTitle('')
      setDescription('')
    } catch (err) {
      console.error('Enhancement failed', err)
      onTodoAdded() // atualizar lista mesmo assim
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

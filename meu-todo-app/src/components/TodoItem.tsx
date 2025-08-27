'use client'
import { useState } from 'react'
import { Todo } from '@/types/todo'
import { motion, AnimatePresence } from 'framer-motion'

interface TodoItemProps {
  todo: Todo
  onTodoUpdated: () => void
}

interface ApiErrorResponse {
  error: string
}

export default function TodoItem({ todo, onTodoUpdated }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [showDescription, setShowDescription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Toggle completed status
  const toggleCompleted = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          todoId: todo.id, 
          completed: !todo.completed 
        })
      })
      
      if (!response.ok) {
        const error: ApiErrorResponse = await response.json()
        throw new Error(error.error || 'Failed to update task')
      }
      
      onTodoUpdated()
    } catch (error) {
      const err = error as Error
      console.error('Error toggling task:', err)
      alert(`Error updating task: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Save edits
  const saveEdit = async () => {
    if (!editTitle.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          todoId: todo.id,
          title: editTitle.trim(), 
          description: editDescription.trim() || null 
        })
      })
      
      if (!response.ok) {
        const error: ApiErrorResponse = await response.json()
        throw new Error(error.error || 'Failed to edit task')
      }
      
      setIsEditing(false)
      setShowDescription(false)
      onTodoUpdated()
    } catch (error) {
      const err = error as Error
      console.error('Error editing task:', err)
      alert(`Error editing task: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setIsEditing(false)
    setShowDescription(false)
  }

  // Delete task
  const deleteTodo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/todos', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId: todo.id })
      })
      
      if (!response.ok) {
        const error: ApiErrorResponse = await response.json()
        throw new Error(error.error || 'Failed to delete task')
      }
      
      setShowDeleteModal(false)
      onTodoUpdated()
    } catch (error) {
      const err = error as Error
      console.error('Error deleting task:', err)
      alert(`Error deleting task: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={todo.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`border border-gray-600 rounded-lg p-4 mb-3 bg-gray-800 ${
            isLoading ? 'opacity-50' : ''
          } ${todo.processing_status === 'processing' ? 'border-yellow-500 bg-yellow-900/20' : ''}`}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={toggleCompleted}
              disabled={isLoading}
              className="w-5 h-5 mt-1 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400 cursor-pointer"
            />

            <div className="flex-1">
              {/* Processing Status Indicator */}
              {todo.processing_status === 'processing' && (
                <div className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                  <span className="animate-spin">⟳</span>
                  AI is enhancing this task...
                </div>
              )}

              <AnimatePresence>
                {isEditing ? (
                  <motion.div 
                    key="edit-form" 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ duration: 0.2 }} 
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)..."
                      rows={3}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
                      disabled={isLoading}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={saveEdit} 
                        disabled={isLoading || !editTitle.trim()} 
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-600 cursor-pointer"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={cancelEdit} 
                        disabled={isLoading} 
                        className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="view-mode" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-lg ${
                      todo.completed ? 'line-through text-gray-400' : 'text-white'
                    }`}>
                      {todo.title}
                    </div>
                    
                    {todo.description ? (
                      <p className={`text-sm ${
                        todo.completed ? 'text-gray-500' : 'text-gray-300'
                      } mt-2 whitespace-pre-wrap`}>
                        {todo.description}
                      </p>
                    ) : !showDescription ? (
                      <button 
                        onClick={() => setShowDescription(true)} 
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 cursor-pointer"
                      >
                        + Add description
                      </button>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <textarea 
                          value={editDescription} 
                          onChange={(e) => setEditDescription(e.target.value)} 
                          placeholder="Add a description..." 
                          rows={3} 
                          className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={saveEdit} 
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setShowDescription(false)} 
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(true)} 
                  disabled={isLoading} 
                  className="text-blue-400 hover:text-blue-300 px-2 py-1 text-sm cursor-pointer disabled:opacity-50"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)} 
                  disabled={isLoading} 
                  className="text-red-400 hover:text-red-300 px-2 py-1 text-sm cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Created: {new Date(todo.created_at).toLocaleString('pt-BR')}
            {todo.processing_status === 'ready' && (
              <span className="ml-2 text-green-400">✓ Enhanced by AI</span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 backdrop-blur-md bg-black/50" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div 
              className="relative bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-lg max-w-sm w-full mx-4 text-center" 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-white text-lg mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete &ldquo;<span className="font-semibold">{todo.title}</span>&rdquo;?
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={deleteTodo} 
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-600"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  disabled={isLoading}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
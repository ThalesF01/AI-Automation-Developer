'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types/todo'
import { motion, AnimatePresence } from 'framer-motion'

interface TodoItemProps {
  todo: Todo
  onTodoUpdated: () => void
}

export default function TodoItem({ todo, onTodoUpdated }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [showDescription, setShowDescription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const toggleCompleted = async () => {
    setIsLoading(true)
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
    if (!error) onTodoUpdated()
    else alert('Error updating task')
    setIsLoading(false)
  }

  const saveEdit = async () => {
    if (!editTitle.trim()) return
    setIsLoading(true)
    const { error } = await supabase
      .from('todos')
      .update({ title: editTitle.trim(), description: editDescription.trim() || null })
      .eq('id', todo.id)
    if (!error) {
      setIsEditing(false)
      onTodoUpdated()
    } else alert('Error editing task')
    setIsLoading(false)
  }

  const cancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setIsEditing(false)
  }

  const deleteTodo = async () => {
    setIsLoading(true)
    const { error } = await supabase.from('todos').delete().eq('id', todo.id)
    if (!error) {
      setShowDeleteModal(false)
      onTodoUpdated()
    } else alert('Error deleting task')
    setIsLoading(false)
  }

  return (
    <>
      {/* Todo Item com animação ao aparecer */}
      <AnimatePresence>
        <motion.div
          key={todo.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`border border-gray-600 rounded-lg p-4 mb-3 bg-gray-800 ${
            isLoading ? 'opacity-50' : ''
          }`}
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
              {/* Área de edição com animação */}
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
                        Save
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
                    <div className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {todo.title}
                    </div>
                    {todo.description && (
                      <p className={`text-sm ${todo.completed ? 'text-gray-500' : 'text-gray-300'} mt-2 whitespace-pre-wrap`}>
                        {todo.description}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && !showDescription && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 px-2 py-1 text-sm cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 px-2 py-1 text-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Created at: {new Date(todo.created_at).toLocaleString('en-US')}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Modal com animação e fundo borrado */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 backdrop-blur-md bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-lg max-w-sm w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-white text-lg mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this task?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={deleteTodo}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
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

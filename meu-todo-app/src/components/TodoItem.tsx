'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types/todo'

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

  // Toggle completed status
  const toggleCompleted = async () => {
    setIsLoading(true)
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)

    if (error) {
      console.error('Error updating task', error)
      alert('Error updating task')
    } else {
      onTodoUpdated()
    }
    setIsLoading(false)
  }

  // Save edit
  const saveEdit = async () => {
    if (!editTitle.trim()) return
    setIsLoading(true)
    const { error } = await supabase
      .from('todos')
      .update({ title: editTitle.trim(), description: editDescription.trim() || null })
      .eq('id', todo.id)

    if (error) {
      console.error('Error editing task', error)
      alert('Error editing task')
    } else {
      setIsEditing(false)
      onTodoUpdated()
    }
    setIsLoading(false)
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setIsEditing(false)
  }

  // Delete task
  const deleteTodo = async () => {
    setIsLoading(true)
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id)

    if (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task')
    } else {
      setShowDeleteModal(false)
      onTodoUpdated()
    }
    setIsLoading(false)
  }

  return (
    <div
      className={`border border-gray-600 rounded-lg p-4 mb-3 ${
        todo.completed ? 'bg-gray-800' : 'bg-gray-750'
      } ${isLoading ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={toggleCompleted}
          disabled={isLoading}
          className="w-5 h-5 mt-1 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400 cursor-pointer"
        />

        {/* Task content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && saveEdit()}
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
            </div>
          ) : (
            <div>
              <div className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {todo.title}
              </div>
              {todo.description && (
                <div className="mt-2">
                  <p className={`text-sm ${todo.completed ? 'text-gray-500' : 'text-gray-300'} whitespace-pre-wrap`}>
                    {todo.description}
                  </p>
                </div>
              )}
              {!todo.description && !showDescription && (
                <button
                  onClick={() => setShowDescription(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 cursor-pointer"
                >
                  + Add description
                </button>
              )}
              {showDescription && (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        saveEdit()
                        setShowDescription(false)
                      }}
                      disabled={!editDescription.trim()}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-gray-600 cursor-pointer"
                    >
                      Save Description
                    </button>
                    <button
                      onClick={() => {
                        setShowDescription(false)
                        setEditDescription(todo.description || '')
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
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

      {/* Creation date */}
      <div className="text-xs text-gray-500 mt-3">
        Created at: {new Date(todo.created_at).toLocaleString('en-US')}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Fundo borrado transparente */}
    <div className="absolute inset-0 backdrop-blur-md"></div>

    {/* Modal */}
    <div className="relative bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-lg max-w-sm w-full text-center animate-fadeIn">
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
    </div>
  </div>
)}


    </div>
  )
}

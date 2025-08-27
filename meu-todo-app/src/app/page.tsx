'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types/todo'
import AddTodoForm from '@/components/AddTodoForm'
import TodoList from '@/components/TodoList'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Function to load tasks (memoized to satisfy ESLint)
  const loadTodos = useCallback(async () => {
    if (!userEmail) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading tasks:', error)
      alert('Error loading tasks')
    } else {
      setTodos(data || [])
    }

    setIsLoading(false)
  }, [userEmail])

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (userEmail.trim()) {
      setIsLoggedIn(true)
      loadTodos()
    }
  }

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail('')
    setTodos([])
  }

  // Reload automatically when logged in
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      loadTodos()
    }
  }, [isLoggedIn, userEmail, loadTodos])

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">📝 My Task List</h1>
          <p className="text-gray-300">
            Organize your tasks simply and efficiently
          </p>
        </div>

        {!isLoggedIn ? (
          /* Login Screen */
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Enter your email
            </h2>
            <form onSubmit={handleLogin} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="flex-1 border border-gray-600 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Login
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-3">
              Your tasks will be saved and you can access them anytime with this email.
            </p>
          </div>
        ) : (
          /* Main App */
          <div className="space-y-6">
            {/* User Bar */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-sm p-4 flex justify-between items-center">
              <div>
                <span className="text-gray-300">Logged in as: </span>
                <span className="font-semibold text-blue-400">{userEmail}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadTodos}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer"
                >
                  🔄 Reload
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Add Task Form */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Add New Task</h2>
              <AddTodoForm userEmail={userEmail} onTodoAdded={loadTodos} />
            </div>

            {/* Task List */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-sm p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">Loading tasks...</p>
                </div>
              ) : (
                <TodoList todos={todos} onTodoUpdated={loadTodos} />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

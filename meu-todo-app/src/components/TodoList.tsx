// components/TodoList.tsx
'use client'
import { Todo } from '@/types/todo'
import TodoItem from './TodoItem'
import { motion } from 'framer-motion'

interface TodoListProps {
  todos: Todo[]
  onTodoUpdated: () => void
}

export default function TodoList({ todos, onTodoUpdated }: TodoListProps) {
  const completedTodos = todos.filter(todo => todo.completed)
  const pendingTodos = todos.filter(todo => !todo.completed)
  const processingTodos = todos.filter(todo => todo.processing_status === 'processing')

  if (todos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
        <p className="text-gray-400">Add your first task to get started!</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{pendingTodos.length}</div>
          <div className="text-sm text-gray-300">Pending</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{completedTodos.length}</div>
          <div className="text-sm text-gray-300">Completed</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{processingTodos.length}</div>
          <div className="text-sm text-gray-300">Processing</div>
        </div>
      </motion.div>

      {/* Processing Tasks */}
      {processingTodos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
            <span className="animate-spin">⟳</span>
            AI Processing ({processingTodos.length})
          </h3>
          {processingTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onTodoUpdated={onTodoUpdated} />
          ))}
        </motion.div>
      )}

      {/* Pending Tasks */}
      {pendingTodos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
            📋 Pending Tasks ({pendingTodos.length})
          </h3>
          {pendingTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onTodoUpdated={onTodoUpdated} />
          ))}
        </motion.div>
      )}

      {/* Completed Tasks */}
      {completedTodos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
            ✅ Completed Tasks ({completedTodos.length})
          </h3>
          {completedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onTodoUpdated={onTodoUpdated} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
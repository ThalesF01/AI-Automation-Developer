'use client'
import { Todo } from '@/types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onTodoUpdated: () => void
}

export default function TodoList({ todos, onTodoUpdated }: TodoListProps) {
  const completedTodos = todos.filter(todo => todo.completed)
  const pendingTodos = todos.filter(todo => !todo.completed)

  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">Nenhuma tarefa encontrada</p>
        <p className="text-sm">Adicione uma nova tarefa acima para começar!</p>
      </div>
    )
  }

  return (
    <div>
      {/* Statistics */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-white mb-2">Statistics</h3>
        <div className="flex gap-6 text-sm">
          <span className="text-orange-400">
            📋 Total: {todos.length}
          </span>
          <span className="text-yellow-400">
            ⏳ Pending: {pendingTodos.length}
          </span>
          <span className="text-green-400">
            ✅ Completed: {completedTodos.length}
          </span>
        </div>
      </div>

      {/* Pending tasks */}
      {pendingTodos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">
            📋 Pending Tasks ({pendingTodos.length})
          </h3>
          {pendingTodos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onTodoUpdated={onTodoUpdated} 
            />
          ))}
        </div>
      )}

        {/* Completed tasks */}
      {completedTodos.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3">
            ✅ Completed Tasks ({completedTodos.length})
          </h3>
          {completedTodos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onTodoUpdated={onTodoUpdated} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
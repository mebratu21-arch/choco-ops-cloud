import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  Clock,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
  Circle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/common/Modal';
import TaskModal from '../../components/manager/TaskModal';
import { useTasks } from '../../hooks/useTasks';
import { useDeleteTask } from '../../hooks/useTaskMutations';
import { useUsers } from '../../hooks/useUsers';
import { Task, TaskStatus, TaskPriority, User as UserType } from '../../types';
import { cn } from '../../lib/utils';

// Status configuration
const statusConfig: Record<TaskStatus, {
  label: string;
  icon: typeof Circle;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Circle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
};

// Priority configuration
const priorityConfig: Record<TaskPriority, { label: string; variant: 'error' | 'warning' | 'default' | 'secondary' }> = {
  urgent: { label: 'Urgent', variant: 'error' },
  high: { label: 'High', variant: 'warning' },
  medium: { label: 'Medium', variant: 'default' },
  low: { label: 'Low', variant: 'secondary' },
};

const TasksPage: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Hooks
  const { tasks = [], loading, refetch } = useTasks();
  const { users = [] } = useUsers();
  const deleteTaskMutation = useDeleteTask();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === 'all' || task.assigned_to === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Group tasks by status for Kanban board
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    filteredTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Handlers
  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      void refetch();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    void refetch();
  };

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.due_date) < new Date();
  };

  const isDueSoon = (task: Task) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return dueDate <= twoDaysFromNow && dueDate > now;
  };

  // Task Card Component
  const TaskCard: React.FC<{ task: Task; showActions?: boolean }> = ({ task, showActions = true }) => {
    const config = statusConfig[task.status];
    const priorityConf = priorityConfig[task.priority];

    return (
      <div
        className={cn(
          "p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer group",
          config.borderColor,
          isOverdue(task) && "border-red-400 bg-red-50/50"
        )}
        onClick={() => handleEdit(task)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-cocoa-900 line-clamp-2 flex-1">
            {task.title}
          </h4>
          <Badge variant={priorityConf.variant} className="flex-shrink-0 text-xs">
            {priorityConf.label}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-2 text-xs">
          {/* Assignee */}
          <div className="flex items-center gap-2 text-slate-500">
            <User className="w-3.5 h-3.5" />
            <span>{task.assigned_to_name ?? 'Unassigned'}</span>
          </div>

          {/* Due date */}
          <div className={cn(
            "flex items-center gap-2",
            isOverdue(task) ? "text-red-600" : isDueSoon(task) ? "text-amber-600" : "text-slate-500"
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span className={cn(isOverdue(task) && "font-medium")}>
              {isOverdue(task) && 'Overdue: '}
              {formatDate(task.due_date)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(task);
              }}
              className="flex-1"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task);
              }}
              className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Kanban Column Component
  const KanbanColumn: React.FC<{ status: TaskStatus; tasks: Task[] }> = ({ status, tasks }) => {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <div className={cn(
        "flex-1 min-w-[280px] rounded-xl p-4",
        config.bgColor
      )}>
        {/* Column header */}
        <div className="flex items-center gap-2 mb-4">
          <StatusIcon className={cn("w-5 h-5", config.color)} />
          <h3 className={cn("font-semibold", config.color)}>
            {config.label}
          </h3>
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </div>

        {/* Tasks */}
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Status change hint */}
        {status !== 'completed' && status !== 'cancelled' && (
          <div className="mt-4 pt-3 border-t border-slate-200/50">
            <p className="text-xs text-slate-400 text-center">
              Click a task to change status
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Task Management"
          subtitle="Assign and track tasks for your team"
          icon={ListTodo}
        />
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="gap-1"
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-1"
            >
              <List className="w-4 h-4" />
              Table
            </Button>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cocoa-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cocoa-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cocoa-500"
            >
              <option value="all">All Assignees</option>
              {users.map((user: UserType) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-32 bg-slate-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'board' ? (
        // Kanban Board View
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
            />
          ))}
        </div>
      ) : (
        // Table View
        <Card>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No tasks found
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first task to get started'}
                </p>
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((task: Task) => {
                      const config = statusConfig[task.status];
                      const priorityConf = priorityConfig[task.priority];
                      const StatusIcon = config.icon;

                      return (
                        <tr
                          key={task.id}
                          className={cn(
                            "hover:bg-slate-50 transition-colors cursor-pointer",
                            isOverdue(task) && "bg-red-50/50"
                          )}
                          onClick={() => handleEdit(task)}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-cocoa-900">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-slate-500 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-cocoa-100 rounded-full flex items-center justify-center text-cocoa-600 font-medium text-xs">
                                {task.assigned_to_name?.charAt(0) ?? '?'}
                              </div>
                              <span className="text-sm text-slate-600">
                                {task.assigned_to_name ?? 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={priorityConf.variant}>
                              {priorityConf.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                              config.bgColor,
                              config.color
                            )}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "text-sm",
                              isOverdue(task) ? "text-red-600 font-medium" : isDueSoon(task) ? "text-amber-600" : "text-slate-600"
                            )}>
                              {isOverdue(task) && (
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                              )}
                              {formatDate(task.due_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(task);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(task);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats summary */}
      {!loading && tasks.length > 0 && (
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 px-1">
          <span>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
          <span className="flex items-center gap-1">
            <Circle className="w-3 h-3 text-slate-400" />
            Pending: {tasksByStatus.pending.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            In Progress: {tasksByStatus.in_progress.length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Completed: {tasksByStatus.completed.length}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <AlertCircle className="w-3 h-3" />
            Overdue: {filteredTasks.filter(isOverdue).length}
          </span>
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={selectedTask ?? undefined}
        onSuccess={handleModalClose}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="p-4">
          <p className="text-slate-600 mb-4">
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { void confirmDelete(); }}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;

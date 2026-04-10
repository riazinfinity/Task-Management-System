"use client";

import { useState, useMemo } from "react";
import { useTasks, Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, ClipboardList, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const {
    tasks,
    loading,
    error,
    params,
    updateParams,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date(t.dueDate) < new Date(new Date().toDateString());
    }).length;
    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  const handleCreate = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
  }) => {
    const result = await createTask(data);
    if (result) {
      toast.success("Task created successfully!");
    } else {
      toast.error("Failed to create task. Please try again.");
    }
    return result;
  };

  const handleUpdate = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
  }) => {
    if (!editingTask) return null;
    const result = await updateTask(editingTask.id, data);
    if (result) {
      toast.success("Task updated successfully!");
      setEditingTask(null);
    } else {
      toast.error("Failed to update task. Please try again.");
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      toast.success("Task deleted successfully!");
    } else {
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    const statusLabels: Record<TaskStatus, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
    };
    const result = await updateTaskStatus(id, status);
    if (result) {
      toast.success(`Task moved to ${statusLabels[status]}`);
    } else {
      toast.error("Failed to update task status.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-none">
                  TaskFlow
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Task Management System
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTask(null);
                setFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">
                In Progress
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Completed
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={params.search || ""}
                onChange={(e) =>
                  updateParams({ search: e.target.value || undefined })
                }
                className="pl-9"
              />
            </div>

            {/* Priority Filter */}
            <Select
              value={params.priority || "all"}
              onValueChange={(value) =>
                updateParams({ priority: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Tabs */}
          <div className="mt-3">
            <Tabs
              value={params.status || "all"}
              onValueChange={(value) =>
                updateParams({ status: value === "all" ? undefined : value })
              }
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs">
                  In Progress ({stats.inProgress})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completed ({stats.completed})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-64 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">Something went wrong</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {params.search
                  ? "No matching tasks"
                  : params.status
                  ? `No ${params.status.replace("_", " ")} tasks`
                  : "No tasks yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {params.search
                  ? "Try a different search term"
                  : "Create your first task to get started"}
              </p>
              {!params.search && !params.status && (
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setFormOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <>
              {stats.overdue > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <span className="font-medium">{stats.overdue} overdue</span>{" "}
                    task{stats.overdue > 1 ? "s" : ""} — consider updating their
                    status or due dates.
                  </p>
                </div>
              )}
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-muted-foreground">
            TaskFlow — Task Management System &middot; Built with Next.js, Prisma
            &amp; Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={editingTask ? handleUpdate : handleCreate}
      />
    </div>
  );
}

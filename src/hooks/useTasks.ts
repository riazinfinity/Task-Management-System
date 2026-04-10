import { useState, useEffect, useCallback } from "react";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FetchTasksParams {
  status?: string;
  priority?: string;
  search?: string;
}

export function useTasks(initialParams: FetchTasksParams = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchTasksParams>(initialParams);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.status && params.status !== "all") {
        searchParams.set("status", params.status);
      }
      if (params.priority && params.priority !== "all") {
        searchParams.set("priority", params.priority);
      }
      if (params.search) {
        searchParams.set("search", params.search);
      }

      const response = await fetch(`/api/tasks?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateParams = useCallback((newParams: Partial<FetchTasksParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const createTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
    }): Promise<Task | null> => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to create task");
        }
        const task = await response.json();
        await fetchTasks(); // Refresh the list
        return task;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
        return null;
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        description?: string;
        priority?: TaskPriority;
        dueDate?: string;
      }
    ): Promise<Task | null> => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to update task");
        }
        const task = await response.json();
        await fetchTasks();
        return task;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        return null;
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to delete task");
        }
        await fetchTasks();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
        return false;
      }
    },
    [fetchTasks]
  );

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus): Promise<Task | null> => {
      try {
        const response = await fetch(`/api/tasks/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to update status");
        }
        const task = await response.json();
        await fetchTasks();
        return task;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update status"
        );
        return null;
      }
    },
    [fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    params,
    updateParams,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refresh: fetchTasks,
  };
}

"use client";

import { useState } from "react";
import { Task, TaskPriority } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null; // null means creating, task object means editing
  onSubmit: (
    data: {
      title: string;
      description?: string;
      priority: TaskPriority;
      dueDate?: string;
    }
  ) => Promise<Task | null>;
}

function getInitialValues(task: Task | null) {
  return {
    title: task ? task.title : "",
    description: task ? task.description || "" : "",
    priority: (task ? task.priority : "medium") as TaskPriority,
    dueDate: task
      ? task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : ""
      : "",
  };
}

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const [values, setValues] = useState(() => getInitialValues(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form values when dialog opens with different task data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // When opening, set initial values based on task
      setValues(getInitialValues(task));
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    } else if (values.title.trim().length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    const result = await onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
    });
    setSubmitting(false);

    if (result) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {task
                ? "Update the task details below."
                : "Fill in the details to create a new task."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Design homepage layout"
                value={values.title}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, title: e.target.value }))
                }
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details about this task..."
                value={values.description}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={values.priority}
                onValueChange={(value) =>
                  setValues((prev) => ({
                    ...prev,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

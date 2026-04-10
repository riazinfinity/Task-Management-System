"use client";

import { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <ArrowRight className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  high: { label: "High", color: "bg-red-100 text-red-700 border-red-200" },
  medium: {
    label: "Medium",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  low: { label: "Low", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

function getNextStatus(status: TaskStatus): TaskStatus | null {
  switch (status) {
    case "pending":
      return "in_progress";
    case "in_progress":
      return "completed";
    case "completed":
      return null;
    default:
      return null;
  }
}

function getPrevStatus(status: TaskStatus): TaskStatus | null {
  switch (status) {
    case "in_progress":
      return "pending";
    case "completed":
      return "in_progress";
    case "pending":
      return null;
    default:
      return null;
  }
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  const isOverdue =
    task.dueDate &&
    task.status !== "completed" &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-md border ${
        task.status === "completed"
          ? "bg-slate-50/50 opacity-75"
          : "bg-white"
      }`}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm leading-snug ${
                task.status === "completed"
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className={`text-xs ${status.color}`}>
            <span className="flex items-center gap-1">
              {status.icon}
              {status.label}
            </span>
          </Badge>
          <Badge variant="outline" className={`text-xs ${priority.color}`}>
            {priority.label}
          </Badge>
          {task.dueDate && (
            <Badge
              variant="outline"
              className={`text-xs flex items-center gap-1 ${
                isOverdue
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "text-muted-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
              {isOverdue && (
                <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
              )}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-muted/50">
          {/* Status navigation buttons */}
          <div className="flex items-center gap-1">
            {prevStatus && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onStatusChange(task.id, prevStatus)}
                title={`Move back to ${statusConfig[prevStatus].label}`}
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
            )}
            {nextStatus && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onStatusChange(task.id, nextStatus)}
                title={`Move to ${statusConfig[nextStatus].label}`}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {statusConfig[nextStatus].label}
              </Button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{task.title}&quot;? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(task.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

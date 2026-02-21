"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Pencil } from "lucide-react";
import { TodoEditDialog } from "./todo-edit-dialog";
import { getDueDateLabel, getDaysUntilDue } from "@/lib/date-utils";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
}

interface TodoItemProps {
  todo: Todo;
  onUpdated: () => void;
  onDeleted: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  URGENT: "destructive",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export function TodoItem({ todo, onUpdated, onDeleted }: TodoItemProps) {
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success("Estado actualizado");
    }
    onUpdated();
    setLoading(false);
  }

  async function deleteTodo() {
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tarea eliminada");
      onDeleted();
    } else {
      toast.error("No se pudo eliminar la tarea");
      setLoading(false);
    }
  }

  const isCompleted = todo.status === "COMPLETED";
  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    !isCompleted;

  return (
    <Card className={`transition-opacity ${isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={(checked) =>
              updateStatus(checked ? "COMPLETED" : "PENDING")
            }
            disabled={loading}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium text-sm leading-snug ${
                  isCompleted ? "line-through text-muted-foreground" : ""
                }`}
              >
                {todo.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={PRIORITY_COLORS[todo.priority] as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {PRIORITY_LABELS[todo.priority]}
                </Badge>
              </div>
            </div>
            {todo.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Select
                  value={todo.status}
                  onValueChange={updateStatus}
                  disabled={loading}
                >
                  <SelectTrigger className="h-7 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                  </SelectContent>
                </Select>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Vencida
                  </Badge>
                )}
                {todo.dueDate && !isCompleted && (
                  <span className={`text-xs ${
                    isOverdue
                      ? "text-red-500 font-medium"
                      : getDaysUntilDue(todo.dueDate) <= 2
                        ? "text-amber-500 font-medium"
                        : "text-muted-foreground"
                  }`}>
                    {getDueDateLabel(todo.dueDate)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowEdit(true)}
                  disabled={loading}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={loading}
                    >
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la tarea &quot;{todo.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteTodo}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <TodoEditDialog
        todo={todo}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={onUpdated}
      />
    </Card>
  );
}

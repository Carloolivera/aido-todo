"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { TodoFilters } from "./todo-filters";
import { ThemeToggle } from "./theme-toggle";
import { StatsPanel } from "./stats-panel";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
}

interface TodoListProps {
  userName: string;
  userEmail: string;
}

type SortBy = "createdAt" | "priority" | "dueDate" | "status";

const ITEMS_PER_PAGE = 10;

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  PENDING: 1,
  COMPLETED: 2,
};

function SortableTodoItem({
  todo,
  onUpdated,
  onDeleted,
}: {
  todo: Todo;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-1">
      <button
        {...attributes}
        {...listeners}
        className="mt-3 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <TodoItem todo={todo} onUpdated={onUpdated} onDeleted={onDeleted} />
      </div>
    </div>
  );
}

export function TodoList({ userName, userEmail }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const notifiedRef = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFilteredTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data: Todo[] = await res.json();
      setTodos(data);
      setRefreshKey((k) => k + 1);

      if (!notifiedRef.current) {
        notifiedRef.current = true;
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const active = data.filter((t) => t.status !== "COMPLETED" && t.dueDate);
        const overdue = active.filter((t) => new Date(t.dueDate!) < now);
        const dueSoon = active.filter(
          (t) => new Date(t.dueDate!) >= now && new Date(t.dueDate!) <= in24h
        );

        if (overdue.length > 0) {
          toast.error(
            `${overdue.length} tarea${overdue.length > 1 ? "s vencidas" : " vencida"}`,
            { description: overdue.map((t) => t.title).join(", ") }
          );
        }
        if (dueSoon.length > 0) {
          toast.warning(
            `${dueSoon.length} tarea${dueSoon.length > 1 ? "s vencen" : " vence"} en las próximas 24hs`,
            { description: dueSoon.map((t) => t.title).join(", ") }
          );
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    let result = [...todos];

    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return (
            (PRIORITY_ORDER[a.priority] ?? 99) -
            (PRIORITY_ORDER[b.priority] ?? 99)
          );
        case "status":
          return (
            (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
          );
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredTodos(result);
    setCurrentPage(1);
  }, [todos, statusFilter, searchFilter, sortBy]);

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToCSV = () => {
    const headers = ["Título", "Descripción", "Estado", "Prioridad", "Fecha límite", "Creado el"];
    const rows = filteredTodos.map((t) => [
      t.title,
      t.description ?? "",
      t.status,
      t.priority,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-AR") : "",
      new Date(t.createdAt).toLocaleDateString("es-AR"),
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tareas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = todos.filter((t) => t.status === "COMPLETED").length;
  const pendingCount = todos.filter((t) => t.status === "PENDING").length;
  const inProgressCount = todos.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold text-lg">AIDO Todo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {userName || userEmail}
            </span>
            <ThemeToggle />
            <form action="/api/auth/signout" method="POST">
              <Button
                variant="outline"
                size="sm"
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  const { signOut } = await import("next-auth/react");
                  signOut({ callbackUrl: "/login" });
                }}
              >
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {pendingCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Pendientes</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {inProgressCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              En progreso
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {completedCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Completadas
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <StatsPanel refreshKey={refreshKey} />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis tareas</h2>
          <div className="flex items-center gap-2">
            {filteredTodos.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                Exportar CSV
              </Button>
            )}
            <Button onClick={() => setShowForm(true)}>+ Nueva tarea</Button>
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <TodoFilters
          status={statusFilter}
          search={searchFilter}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchFilter}
          sortBy={sortBy}
          onSortChange={(v) => setSortBy(v as SortBy)}
          total={todos.length}
          filtered={filteredTodos.length}
        />

        {/* Todo list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando tareas...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">
              {todos.length === 0 ? "📋" : "🔍"}
            </p>
            <p className="text-muted-foreground">
              {todos.length === 0
                ? "No tenés tareas todavía. ¡Creá una!"
                : "No hay tareas que coincidan con los filtros."}
            </p>
            {todos.length === 0 && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                Crear primera tarea
              </Button>
            )}
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={paginatedTodos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {paginatedTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdated={fetchTodos}
                      onDeleted={fetchTodos}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <TodoForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={fetchTodos}
      />
    </div>
  );
}

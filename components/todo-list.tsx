"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { TodoFilters } from "./todo-filters";
import { ThemeToggle } from "./theme-toggle";
import { StatsPanel } from "./stats-panel";

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

export function TodoList({ userName, userEmail }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data);
      setRefreshKey((k) => k + 1);
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
  }, [todos, statusFilter, searchFilter, sortBy]);

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
          <Button onClick={() => setShowForm(true)}>+ Nueva tarea</Button>
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
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdated={fetchTodos}
                onDeleted={fetchTodos}
              />
            ))}
          </div>
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

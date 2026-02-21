"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TodoFiltersProps {
  status: string;
  search: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  total: number;
  filtered: number;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completadas" },
];

export function TodoFilters({
  status,
  search,
  onStatusChange,
  onSearchChange,
  total,
  filtered,
}: TodoFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={status === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar tareas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered === total ? `${total} tareas` : `${filtered} de ${total}`}
        </span>
      </div>
    </div>
  );
}

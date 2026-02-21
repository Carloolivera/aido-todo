import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoItem } from "@/components/todo-item";
import { getDueDateLabel } from "@/lib/date-utils";

// Fecha relativa a HOY para que los tests no dependan de una fecha fija
function localDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const makeTodo = (overrides = {}) => ({
  id: "todo-1",
  title: "Tarea de prueba",
  description: "Descripción de prueba",
  status: "PENDING",
  priority: "MEDIUM",
  dueDate: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("TodoItem — renderizado", () => {
  it("muestra el título de la tarea", () => {
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
  });

  it("muestra la descripción cuando existe", () => {
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByText("Descripción de prueba")).toBeInTheDocument();
  });

  it("no muestra descripción cuando es null", () => {
    render(<TodoItem todo={makeTodo({ description: null })} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.queryByText("Descripción de prueba")).not.toBeInTheDocument();
  });

  it("muestra el badge de prioridad correctamente", () => {
    render(<TodoItem todo={makeTodo({ priority: "HIGH" })} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  it("aplica opacity-60 cuando la tarea está completada", () => {
    const { container } = render(
      <TodoItem todo={makeTodo({ status: "COMPLETED" })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(container.firstChild).toHaveClass("opacity-60");
  });

  it("no aplica opacity-60 para tareas pendientes", () => {
    const { container } = render(
      <TodoItem todo={makeTodo({ status: "PENDING" })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(container.firstChild).not.toHaveClass("opacity-60");
  });
});

describe("TodoItem — due dates", () => {
  it("muestra badge 'Vencida' para tareas vencidas no completadas", () => {
    render(
      <TodoItem todo={makeTodo({ dueDate: localDateString(-3) })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getByText("Vencida")).toBeInTheDocument();
  });

  it("muestra 'Vence hoy' para tareas con vencimiento hoy", () => {
    render(
      <TodoItem todo={makeTodo({ dueDate: localDateString(0) })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getByText("Vence hoy")).toBeInTheDocument();
  });

  it("muestra 'Vence mañana' para el día siguiente", () => {
    render(
      <TodoItem todo={makeTodo({ dueDate: localDateString(1) })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getByText("Vence mañana")).toBeInTheDocument();
  });

  it("muestra countdown correcto para fechas vencidas", () => {
    const dueDate = localDateString(-5);
    render(
      <TodoItem todo={makeTodo({ dueDate })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getByText(getDueDateLabel(dueDate))).toBeInTheDocument();
  });

  it("muestra countdown correcto para fechas futuras lejanas", () => {
    const dueDate = localDateString(14);
    render(
      <TodoItem todo={makeTodo({ dueDate })} onUpdated={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getByText(getDueDateLabel(dueDate))).toBeInTheDocument();
  });

  it("no muestra countdown cuando la tarea está completada", () => {
    render(
      <TodoItem
        todo={makeTodo({ status: "COMPLETED", dueDate: localDateString(-3) })}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    );
    expect(screen.queryByText(/Venció|Vence/)).not.toBeInTheDocument();
  });

  it("no muestra due date cuando no hay fecha", () => {
    render(<TodoItem todo={makeTodo({ dueDate: null })} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.queryByText(/Vence|Venció/)).not.toBeInTheDocument();
  });
});

describe("TodoItem — acciones", () => {
  it("llama onDeleted al confirmar la eliminación en el AlertDialog", async () => {
    const onDeleted = vi.fn();
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={onDeleted} />);
    // Paso 1: click en el trigger "Eliminar" → abre el AlertDialog
    fireEvent.click(screen.getByText("Eliminar"));
    // Paso 2: click en el botón de confirmar dentro del dialog
    await waitFor(() => {
      const confirmBtn = screen.getAllByText("Eliminar")[1];
      fireEvent.click(confirmBtn);
    });
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  });

  it("no llama onDeleted si el usuario cancela en el AlertDialog", async () => {
    const onDeleted = vi.fn();
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={onDeleted} />);
    // Abrir el dialog
    fireEvent.click(screen.getByText("Eliminar"));
    // Clickear "Cancelar"
    await waitFor(() => {
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => expect(onDeleted).not.toHaveBeenCalled());
  });

  it("llama a fetch DELETE al confirmar en el AlertDialog", async () => {
    render(<TodoItem todo={makeTodo({ id: "todo-abc" })} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    // Abrir el dialog
    fireEvent.click(screen.getByText("Eliminar"));
    // Confirmar
    await waitFor(() => {
      const confirmBtn = screen.getAllByText("Eliminar")[1];
      fireEvent.click(confirmBtn);
    });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/todos/todo-abc", { method: "DELETE" });
    });
  });

  it("muestra el botón de editar", () => {
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("abre el dialog de edición al clickear el lápiz", async () => {
    render(<TodoItem todo={makeTodo()} onUpdated={vi.fn()} onDeleted={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});

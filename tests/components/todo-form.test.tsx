import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "@/components/todo-form";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TodoForm — renderizado", () => {
  it("no renderiza nada cuando open=false", () => {
    render(
      <TodoForm open={false} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(screen.queryByText("Nueva tarea")).not.toBeInTheDocument();
  });

  it("muestra el dialog cuando open=true", () => {
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(screen.getByText("Nueva tarea")).toBeInTheDocument();
  });

  it("muestra los campos de título y descripción", () => {
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it("muestra los botones Cancelar y Crear tarea", () => {
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear tarea/i })).toBeInTheDocument();
  });
});

describe("TodoForm — validación", () => {
  it("el botón Crear está deshabilitado cuando el título está vacío", () => {
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /crear tarea/i })).toBeDisabled();
  });

  it("el botón Crear se habilita al escribir un título", async () => {
    const user = userEvent.setup();
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );
    await user.type(screen.getByLabelText(/título/i), "Mi tarea");
    expect(screen.getByRole("button", { name: /crear tarea/i })).not.toBeDisabled();
  });
});

describe("TodoForm — envío", () => {
  it("llama a fetch POST con los datos correctos al enviar", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={onCreated} />
    );

    await user.type(screen.getByLabelText(/título/i), "Nueva tarea test");
    fireEvent.click(screen.getByRole("button", { name: /crear tarea/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/todos", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }));
    });

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.title).toBe("Nueva tarea test");
    expect(body.priority).toBe("MEDIUM");
  });

  it("llama a onCreated y onClose al crear exitosamente", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();
    render(
      <TodoForm open={true} onClose={onClose} onCreated={onCreated} />
    );

    await user.type(screen.getByLabelText(/título/i), "Tarea exitosa");
    fireEvent.click(screen.getByRole("button", { name: /crear tarea/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it("muestra error cuando la API falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const user = userEvent.setup();
    render(
      <TodoForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />
    );

    await user.type(screen.getByLabelText(/título/i), "Tarea con error");
    fireEvent.click(screen.getByRole("button", { name: /crear tarea/i }));

    await waitFor(() => {
      expect(screen.getByText(/no se pudo crear/i)).toBeInTheDocument();
    });
  });

  it("llama a onClose al clickear Cancelar", () => {
    const onClose = vi.fn();
    render(
      <TodoForm open={true} onClose={onClose} onCreated={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

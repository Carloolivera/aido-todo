import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDueDateLabel, isDateOverdue, getDaysUntilDue } from "@/lib/date-utils";

// Solo fakeamos Date, NO los timers (evita romper waitFor/promesas)
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // new Date(year, month0indexed, day, hour) — crea en hora local, evita desfase UTC
  vi.setSystemTime(new Date(2026, 1, 20, 12, 0, 0)); // viernes 20 feb 2026
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getDueDateLabel", () => {
  it("muestra 'Venció hace 1 día' para ayer (singular)", () => {
    expect(getDueDateLabel("2026-02-19")).toBe("Venció hace 1 día");
  });

  it("muestra 'Venció hace N días' para fechas pasadas (plural)", () => {
    expect(getDueDateLabel("2026-02-15")).toBe("Venció hace 5 días");
  });

  it("muestra 'Vence hoy' para el día actual", () => {
    expect(getDueDateLabel("2026-02-20")).toBe("Vence hoy");
  });

  it("muestra 'Vence mañana' para el día siguiente", () => {
    expect(getDueDateLabel("2026-02-21")).toBe("Vence mañana");
  });

  it("muestra 'Vence en N días' para fechas dentro de la semana", () => {
    expect(getDueDateLabel("2026-02-25")).toBe("Vence en 5 días");
    expect(getDueDateLabel("2026-02-27")).toBe("Vence en 7 días");
  });

  it("muestra fecha formateada para más de 7 días", () => {
    const label = getDueDateLabel("2026-03-10");
    expect(label).toMatch(/^Vence el/);
    expect(label).toContain("10");
  });
});

describe("isDateOverdue", () => {
  it("retorna true para fechas pasadas", () => {
    expect(isDateOverdue("2026-02-19")).toBe(true);
    expect(isDateOverdue("2026-01-01")).toBe(true);
  });

  it("retorna false para hoy", () => {
    expect(isDateOverdue("2026-02-20")).toBe(false);
  });

  it("retorna false para fechas futuras", () => {
    expect(isDateOverdue("2026-02-21")).toBe(false);
    expect(isDateOverdue("2026-12-31")).toBe(false);
  });
});

describe("getDaysUntilDue", () => {
  it("retorna número negativo para fechas pasadas", () => {
    expect(getDaysUntilDue("2026-02-19")).toBe(-1);
    expect(getDaysUntilDue("2026-02-15")).toBe(-5);
  });

  it("retorna 0 para hoy", () => {
    expect(getDaysUntilDue("2026-02-20")).toBe(0);
  });

  it("retorna número positivo para fechas futuras", () => {
    expect(getDaysUntilDue("2026-02-21")).toBe(1);
    expect(getDaysUntilDue("2026-02-27")).toBe(7);
  });
});

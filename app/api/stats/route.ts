import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allTodos = await db.todo.findMany({
    where: { userId: session.user.id },
    select: { status: true, priority: true, createdAt: true },
  });

  const byStatus = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };

  for (const todo of allTodos) {
    byStatus[todo.status as keyof typeof byStatus]++;
    byPriority[todo.priority as keyof typeof byPriority]++;
  }

  const total = allTodos.length;
  const completionRate =
    total > 0 ? Math.round((byStatus.COMPLETED / total) * 100) : 0;

  return NextResponse.json({
    byStatus: [
      { name: "Pendientes", value: byStatus.PENDING, key: "pending" },
      { name: "En progreso", value: byStatus.IN_PROGRESS, key: "inprogress" },
      { name: "Completadas", value: byStatus.COMPLETED, key: "completed" },
    ],
    byPriority: [
      { priority: "Baja", count: byPriority.LOW },
      { priority: "Media", count: byPriority.MEDIUM },
      { priority: "Alta", count: byPriority.HIGH },
      { priority: "Urgente", count: byPriority.URGENT },
    ],
    total,
    completionRate,
  });
}

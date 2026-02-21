import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "ALL") where.status = status;
  if (search) where.title = { contains: search };

  const todos = await db.todo.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTodoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, priority, dueDate } = parsed.data;

  const todo = await db.todo.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { email: ["Este email ya está registrado"] } }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user, { status: 201 });
}

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await db.user.upsert({
    where: { email: "demo@aido.dev" },
    update: {},
    create: {
      email: "demo@aido.dev",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log(`User created: ${user.email}`);

  await db.todo.deleteMany({ where: { userId: user.id } });

  const todos = [
    { title: "Revisar propuesta de cliente", description: "Revisar el documento enviado por el cliente y preparar feedback", priority: "HIGH", status: "PENDING" },
    { title: "Actualizar landing page de AIDO", description: "Incorporar los nuevos proyectos al portfolio", priority: "MEDIUM", status: "IN_PROGRESS" },
    { title: "Configurar Docker para el proyecto", description: null, priority: "LOW", status: "PENDING" },
    { title: "Deploy en Hostinger", description: "Publicar versión 1.0 en producción", priority: "URGENT", status: "PENDING", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { title: "Reunión con Alexis", description: "Revisar roadmap Q1 2026", priority: "HIGH", status: "COMPLETED" },
    { title: "Investigar shadcn/ui components", description: null, priority: "LOW", status: "COMPLETED" },
  ];

  for (const todo of todos) {
    await db.todo.create({ data: { ...todo, userId: user.id } });
  }

  console.log(`${todos.length} todos created`);
  console.log("\nCredenciales demo:");
  console.log("  Email:    demo@aido.dev");
  console.log("  Password: password123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

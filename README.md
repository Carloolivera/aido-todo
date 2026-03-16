# aido-todo

Todo app completa con autenticación, dashboard con gráficos, dark mode y 40+ tests.

**Demo:** [aido-todo.vercel.app](https://aido-todo.vercel.app)
**Credenciales demo:** `demo@aido.dev` / `password123`

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Base de datos | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 (Driver Adapter) |
| Auth | NextAuth v5 (Credentials) |
| Testing | Vitest + Testing Library (40+ tests) |
| Charts | Recharts |
| Deploy | Vercel |

## Features

- **Auth completo** — registro, login, logout con bcrypt + JWT
- **CRUD de tareas** — crear, editar, eliminar con validación Zod
- **Prioridades** — Urgent, High, Medium, Low con badges de color
- **Estados** — Pending, In Progress, Completed
- **Due dates** — con indicadores de overdue/today/upcoming
- **Filtros y búsqueda** — por estado, texto, ordenamiento múltiple
- **Dashboard con gráficos** — DonutChart + BarChart (Recharts)
- **Dark mode** — toggle con next-themes
- **Responsive** — mobile-first
- **40+ tests** — componentes + utilidades con Vitest

## Quick Start

```bash
git clone https://github.com/Carloolivera/aido-todo.git
cd aido-todo
npm install
```

Crear `.env.local`:

```env
DATABASE_URL="postgresql://..."     # Neon connection string
AUTH_SECRET="..."                    # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

O con Vercel CLI: `vercel env pull .env.local --yes`

```bash
npx prisma db push
npx prisma db seed     # Carga datos demo
npm run dev
```

## API Endpoints

```
POST   /api/register         → crear usuario
GET    /api/todos             → listar tareas
POST   /api/todos             → crear tarea
PUT    /api/todos/[id]        → actualizar tarea
DELETE /api/todos/[id]        → eliminar tarea
GET    /api/stats             → estadísticas
```

## Testing

```bash
npm test              # Correr 40+ tests
npm run test:watch    # Watch mode
```

## Scripts

```bash
npm run dev           # Dev server (Turbopack)
npm run build         # Build producción
npm test              # Vitest
npm run db:seed       # Seed datos demo
npm run db:studio     # Prisma Studio (GUI)
```

---

Desarrollado por [AIDO Digital Agency](https://aidoagencia.com) · Chascomús, Buenos Aires

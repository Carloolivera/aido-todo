# aido-todo

Todo app completa con autenticación, dashboard con gráficos, dark mode y 40+ tests. Proyecto de portafolio de [AIDO Digital Agency](https://aidoagencia.com).

**Demo:** [aido-todo.vercel.app](https://aido-todo.vercel.app)
**Credenciales demo:** `demo@aido.dev` / `password123`

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.1.6 (App Router + Turbopack) |
| UI | React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui |
| Base de datos | PostgreSQL (Neon serverless) |
| ORM | Prisma 7.4.1 (Driver Adapter) |
| Auth | NextAuth v5 (Credentials + JWT) |
| Testing | Vitest 4 + Testing Library (40+ tests) |
| Charts | Recharts |
| Deploy | Vercel |

---

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

---

## Instalación local

```bash
git clone https://github.com/Carloolivera/aido-todo.git
cd aido-todo
npm install
```

Configurar variables de entorno:

```bash
# Opción A — bajar vars de Vercel (requiere Vercel CLI)
vercel env pull .env.local --yes

# Opción B — PostgreSQL local con Docker
docker run --name aido-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

`.env.local` mínimo:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."                    # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

Inicializar la base de datos:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

---

## API Endpoints

```
POST   /api/register         → crear usuario
GET    /api/todos             → listar tareas del usuario autenticado
POST   /api/todos             → crear tarea
PUT    /api/todos/[id]        → actualizar tarea
DELETE /api/todos/[id]        → eliminar tarea
GET    /api/stats             → estadísticas del dashboard
```

---

## Scripts

```bash
npm run dev           # Dev server (Turbopack)
npm run build         # Build de producción
npm test              # 40+ tests con Vitest
npm run test:watch    # Watch mode
npm run db:seed       # Seed datos demo
npm run db:reset      # Reset completo + seed
npm run db:studio     # Prisma Studio (GUI de la DB)
```

---

## Estructura

```
app/
├── (auth)/login/           — Login
├── (auth)/register/        — Registro
├── (dashboard)/todos/      — Dashboard principal
├── api/auth/               — NextAuth handler
├── api/todos/              — API REST de tareas
└── api/register/           — Registro de usuarios
components/
├── ui/                     — shadcn/ui
├── todo-list.tsx
├── todo-item.tsx
├── todo-form.tsx
└── todo-filters.tsx
lib/
├── db.ts                   — Prisma client
├── auth.ts                 — NextAuth config (server)
└── auth.config.ts          — NextAuth config (edge)
prisma/
├── schema.prisma
└── seed.ts
```

---

Desarrollado por [AIDO Digital Agency](https://aidoagencia.com) · Chascomús, Buenos Aires

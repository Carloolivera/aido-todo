# CLAUDE.md — aido-todo

## Proyecto

App de lista de tareas (Todo App) demo para AIDO Digital Agency.
Stack moderno: Next.js 15 + React 19 + TypeScript + shadcn/ui + Prisma 7 + SQLite.

## Stack

- **Framework**: Next.js 16.1.6 (App Router, RSC)
- **UI**: React 19 + TypeScript
- **Componentes**: shadcn/ui 3.8.5 + Tailwind CSS 4
- **DB**: SQLite (dev) — Prisma 7.4.1 con `@prisma/adapter-better-sqlite3`
- **Auth**: next-auth v5 beta (Auth.js) — JWT strategy, Credentials provider
- **ORM**: Prisma 7 — cliente generado en `lib/generated/prisma/`
- **Validación**: Zod

## ⚠️ Notas importantes de Prisma 7

Prisma 7 tiene cambios breaking vs versiones anteriores:
- La URL del datasource NO va en `schema.prisma` → va en `prisma.config.ts`
- `PrismaClient` ahora requiere un **Driver Adapter** (no string de conexión directa)
- Para SQLite usar `PrismaBetterSqlite3({ url: "file:./ruta.db" })` de `@prisma/adapter-better-sqlite3`
- El cliente se genera como TypeScript en `lib/generated/prisma/`
- Import: `import { PrismaClient } from "./generated/prisma/client"`

## Estructura

```
app/
├── (auth)/login/page.tsx       — Login (Client Component)
├── (auth)/register/page.tsx    — Registro (Client Component)
├── (dashboard)/todos/page.tsx  — Página de todos (Server Component)
├── api/auth/[...nextauth]/     — next-auth handler
├── api/todos/route.ts          — GET + POST todos
├── api/todos/[id]/route.ts     — PUT + DELETE todo
├── api/register/route.ts       — POST registro de usuario
├── layout.tsx
└── page.tsx                    — Redirect
components/
├── ui/                         — shadcn/ui components
├── todo-list.tsx               — Lista principal (Client Component)
├── todo-item.tsx               — Item individual (Client Component)
├── todo-form.tsx               — Modal crear tarea (Client Component)
└── todo-filters.tsx            — Filtros (Client Component)
lib/
├── db.ts                       — Prisma client singleton
├── auth.ts                     — next-auth config
└── generated/prisma/           — Cliente Prisma generado
prisma/
├── schema.prisma               — Schema (sin url, va en prisma.config.ts)
├── prisma.config.ts            — Config de Prisma 7
├── dev.db                      — SQLite database
└── seed.ts                     — Datos de prueba
middleware.ts                   — Auth middleware (rutas protegidas)
```

## Modelos

- **User**: id, email, name, password, todos[], createdAt, updatedAt
- **Todo**: id, title, description?, status (PENDING/IN_PROGRESS/COMPLETED), priority (LOW/MEDIUM/HIGH/URGENT), dueDate?, userId, user, createdAt, updatedAt

## Comandos

```bash
npm run dev          # Servidor dev en localhost:3000
npm run build        # Build de producción
npm run db:seed      # Poblar BD con datos de demo
npm run db:reset     # Reset completo + seed
npm run db:studio    # Prisma Studio (GUI de la BD)
npx prisma migrate dev --name <nombre>  # Nueva migración
npx prisma generate  # Regenerar cliente Prisma
```

## Demo

```
Email:    demo@aido.dev
Password: password123
```

## Flujo de Auth

1. `middleware.ts` protege todas las rutas excepto `/login` y `/register`
2. Login usa `next-auth` con `Credentials` provider + bcryptjs
3. Session strategy: JWT
4. Token tiene `id` del usuario, session expone `session.user.id`

## Lecciones (Prisma 7)

- `PrismaClient` constructor error "needs non-empty options" → falta el adapter
- `unknown property datasourceUrl` → no existe en Prisma 7, usar adapter
- Adapter inicialización: `new PrismaBetterSqlite3({ url: "file:./ruta.db" })`
- Seed: usar `dotenv/config` import + path absoluto para la DB

## ⚠️ Notas Next.js 16

- `middleware.ts` está **deprecado** → usar `proxy.ts` en su lugar
- No pueden coexistir `middleware.ts` y `proxy.ts`
- El proxy corre en **Edge Runtime** — no puede importar módulos de Node
- Para auth en Edge: crear `auth.config.ts` separado (sin imports de DB)
- La lógica completa (con DB) va en `lib/auth.ts`

## Estructura de Auth (dos archivos)

```
lib/auth.config.ts  — Configuración para Edge/proxy (sin DB, solo JWT callbacks)
lib/auth.ts         — Configuración completa (con Credentials + DB)
```

El `proxy.ts` importa solo de `auth.config.ts`.
Las API routes y Server Components importan de `auth.ts`.

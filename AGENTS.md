# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

pnpm monorepo with 4 packages:

| Path | Description | Port |
|---|---|---|
| `apps/server` | Hono REST API | 4000 |
| `apps/web` | Next.js public website | 3000 |
| `apps/admin` | Next.js admin panel | 3001 |
| `packages/database` | Prisma schema, migrations, seed | — |

### Prerequisites

- **Docker** is required for PostgreSQL (`docker compose up -d` in project root).
- Node.js 22+, pnpm 9.15.0.

### Environment variables

Two `.env` files are needed (both gitignored):

1. Root `.env` — copy from `.env.example` (contains `DATABASE_URL`, `JWT_SECRET`, `API_PORT`, `NEXT_PUBLIC_API_URL`)
2. `packages/database/.env` — copy from `packages/database/.env.example` (contains `DATABASE_URL` for Prisma CLI)

### Running services

Standard commands are in root `package.json`. Key points:

- `pnpm dev` uses `--parallel` with a regex filter that requires individual `dev:server`, `dev:web`, `dev:admin` scripts. If `pnpm dev` fails with "None of the selected packages has a script", run each individually: `pnpm run dev:server`, `pnpm run dev:web`, `pnpm run dev:admin`.
- **The API server (`apps/server`) does NOT auto-load `.env`.** You must export the variables before starting it, e.g. `export $(grep -v '^#' .env | xargs) && pnpm run dev:server`, or set them in the shell session. The Next.js apps (`web`, `admin`) load `.env` automatically via Next.js built-in support.

### Database

- Start Postgres: `docker compose up -d`
- Migrations: `pnpm run db:migrate`
- Seed (creates admin user `admin@example.com` / `admin123`): `pnpm run db:seed`
- Reset: `pnpm run db:reset`

### Lint / Typecheck

- `pnpm run lint` — runs `next lint` on web/admin; server and database skip lint.
- `pnpm run typecheck` — runs `tsc --noEmit` across all packages.

### Docker in Cloud VM

Docker requires `fuse-overlayfs` storage driver and `iptables-legacy` in the Cloud VM environment. The daemon config is at `/etc/docker/daemon.json`. After installing Docker, run `sudo dockerd &` before `docker compose up -d`.

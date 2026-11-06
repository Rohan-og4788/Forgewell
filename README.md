# Forgewell

Forgewell is a developer workspace for managing projects, connecting GitHub repositories, getting AI-assisted code reviews, and building documentation, resumes, and portfolios.

## Getting started

### Requirements

- Node.js 22 or later
- npm
- A PostgreSQL database for the backend

### Install and configure

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and configure the database connection and any integrations you plan to use. See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for configuration details.
3. Generate the Prisma client:

   ```sh
   npm run prisma:generate
   ```

4. Start the backend and frontend in separate terminals:

   ```sh
   npm run server:dev
   ```

   ```sh
   npm run dev
   ```

The backend runs at `http://localhost:3001`; Vite prints the frontend URL when it starts.

## Development test login

For local development or automated testing, the backend provides a demo login at `GET` or `POST /api/auth/test-login`. It creates or reuses a sample account and sets an HTTP-only session cookie. The default role is `USER`; request an admin session with `GET /api/auth/test-login?role=ADMIN` or send `{"role":"ADMIN"}` in a `POST` request body.

The standard login form can also use these demo credentials:

| Account | Email | Password |
|---|---|---|
| User | `test@forgewell.ai` | `password123` |
| Admin | `admin@forgewell.ai` | `admin123` |

These demo login and auto-provisioning flows are disabled when `NODE_ENV=production`. To create the sample accounts ahead of time in a development database, run:

```sh
npm run seed:test-user
```

## Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend |
| `npm run server:dev` | Start the backend in development mode |
| `npm run build` | Typecheck and build the frontend |
| `npm run lint` | Run Oxlint |
| `npm run typecheck:server` | Typecheck the backend |
| `npm run test:backend` | Run backend verification tests |
| `npm run prisma:generate` | Generate the Prisma client |

For backend architecture, API endpoints, and environment configuration, see [BACKEND_SETUP.md](./BACKEND_SETUP.md).

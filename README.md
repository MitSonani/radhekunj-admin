# AURA Admin Panel

Administrative panel for the AURA e-commerce application.

This application talks only to the Backend API. It does not access PostgreSQL directly.

## Requirements

- Node.js 20+
- npm

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The admin panel runs on [http://localhost:3002](http://localhost:3002) by default so it does not collide with the Backend (`3000`) or User Panel (`3001`).

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (public). Example: `http://localhost:3000/api/v1` |

Do not put backend secrets, database credentials, or JWT signing keys in this application.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3002 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3002 |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript (`tsc --noEmit`) |

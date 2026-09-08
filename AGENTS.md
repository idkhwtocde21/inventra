# AGENTS.md

## Project Status

Greenfield — no code yet. Planning doc: `inventory_system_plan.md`.

## Architecture

- **Two separate apps:** Laravel API (backend) + React SPA (frontend via Vite)
- No Blade templates for app UI — keep backend/frontend concerns separated
- Local dev stack: XAMPP + MySQL

## Key Constraints

- Use **Laravel Sanctum SPA (cookie) mode**, not token-based auth
- Stateful domain: `localhost:5173` (Vite default port)
- Session driver: `cookie`, session domain: `localhost`
- Favor Laravel built-in features (notifications, form requests, resource controllers) over third-party packages

## Frontend Conventions

- React + Tailwind CSS — utility classes directly, extract components only when repetition demands it
- Icons: `lucide-react`
- Toasts: `react-hot-toast` or `sonner`
- Components colocated per page; shared UI in `components/ui/`
- Auth state via `React Context` (or Zustand)

## Dev Commands

- Backend: `php artisan serve --host=127.0.0.1 --port=8000`
- Frontend: `npm run dev` (from `frontend/`, port 5173)
- DB fresh (drops all tables + reseeds): `php artisan migrate:fresh --seed` (requires MySQL running via XAMPP)
- Seed demo data (idempotent): `php artisan db:seed`

## Environment Quirks

- MySQL runs from XAMPP (`D:\Xampp\mysql`). If `mysqld` won't start, launch with explicit paths:
  `mysqld --defaults-file=D:\Xampp\mysql\bin\my.ini --basedir=D:/Xampp/mysql --datadir=D:/Xampp/mysql/data`
- The `D:\Xampp\mysql\data` dir is on drive `D:` — binaries compiled with `c:\xampp` default fail without the explicit flags above.
- Frontend must hit `http://localhost:8000` (not `127.0.0.1:8000`) — `SESSION_DOMAIN=localhost` so the session cookie is only sent to the `localhost` host.
- After `POST /api/login`, Laravel regenerates the session and issues a **new** XSRF-TOKEN cookie. The frontend axios interceptor reads the cookie fresh on every request — don't cache it.

## Auth Flow

1. Call `GET /sanctum/csrf-cookie` before login/register
2. Axios instance must have `withCredentials: true`
3. `AuthContext` fetches `/api/user` on load to restore session
4. `PrivateRoute` wraps protected dashboard routes

## Notifications (Two Types)

- **Action toasts:** UI feedback only (success/error on CRUD)
- **System alerts:** Laravel database notifications, bell icon dropdown, poll every 45s. Skip WebSockets/Pusher/Reverb.
- Low-stock alert fires **only on item update** when quantity drops below `reorder_level` (not on create). Recipients: users with `role = admin`.

# Inventra — Inventory System

A local-first inventory management system built as two separate apps:

- **Backend:** Laravel API (Sanctum SPA cookie auth, MySQL)
- **Frontend:** React SPA (Vite + Tailwind CSS v4)

Track items, categories, stock levels, and low-stock alerts with a clean, responsive UI.

## Features

- **Auth** — register/login with Laravel Sanctum SPA (cookie) sessions; role-based display (`admin` / `staff`)
- **Dashboard** — animated stat cards (total items, low stock, categories, low stock value), low-stock alert banner, category breakdown
- **Inventory** — full item CRUD, search by name/SKU, server-side pagination, low-stock highlighting
- **Categories** — create/delete categories; guarded against deleting categories still in use
- **Notifications** — Laravel database notifications in a navbar dropdown (polled every 45s), mark-one/mark-all read

### Low-stock alert rules
- Fires **only on item update** when quantity drops to/below `reorder_level` (not on create)
- Recipients: users with `role = admin`

## Tech Stack

| Layer    | Tool |
|----------|------|
| Backend  | Laravel 13, MySQL, Laravel Sanctum |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios |
| Icons    | lucide-react |
| Toasts   | sonner |

## Prerequisites

- PHP 8.4+
- Composer
- Node.js 20+
- MySQL (via XAMPP recommended on Windows)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/idkhwtocde21/inventra.git
cd inventra

composer install
cd frontend && npm install && cd ..
```

### 2. Configure backend

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` for your environment:

```env
DB_CONNECTION=mysql
DB_DATABASE=inventra
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

### 3. Create database & seed

```bash
php artisan migrate --seed
```

Seeds demo users, categories, and items (idempotent — safe to re-run with `php artisan db:seed`).

> **XAMPP quirk (Windows):** if MySQL on the `D:` drive fails to start, launch it explicitly:
> `mysqld --defaults-file=D:\Xampp\mysql\bin\my.ini --basedir=D:/Xampp/mysql --datadir=D:/Xampp/mysql/data`

### 4. Run locally

```bash
# Terminal 1 — backend: http://localhost:8000
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — frontend: http://localhost:5173
cd frontend && npm run dev
```

Open **`http://localhost:5173`** (the frontend must hit `localhost`, not `127.0.0.1`, so the session cookie is sent).

## Demo Accounts

| Role  | Email                 | Password     |
|-------|-----------------------|--------------|
| Admin | `admin@inventory.test` | `password123` |
| Admin | `admin@test.com`       | `password123` |
| Staff | `test@example.com`     | `password`    |

## How Auth Works

1. Frontend calls `GET /sanctum/csrf-cookie` before login/register
2. Axios instance sends requests with `withCredentials: true`
3. After login Laravel regenerates the session and issues a **new** XSRF-TOKEN cookie — the axios interceptor reads it fresh on every request (never cached)
4. `AuthContext` restores the session via `GET /api/user` on app load; `PrivateRoute` guards all dashboard routes

## API Overview

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/api/register`             | Create account (role: staff)       |
| POST   | `/api/login`                | Sign in                            |
| POST   | `/api/logout`               | Sign out                           |
| GET    | `/api/user`                 | Current user                       |
| GET    | `/api/items`                | List items (search, filter, paginate) |
| POST   | `/api/items`                | Create item                        |
| GET    | `/api/items/{item}`         | Show item                          |
| PUT    | `/api/items/{item}`         | Update item                        |
| DELETE | `/api/items/{item}`         | Delete item                        |
| GET    | `/api/categories`           | List categories (with item counts) |
| POST   | `/api/categories`           | Create category                    |
| DELETE | `/api/categories/{category}`| Delete category (409 if in use)    |
| GET    | `/api/notifications`        | List notifications + unread count  |
| PATCH  | `/api/notifications/{n}/read` | Mark one read                    |
| PATCH  | `/api/notifications/read-all` | Mark all read                    |

Item list supports `?search=`, `?category_id=N`, `?low_stock=1`, `?page=N`, `?per_page=N`.

## Project Structure

```
├── app/                    # Laravel backend
│   ├── Http/Controllers/Api/
│   ├── Http/Requests/Api/
│   ├── Models/
│   └── Notifications/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/api.php
├── frontend/               # React SPA
│   └── src/
│       ├── components/     # layout, auth, ui (colocated)
│       ├── pages/          # Login, Register, Dashboard, Inventory, Categories
│       ├── services/       # axios API clients
│       ├── context/        # AuthContext
│       └── hooks/
└── .env.example
```

## Notes

- `SESSION_DOMAIN=localhost` means the backend must be reached as `http://localhost:8000`.
- The low-stock alert notification type is `App\Notifications\LowStockNotification` (database channel).
- This is a self-project; `admin@test.com` is an extra demo admin used during development.
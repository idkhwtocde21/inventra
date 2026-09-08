# Inventory Management System — Project Reference

## 1. Overview

A local web-based inventory management system with authentication (login/signup) and a dashboard interface for managing inventory items, categories, and stock alerts.

---

## 2. Tech Stack

| Layer                | Choice                         | Notes                                           |
| -------------------- | ------------------------------ | ----------------------------------------------- |
| Frontend             | React (Vite) + Tailwind CSS    | SPA, no CRA                                     |
| Backend              | Laravel (API-only)             | REST API, Eloquent ORM                          |
| Auth                 | Laravel Sanctum                | SPA cookie-based auth                           |
| Database             | MySQL or PostgreSQL            | MySQL recommended for local dev (XAMPP/Laragon) |
| State Management     | React Context (or Zustand)     | Auth state, global UI state                     |
| HTTP Client          | Axios                          | With base instance + interceptors               |
| Toast Notifications  | `react-hot-toast` or `sonner`  | Action feedback (success/error)                 |
| System Notifications | Laravel database notifications | Low-stock alerts, bell dropdown                 |
| Icons                | `lucide-react`                 | Consistent icon set                             |
| Routing              | React Router v6                | Protected route wrapper for dashboard           |

**Architecture note:** Run Laravel and React as two separate apps (Laravel API + React SPA). Do not mix Blade with React components.

---

## 3. Folder Structure

### Backend (Laravel)

```
app/
  Http/
    Controllers/
      Api/
        AuthController.php
        ItemController.php
        CategoryController.php
        NotificationController.php
    Requests/
      StoreItemRequest.php
      UpdateItemRequest.php
  Models/
    User.php
    Item.php
    Category.php
routes/
  api.php
database/
  migrations/
  seeders/
```

### Frontend (React)

```
src/
  components/
    ui/            # Button, Input, Modal, Toast wrapper
    layout/        # Sidebar, Navbar, DashboardLayout
  pages/
    Login.jsx
    Signup.jsx
    Dashboard.jsx
    Inventory.jsx
    Categories.jsx
  context/
    AuthContext.jsx
  services/
    api.js           # axios instance, base URL, interceptors
    authService.js
    itemService.js
    categoryService.js
    notificationService.js
  hooks/
    useAuth.js
  routes/
    PrivateRoute.jsx
  App.jsx
  main.jsx
```

---

## 4. Database Schema

### users

| Field      | Type                  | Notes                  |
| ---------- | --------------------- | ---------------------- |
| id         | bigint, PK            |                        |
| name       | string                |                        |
| email      | string, unique        |                        |
| password   | string (hashed)       |                        |
| role       | enum('admin','staff') | default 'staff'        |
| timestamps |                       | created_at, updated_at |

### categories

| Field      | Type       | Notes |
| ---------- | ---------- | ----- |
| id         | bigint, PK |       |
| name       | string     |       |
| timestamps |            |       |

### items

| Field         | Type               | Notes                         |
| ------------- | ------------------ | ----------------------------- |
| id            | bigint, PK         |                               |
| name          | string             |                               |
| sku           | string, unique     |                               |
| category_id   | FK → categories.id |                               |
| quantity      | integer            | default 0                     |
| unit_price    | decimal(10,2)      |                               |
| reorder_level | integer            | threshold for low-stock alert |
| image_path    | string, nullable   |                               |
| timestamps    |                    |                               |

### notifications (Laravel built-in)

Generated via:

```bash
php artisan notifications:table
php artisan migrate
```

Used for low-stock alerts and other system notifications.

---

## 5. Auth Flow (Laravel Sanctum — SPA mode)

1. Configure `.env`:
   - `SANCTUM_STATEFUL_DOMAINS=localhost:5173` (or your Vite dev port)
   - `SESSION_DRIVER=cookie`
   - `SESSION_DOMAIN=localhost`
2. Install Sanctum, publish config, run migrations.
3. Enable `EnsureFrontendRequestsAreStateful` middleware on API routes.
4. Endpoints:
   - `GET /sanctum/csrf-cookie` — call before login/register
   - `POST /api/register`
   - `POST /api/login`
   - `POST /api/logout`
   - `GET /api/user` — current authenticated user
5. React side:
   - Axios instance with `withCredentials: true`
   - `AuthContext` fetches `/api/user` on load to determine session state
   - `PrivateRoute` component redirects to `/login` if unauthenticated

---

## 6. Notification System

Two distinct types — do not conflate:

### A. Action Toasts (UI feedback)

- Library: `react-hot-toast` or `sonner`
- Triggers: successful/failed CRUD actions, login/signup errors
- Example: "Item added successfully", "Invalid credentials"

### B. System Alerts (persistent, backend-driven)

- Backed by Laravel's database `notifications` table
- Displayed via a bell icon in the navbar with a dropdown list
- Trigger example: item quantity ≤ reorder_level → create notification for admin users
- For local dev: poll `GET /api/notifications` every 30–60s using `setInterval`
- Skip WebSockets/Pusher/Reverb unless real-time push is specifically needed — unnecessary complexity for a local project

---

## 7. Icons & Branding

- **Icon library:** `lucide-react`
- **Suggested icons:**
  - `Package`, `Boxes` — items/inventory
  - `Warehouse` — general branding
  - `ClipboardList` — stock lists/reports
  - `LayoutDashboard` — dashboard nav
  - `Bell` — notifications
  - `LogOut` — logout action
  - `Search` — search bar
  - `PlusCircle` — add item/category
  - `AlertTriangle` — low-stock warning
  - `Tag` — categories

- **Logo suggestion:** Simple wordmark + `Package` or `Boxes` icon inside a rounded solid-color square. Keep it minimal for a local/personal project — don't over-invest in branding before core functionality works.

---

## 8. API Endpoints (planned)

| Method    | Endpoint                     | Description                         |
| --------- | ---------------------------- | ----------------------------------- |
| GET       | /sanctum/csrf-cookie         | CSRF cookie for SPA auth            |
| POST      | /api/register                | Create new user                     |
| POST      | /api/login                   | Authenticate user                   |
| POST      | /api/logout                  | End session                         |
| GET       | /api/user                    | Get current authenticated user      |
| GET       | /api/items                   | List items (paginated, filterable)  |
| POST      | /api/items                   | Create item                         |
| GET       | /api/items/{id}              | Get single item                     |
| PUT/PATCH | /api/items/{id}              | Update item                         |
| DELETE    | /api/items/{id}              | Delete item                         |
| GET       | /api/categories              | List categories                     |
| POST      | /api/categories              | Create category                     |
| DELETE    | /api/categories/{id}         | Delete category                     |
| GET       | /api/notifications           | List notifications for current user |
| PATCH     | /api/notifications/{id}/read | Mark as read                        |

---

## 9. Suggested Build Order

1. Laravel API scaffolding: migrations, models, Sanctum auth
2. React: Login/Signup pages wired to auth endpoints
3. Dashboard shell: Sidebar, Navbar, protected routing (`PrivateRoute`)
4. Items CRUD (backend + frontend)
5. Categories CRUD
6. Toast notifications on all CRUD actions
7. Low-stock alert system (bell dropdown + backend trigger)
8. Polish: search, filters, pagination, sorting

---

## 10. Notes for AI Agent Assistance

- Keep backend and frontend concerns separated — no Blade templates for the app UI.
- Use Sanctum's SPA (cookie) mode, not token-based API auth, for this project.
- Favor Laravel's built-in features (notifications, form requests, resource controllers) over third-party packages where possible.
- Keep components small and colocate UI logic per page; shared UI (buttons, modals, inputs) goes in `components/ui/`.
- Tailwind: use utility classes directly; only extract components when repetition becomes unmanageable.

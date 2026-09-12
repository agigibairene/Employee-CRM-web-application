# Personnel — Employee CRM Web Application

Personnel is a modern, full-stack Employee Customer Relationship Management (CRM) and HR management platform. It enables organizations to manage employee lifecycles, department hierarchies, leave requests, and activity tracking with role-based access control and an editorial-grade user experience.

---

## Architecture Overview

```
                          ┌────────────────────────┐
                          │   React 19 Frontend    │
                          │ (Vite + Tailwind v4 +  │
                          │   Redux Toolkit + RTK) │
                          └───────────┬────────────┘
                                      │
                         REST API via JWT Bearer Tokens
                                      │
                          ┌───────────▼────────────┐
                          │     Django 5.2 API     │
                          │ (DRF + SimpleJWT + uv) │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │     SQLite Database    │
                          │ (or PostgreSQL via DB) │
                          └────────────────────────┘
```

---

## Features

### 🔐 Authentication & Onboarding
- **JWT Authentication**: Secure login flow utilizing access and refresh tokens stored and managed via Redux Toolkit.
- **Employee Invitation Workflow**: HR Admins provision new employees, automatically generating a secure one-time activation token and dispatching an invitation.
- **Account Activation**: Self-service onboarding screen (`/activate?token=...`) allowing employees to set their initial password.
- **Current User Profile (`/auth/me/`)**: Instant retrieval of user role (`HR_ADMIN` vs `EMPLOYEE`), full name, email, and employee record association.

### 🧭 Navigation & App Shell
- **Responsive Sidebar**:
  - **Desktop**: Persistent, left-docked sidebar (`w-64`) with brand identity, structured navigation, active link highlights, and user profile card.
  - **Mobile**: Sticky top header with hamburger trigger and slide-out overlay drawer with auto-close on link navigation.
- **User Session Card**: Real-time display of user's monogram avatar, full name, role badge (`Admin` or `Staff`), and a one-click Sign Out action.

### 🛡️ Protected Routing & Route Guards
- **Centralized Protection (`<ProtectedRoute />`)**: Guards private routes (`/`, `/dashboard`, `/employees`, `/departments`, `/leave`).
- **Unauthenticated Redirects**: Unauthenticated visits are redirected to `/login`.
- **Guest Navigation Handling**: Authenticated users visiting `/login` are automatically redirected to `/dashboard`.
- **Index & Wildcard Handling**: Root `/` cleanly redirects to `/dashboard`, and unmapped routes (`*`) are routed back into the protected dashboard flow.

### 📊 Dashboard
- **Key Performance Indicators (KPIs)**: Total Employees, Active Staff, Employees on Leave, and Department Counts.
- **Recent Activity Feed**: Real-time chronological audit trail of organizational changes (status updates, new hires, leave requests).

### 👥 Employee Management
- **Directory**: Real-time search by name, email, or job title with custom debouncing. Filterable by department and employment status (`ACTIVE`, `ON_LEAVE`, `INACTIVE`).
- **Add Employee**: Modal for HR Admins to create new employee records and trigger invitation emails.
- **Detailed Employee Profile (`/employees/:id`)**: Comprehensive profile displaying contact info, start date, department, reporting manager, leave request history, and recent activity.
- **Employee Deactivation**: Safe deactivation workflow with confirmation dialog.

### 🏢 Department Management
- **Department Cards**: View department descriptions and active employee counts.
- **Add / Edit Department**: Dynamic modal for creating and updating department information.
- **Deletion Protection**: Built-in backend safeguards preventing deletion of departments that still contain assigned employees.

### 🗓️ Leave Management
- **Leave Requests**: Employees can submit leave requests specifying start/end dates and reasons, with client-side and server-side date validation.
- **HR Review Workflow**: HR Admins can review, approve, or reject pending leave requests.

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict checking and `verbatimModuleSyntax`
- **State Management & Data Fetching**: [Redux Toolkit](https://redux-toolkit.js.org/) & RTK Query
- **Routing**: [React Router v7](https://reactrouter.com/) (Data Routers & Layout Outlets)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS theme variables
- **Typography**: IBM Plex Sans & IBM Plex Serif
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

### Backend
- **Framework**: [Django 5.2](https://www.djangoproject.com/) & [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- **Authentication**: `djangorestframework-simplejwt`
- **Filtering & CORS**: `django-filter`, `django-cors-headers`
- **API Documentation**: `drf-spectacular` (OpenAPI 3.0, Swagger UI, ReDoc)
- **Package & Environment Manager**: [uv](https://docs.astral.sh/uv/)

---

## Project Structure

```
Employee-CRM-web-application/
├── backend/                        # Django REST Framework Backend
│   ├── auth_app/                   # Authentication & Employee Invitation App
│   │   ├── models.py               # Custom User & InvitationToken models
│   │   ├── serializers.py          # Auth serializers
│   │   ├── urls.py                 # /auth/ endpoints (login, refresh, me, invite)
│   │   └── views.py                # Token & invitation views
│   ├── backend/                    # Core project configuration
│   │   ├── settings.py             # Django settings
│   │   └── urls.py                 # Root URL configuration & Swagger endpoints
│   ├── employee/                   # Core CRM Employee App
│   │   ├── models.py               # Employee, Department, LeaveRequest, Activity
│   │   ├── serializers.py          # CRM serializers
│   │   ├── urls.py                 # /api/ endpoints (employees, departments, leave)
│   │   └── views.py                # CRM ViewSets & DashboardView
│   ├── pyproject.toml              # Python dependencies (managed via uv)
│   └── manage.py
│
├── frontend/                       # React 19 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/             # Page components & modals
│   │   │   ├── departments/        # Department pages & modal dialogs
│   │   │   ├── leave/              # Leave management & request modal
│   │   │   ├── Activate.tsx        # Account activation page
│   │   │   ├── AddEmployeeModal.tsx# Add employee dialog
│   │   │   ├── AppShell.tsx        # Main application layout
│   │   │   ├── DashboardPage.tsx   # Dashboard metrics and timeline
│   │   │   ├── EmployeeProfilePage.tsx # Individual employee profile
│   │   │   ├── EmployeesPage.tsx   # Employee directory
│   │   │   ├── Login.tsx           # Login page
│   │   │   └── Sidebar.tsx         # Responsive sidebar navigation
│   │   ├── layout/
│   │   │   └── ProtectedRoute.tsx  # Authentication guard component
│   │   ├── redux/                  # Redux store & RTK Query API slices
│   │   │   ├── apiSlice.ts         # Base RTK Query slice (/api)
│   │   │   ├── authApi.ts          # Auth & user API queries (/auth)
│   │   │   ├── authSlice.tsx       # Auth token persistence in localStorage
│   │   │   ├── dashboardApi.ts     # Dashboard stats query
│   │   │   ├── departmentsApi.ts   # Departments CRUD endpoints
│   │   │   ├── employeeApi.ts      # Employees CRUD endpoints
│   │   │   ├── leaveApi.ts         # Leave management endpoints
│   │   │   └── store.ts            # Root Redux store
│   │   ├── ui/                     # Reusable UI primitives (Button, Modal, etc.)
│   │   ├── App.tsx
│   │   ├── main.tsx                # App bootstrap & RouterProvider configuration
│   │   └── types.ts                # TypeScript data interfaces
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Python**: 3.11 or higher
- **uv**: Fast Python package manager ([installation instructions](https://docs.astral.sh/uv/getting-started/installation/))
- **Node.js**: 20+ and [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies using `uv`**:
   ```bash
   uv sync
   ```

3. **Apply database migrations**:
   ```bash
   uv run python manage.py migrate
   ```

4. **Create an initial administrator (HR Admin)**:
   ```bash
   uv run python manage.py createsuperuser
   ```

5. **Start the Django development server**:
   ```bash
   uv run python manage.py runserver 8000
   ```
   The backend API will be running at `http://localhost:8000`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies with `pnpm`**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in `frontend/` if connecting to non-default hosts:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/auth
   VITE_API_BASE_URL_ROOT=http://localhost:8000/api
   ```

4. **Start the Vite development server**:
   ```bash
   pnpm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## API Reference & Interactive Documentation

Once the backend is running, explore interactive Swagger and ReDoc documentation:

- **Swagger UI**: [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)
- **ReDoc**: [http://localhost:8000/api/schema/redoc/](http://localhost:8000/api/schema/redoc/)
- **OpenAPI Schema (JSON/YAML)**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login/` | Obtain JWT access and refresh token pair | No |
| `POST` | `/auth/login/refresh/` | Refresh JWT access token | No |
| `POST` | `/auth/invite/accept/` | Activate account with email invite token | No |
| `GET` | `/auth/me/` | Retrieve current authenticated user profile | Yes (Bearer) |
| `POST` | `/auth/employees/create/` | Provision employee and send activation invite | Yes (HR Admin) |
| `GET` | `/api/dashboard/` | Retrieve KPI metrics and recent activities | Yes (Bearer) |
| `GET`, `POST` | `/api/employees/` | List and create employees | Yes (Bearer) |
| `GET`, `PUT`, `DELETE` | `/api/employees/{id}/` | Retrieve, update, or deactivate employee | Yes (Bearer) |
| `GET`, `POST` | `/api/departments/` | List and create departments | Yes (Bearer) |
| `GET`, `PUT`, `DELETE` | `/api/departments/{id}/` | Retrieve, update, or delete department | Yes (HR Admin) |
| `GET`, `POST` | `/api/leave-requests/` | List or submit leave requests | Yes (Bearer) |
| `POST` | `/api/leave-requests/{id}/approve/` | Approve a pending leave request | Yes (HR Admin) |
| `POST` | `/api/leave-requests/{id}/reject/` | Reject a pending leave request | Yes (HR Admin) |

---

## Verification & Quality Assurance

To ensure code quality and prevent regressions:

### Frontend
- **Type Checking & Production Build**:
  ```bash
  cd frontend
  pnpm run build
  ```
- **Linting (ESLint 10)**:
  ```bash
  cd frontend
  pnpm run lint
  ```

### Backend
- **Django Configuration Check**:
  ```bash
  cd backend
  uv run python manage.py check
  ```
- **Automated Tests**:
  ```bash
  cd backend
  uv run python manage.py test
  ```

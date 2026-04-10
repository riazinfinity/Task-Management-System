# TaskFlow — Task Management System

A clean, intuitive task management system built to help teams organize daily work, track progress, and stay productive. This project was completed as a practical assessment for the **Junior Full Stack Developer** position at **Qtec Solution Limited**.

---

## Features

- **Full CRUD Operations** — Create, read, update, and delete tasks through a responsive user interface
- **Task Status Tracking** — Three-stage workflow: Pending → In Progress → Completed with one-click status transitions
- **Priority Management** — Assign Low, Medium, or High priority to tasks for better organization
- **Due Date Tracking** — Set due dates with automatic overdue detection and visual warnings
- **Search and Filtering** — Real-time search across task titles and descriptions, filter by status and priority
- **Dashboard Statistics** — Instant overview of total, pending, in-progress, and completed task counts
- **Form Validation** — Client-side and server-side validation for all user inputs
- **Responsive Design** — Works on desktop, tablet, and mobile devices
- **Confirmation Dialogs** — Delete operations require explicit confirmation to prevent accidental data loss
- **Toast Notifications** — Real-time feedback for every action (create, update, delete, status change)
- **Loading and Empty States** — Skeleton placeholders while loading and helpful messages when no tasks exist

---

## Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React framework with server-side API routes |
| Language | TypeScript 5 | Static type checking across frontend and backend |
| Database | SQLite via Prisma ORM | Lightweight file-based relational database, zero configuration |
| ORM | Prisma 6 | Type-safe database queries with auto-generated TypeScript client |
| Styling | Tailwind CSS 4 | Utility-first CSS framework for rapid UI development |
| UI Components | shadcn/ui | Accessible, composable components built on Radix UI primitives |
| Icons | Lucide React | Consistent, lightweight SVG icon library |
| Date Handling | date-fns | Modern date formatting and comparison functions |
| Notifications | Sonner | Elegant toast notification system for user feedback |
| Testing | Vitest | Fast test runner for API integration tests |

---

## Project Structure

```
taskflow/
├── prisma/
│   └── schema.prisma                 # Database schema (Task model)
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with metadata and fonts
│   │   ├── page.tsx                  # Main application page (single-page app)
│   │   ├── globals.css               # Global Tailwind styles
│   │   └── api/tasks/                # Backend API routes
│   │       ├── route.ts              # GET (list with filters) & POST (create)
│   │       └── [id]/
│   │           ├── route.ts          # GET (single), PUT (update), DELETE
│   │           └── status/
│   │               └── route.ts      # PATCH (status transition only)
│   ├── components/
│   │   ├── TaskCard.tsx              # Individual task card with actions
│   │   ├── TaskForm.tsx              # Create/Edit task dialog with validation
│   │   └── ui/                       # shadcn/ui component library (50+ components)
│   ├── hooks/
│   │   └── useTasks.ts               # Custom hook for all task API operations
│   └── lib/
│       ├── db.ts                     # Prisma client singleton
│       └── utils.ts                  # Utility functions
├── __tests__/
│   └── api-routes.test.ts            # 25 API integration tests
├── .env                              # Environment variables (DATABASE_URL)
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── vitest.config.ts                  # Test runner configuration
```

---

## Setup Instructions

### Prerequisites

Make sure you have **Node.js** installed. Download it from [https://nodejs.org](https://nodejs.org) (version 18 or higher).

Verify your installation by running this in your terminal:

```bash
node -v
```

You should see a version number like `v20.x.x` or `v22.x.x`.

### Step 1: Get the Code

If you cloned from GitHub:

```bash
git clone <repository-url>
cd taskflow
```

If you downloaded the ZIP file, extract it and open the folder in your terminal.

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all required packages. It may take 1-2 minutes depending on your internet speed.

### Step 3: Configure the Database

Open the `.env` file in the project root and update the `DATABASE_URL` to match your local path:

**On Windows:**
```
DATABASE_URL=file:./db/custom.db
```

**On Mac/Linux:**
```
DATABASE_URL=file:./db/custom.db
```

Then push the schema to create the database:

```bash
npx prisma db push
```

You should see:
```
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### Step 4: Start the Server

```bash
npm run dev
```

Wait until you see:
```
  ▲ Next.js 16.x.x
  - Local:    http://localhost:3000
  - Ready in ~2s
```

### Step 5: Open in Browser

Go to **http://localhost:3000** in your browser. The TaskFlow app is ready to use.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server on port 3000 |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run all 25 integration tests |
| `npm run test:watch` | Run tests in watch mode (re-runs on file changes) |
| `npx prisma db push` | Sync the database schema |
| `npx prisma db generate` | Regenerate the Prisma TypeScript client |
| `npx prisma studio` | Open Prisma Studio (visual database browser) at localhost:5555 |

---

## API Endpoints

All endpoints accept and return JSON. The base URL is `http://localhost:3000`.

### List Tasks

```
GET /api/tasks
```

**Query Parameters** (all optional):

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `status` | string | `pending` | Filter by status: `pending`, `in_progress`, `completed` |
| `priority` | string | `high` | Filter by priority: `low`, `medium`, `high` |
| `search` | string | `design` | Search in title and description |

**Example:**
```bash
curl http://localhost:3000/api/tasks?status=pending&priority=high
```

### Create a Task

```
POST /api/tasks
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Design homepage wireframe",
  "description": "Create low-fidelity wireframes for the landing page",
  "priority": "high",
  "dueDate": "2026-04-15"
}
```

**Validation Rules:**

| Field | Required | Constraints |
|-------|----------|-------------|
| `title` | Yes | 1-255 characters, whitespace is trimmed |
| `description` | No | Any string, trimmed |
| `priority` | No | Must be `low`, `medium`, or `high`. Defaults to `medium` |
| `dueDate` | No | ISO date string (e.g. `2026-04-15`) |

**Response (201 Created):**
```json
{
  "id": "clv1abcde1234",
  "title": "Design homepage wireframe",
  "description": "Create low-fidelity wireframes for the landing page",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-04-15T00:00:00.000Z",
  "createdAt": "2026-04-10T10:00:00.000Z",
  "updatedAt": "2026-04-10T10:00:00.000Z"
}
```

### Get a Single Task

```
GET /api/tasks/:id
```

Returns `404` with `{ "error": "Task not found" }` if the ID does not exist.

### Update a Task

```
PUT /api/tasks/:id
Content-Type: application/json
```

**Request Body** (all fields optional — only provided fields are updated):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "low",
  "dueDate": "2026-04-20"
}
```

Returns the updated task. Returns `404` if the task does not exist.

### Delete a Task

```
DELETE /api/tasks/:id
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

Returns `404` if the task does not exist.

### Update Task Status

```
PATCH /api/tasks/:id/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

Valid status values: `pending`, `in_progress`, `completed`.

**Why a separate endpoint?** Status changes happen frequently via one-click buttons in the UI. This endpoint only sends the status field, keeping the payload minimal and the operation semantically clear.

---

## Database Schema

The system uses a single `Task` table:

```
Task
├── id          String    @id @default(cuid())   Unique identifier
├── title       String                            Task name (required, max 255 chars)
├── description String?                           Optional details
├── status      String    @default("pending")     "pending" | "in_progress" | "completed"
├── priority    String    @default("medium")      "low" | "medium" | "high"
├── dueDate     DateTime?                         Optional deadline
├── createdAt   DateTime  @default(now())         Auto-set on creation
└── updatedAt   DateTime  @updatedAt              Auto-set on any change
```

---

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

The test suite contains **25 integration tests** that run against the live development server, covering the full request lifecycle from HTTP request through database operations.

| Endpoint | Tests | What is Covered |
|----------|-------|-----------------|
| `GET /api/tasks` | 4 | Empty list, status filter, priority filter, search |
| `POST /api/tasks` | 8 | Valid creation, all fields, missing title, empty title, title too long, invalid priority, default status, whitespace trimming |
| `GET /api/tasks/:id` | 2 | Fetch by ID, 404 for non-existent task |
| `PUT /api/tasks/:id` | 4 | Update title, update priority, clear description, 404 |
| `PATCH /api/tasks/:id/status` | 4 | Status transitions, invalid status value, 404 |
| `DELETE /api/tasks/:id` | 2 | Successful deletion with verification, 404 |
| Full Lifecycle | 1 | Create → Verify → Update → Status change → Delete → Verify deleted |

### Testing Approach

I chose **integration tests over unit tests** because:

1. **End-to-end validation**: Tests hit the actual HTTP endpoints, verifying routing, request parsing, validation logic, database operations, and response formatting all work together correctly.
2. **Higher confidence**: A passing integration test proves the feature works as a whole, not just that individual functions return expected values in isolation.
3. **Edge case coverage**: Each validation rule has a dedicated test case (empty title, too-long title, invalid priority, invalid status) to ensure the API correctly rejects bad input with appropriate error messages.
4. **Lifecycle test**: One test walks through the entire create → update → status change → delete flow, proving the system works end-to-end.

---

## Assumptions and Design Decisions

### Why Next.js Instead of Laravel

The original assessment was for a Laravel (PHP) developer role. I chose Next.js with TypeScript because it enables a single-language fullstack approach where both frontend and backend are written in TypeScript. The App Router API routes provide the same RESTful patterns as Laravel controllers, and Prisma ORM offers the same type-safe database access as Laravel's Eloquent. TypeScript provides compile-time type safety that catches bugs before runtime.

### Why SQLite

SQLite requires zero configuration — no database server installation is needed. The database is stored as a single file (`db/custom.db`) that is created automatically. This is ideal for a demonstration project while using the exact same ORM patterns (Prisma) that would apply to PostgreSQL or MySQL in a production environment.

### Why No Authentication

The assessment focused on task management functionality. Adding authentication (login, registration, protected routes) would add complexity without demonstrating additional task management competence. NextAuth.js is already available in the project dependencies and could be added in a few hours if needed.

### Why a Separate Status Endpoint

Status changes are the most frequent operation in a task management app — users click buttons to move tasks through the workflow constantly. A dedicated `PATCH /api/tasks/:id/status` endpoint keeps the payload minimal (only `{ "status": "completed" }`) instead of sending the entire task object. It also separates concerns: general updates go to `PUT`, status transitions go to `PATCH /status`.

### Why a Custom React Hook

The `useTasks` hook centralizes all API communication in one place. Components never make raw `fetch` calls directly. This is equivalent to a service/repository layer in traditional MVC architecture — it provides a clean API for the UI, handles loading and error states automatically, and re-fetches the task list after every mutation to keep the UI in sync with the database.

### Frontend UX Decisions

- **Arrow-based status navigation**: Left and right arrows on each task card let users move tasks through Pending → In Progress → Completed. This is faster and more intuitive than opening a dropdown menu.
- **Overdue detection**: Tasks past their due date (that are not yet completed) automatically show a red warning badge. This happens without any manual input from the user.
- **Completed task styling**: Completed tasks receive reduced opacity and a strikethrough title, following the universal visual convention for "done" items.
- **Dashboard stats**: Four metric cards at the top of the page provide an instant overview of the task breakdown without requiring the user to count or scroll.
- **Skeleton loading**: While tasks are being fetched from the API, placeholder shapes are displayed instead of a blank screen or a spinning loader. This reduces perceived loading time.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| `prisma: command not found` | Use `npx prisma` instead of `prisma` |
| Port 3000 is already in use | The server will automatically use port 3001 instead |
| White screen in browser | Check the terminal for error messages and make sure `npm run dev` completed without errors |
| Database errors | Delete the `db/` folder and run `npx prisma db push` again |
| Tests fail | Make sure the development server is running on port 3000 before running `npm test` |
| `npm install` is slow | Try `npm install --prefer-offline` or switch to `bun install` (faster) |

# 🚀 Modern SaaS CRM

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

A full-stack, production-ready Customer Relationship Management (CRM) platform designed for modern sales teams. Built with a robust **Next.js 15** frontend and an **Express/Prisma** backend, this application provides a seamless, lightning-fast experience for managing leads, tracking interactions, and overseeing workspace activity.

## ✨ Features

- **🔒 Secure Authentication:** JWT-based authentication with role-based access control (Admin & Staff).
- **📊 Interactive Dashboard:** Real-time metrics overview and a chronological timeline of recent workspace activity.
- **🎯 Leads Management:** Track, filter, and manage sales pipelines from creation to close.
- **💬 Lead Interactions:** Log calls, emails, and meetings. Maintain a complete history of customer touchpoints.
- **✅ Follow-Up Tasks:** Schedule actionable tasks to ensure leads never slip through the cracks.
- **👥 User Management:** Admins can seamlessly invite and manage staff members within the workspace.
- **⚙️ Workspace Settings:** Highly customizable settings including global profile localization and dynamic lead routing sources.
- **📱 Responsive Layout:** A beautiful, responsive SaaS shell built with Tailwind CSS and `shadcn/ui`.

## 📸 Screenshots

*Screenshots will be added after production deployment.*

- Dashboard Overview
- Leads Management
- User Management
- Workspace Settings

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, `shadcn/ui`
- **State/Data Fetching:** React Query (TanStack Query), Axios
- **Form Handling:** `react-hook-form`, Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (Hosted on Neon)
- **Security:** Helmet, `express-rate-limit`, bcrypt, JWT

## 🏗️ Architecture Overview

The application follows a decoupled client-server architecture:
- The **Frontend** acts as an SPA using Next.js App Router for optimal routing and layout persistence. Data fetching is heavily optimized and cached using React Query.
- The **Backend** is a RESTful Express API. It acts as the gatekeeper, strictly enforcing tenant isolation (workspace-level data partitioning) and authorization rules before communicating with the PostgreSQL database via Prisma ORM.

## 📂 Folder Structure

```text
saas-crm/
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages & layouts
│   │   ├── components/         # Global shared components (shadcn/ui, layout)
│   │   ├── features/           # Domain-driven feature modules (auth, leads, dashboard, etc.)
│   │   └── lib/                # Utility functions and API configurations
│   └── package.json
└── server/
    ├── prisma/                 # Prisma schema and migrations
    ├── src/
    │   ├── controllers/        # Route logic and HTTP responses
    │   ├── middlewares/        # Auth, Role, Error, and Validation middlewares
    │   ├── routes/             # API route definitions
    │   ├── services/           # Business logic and database operations
    │   └── validations/        # Zod schema validation rules
    └── package.json
```

## 🗄️ Database Design Summary

The PostgreSQL database utilizes a multi-tenant structure anchored by the `Workspace` entity:
- **Workspace:** The root entity for data isolation.
- **User:** Belongs to a workspace; has distinct roles (`ADMIN`, `STAFF`).
- **Lead:** The core entity tracked through various statuses (`NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`).
- **Interaction:** One-to-many relationship with Leads; tracks communication history.
- **Task:** One-to-many relationship with Leads; actionable reminders.
- **LeadSource:** Configurable data points indicating where leads originated.

## 🔌 API Overview

All API endpoints are prefixed with `/api/v1` and protected by JWT Bearer tokens (except for auth entry points).

- `POST  /auth/signup` - Register a new workspace and admin user.
- `POST  /auth/login` - Authenticate and receive JWT.
- `GET   /dashboard/metrics` - Fetch aggregate workspace statistics.
- `GET   /leads` - Fetch paginated and filtered leads.
- `POST  /leads/:id/interactions` - Log a new interaction on a lead.
- `GET   /users` - Fetch workspace staff (Admin only).
- `PATCH /settings/profile` - Update workspace configuration.

## 🚀 Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Local or Cloud like Neon)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VarunsLand/saas-crm.git
   cd saas-crm
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## 🔐 Environment Variables Setup

You will need to create two `.env` files:

**1. `server/.env`**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN="24h"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

**2. `frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

## 💻 Running Locally

After setting up your environment variables, initialize the database:

```bash
cd server
npx prisma generate
npx prisma db push
```

**Start the Backend server:**
```bash
# In the /server directory
npm run dev
# The server will run on http://localhost:5000
```

**Start the Frontend application:**
```bash
# In the /frontend directory
npm run dev
# The frontend will be available at http://localhost:3000
```

## 🚢 Deployment Instructions

### Backend (e.g., Render, Railway, DigitalOcean)
1. Provision a Node.js environment.
2. Set the `DATABASE_URL` and `JWT_SECRET` environment variables.
3. Add a build command: `npm install && npx prisma generate`.
4. Add a start command: `npm start` (Make sure `"start": "node src/server.js"` is in package.json).

### Frontend (e.g., Vercel, Netlify)
1. Connect your repository to Vercel/Netlify.
2. Set the Root Directory to `frontend`.
3. Set the `NEXT_PUBLIC_API_URL` to your newly deployed backend URL.
4. Deploy (Next.js preset will handle the build automatically).

## 🛡️ Security Notes

- **Strict CORS:** Configured to only allow requests from explicit frontend origins.
- **Rate Limiting:** `express-rate-limit` is actively guarding `/auth` routes to prevent brute-force attacks.
- **Data Isolation:** All database queries are strictly scoped using `workspace_id` validation to prevent tenant data leakage.
- **Safe Payload Delivery:** Password hashes and sensitive fields are explicitly stripped from API responses.

## 🔭 Future Improvements

- Add OAuth Integration (Google/Microsoft SSO)
- Implement WebSocket support for real-time dashboard updates
- Expand charting and reporting capabilities in the Dashboard
- Add full global Search (Command+K palette)
- Bulk import/export for Leads (CSV)

## ✍️ Author

**Varun Joshi**
- GitHub: [https://github.com/VarunsLand](https://github.com/VarunsLand)

---
*If you find this project helpful, please consider giving it a ⭐ on GitHub!*

# SaaS CRM: Project Structure & Architecture

## 1. Top-Level Folder Structure
A Monorepo approach using standard directories for clear frontend and backend separation.

```text
saas-crm/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── docker-compose.yml      # Local dev database orchestration
├── .gitignore
└── README.md
```

## 2. Frontend Architecture (`/client`)
Built with React, Vite, and Tailwind CSS.

```text
client/
├── public/                 # Static assets (images, favicon)
├── src/
│   ├── assets/             # Global styles (index.css)
│   ├── components/         # Reusable UI (Buttons, Modals, Cards)
│   ├── features/           # Domain-driven feature modules (leads, tasks, auth)
│   ├── layouts/            # Page layouts (DashboardLayout, AuthLayout)
│   ├── pages/              # Route-level components
│   ├── routes/             # React Router definitions & guards
│   ├── services/           # Axios API call wrappers
│   ├── store/              # Global state (Zustand or Context API)
│   ├── utils/              # Helper functions (date formatting, etc.)
│   ├── App.jsx             # Root React component
│   └── main.jsx            # Vite entry point
├── .env                    # Frontend environment variables
├── package.json
├── tailwind.config.js      # Tailwind configuration & design tokens
└── vite.config.js          # Vite configuration
```
* **Architecture Note:** We use a feature-based folder structure (inside `/features`). Instead of grouping all components or all api calls together globally, we group them by domain (e.g., `/features/leads/components`, `/features/leads/api`) for better scalability.

## 3. Backend Architecture (`/server`)
Built with Node.js and Express, following an N-Tier architecture (Controller -> Service -> Data Access).

```text
server/
├── prisma/
│   ├── schema.prisma       # Database schema & models
│   └── migrations/         # Auto-generated SQL migrations
├── src/
│   ├── config/             # Env validation and DB instantiation
│   ├── controllers/        # Request/Response handling
│   ├── middlewares/        # Auth, Error handling, Validation
│   ├── routes/             # Express route definitions
│   ├── services/           # Core business logic & DB calls
│   ├── utils/              # Helper functions (hashing, JWT generation)
│   ├── app.js              # Express app setup (plugins, routing)
│   └── server.js           # Entry point, starts the HTTP server
├── .env                    # Backend environment variables
└── package.json
```

## 4. Middleware Architecture
* **`auth.middleware.js`:** Extracts the Bearer token, verifies the JWT, and attaches `{ user_id, tenant_id, role }` to `req.user`. Rejects unauthorized requests (401).
* **`role.middleware.js`:** Checks if `req.user.role === 'ADMIN'`. Returns 403 for unauthorized staff members attempting administrative actions.
* **`error.middleware.js`:** Global error handler catch-all. Formats unhandled exceptions into the standard `{ error, message }` JSON response to prevent stack trace leaks.
* **`validate.middleware.js`:** Request payload validation (using a library like Zod or Joi) executed before hitting controllers.

## 5. Prisma Architecture
* **`schema.prisma`:** Acts as the single source of truth for the database schema, foreign keys, and relationships.
* **Prisma Client:** Instantiated as a singleton in `/src/config/db.js` to avoid connection pool exhaustion during hot reloads or high traffic.
* **Multi-Tenant Injection:** The Prisma Client does not enforce tenancy natively. The **Service Layer** is strictly responsible for ensuring every single Prisma query includes `where: { tenant_id: req.user.tenant_id }`.

## 6. Service Layer Architecture
* **Purpose:** Keep Express Controllers "thin". Controllers only parse the request and return the response. All business logic lives in `/services`.
* **Example (`LeadService.js`):** 
  ```javascript
  // The service handles the Prisma query AND enforces the tenant boundary
  class LeadService {
    static async getLeadById(tenantId, leadId) {
      return await prisma.lead.findFirst({
        where: { id: leadId, tenant_id: tenantId }
      });
    }
  }
  ```

## 7. Route Organization
Routes are strictly modularized by entity and mounted in `/src/routes/index.js`.
* `app.use('/api/v1/auth', authRoutes)`
* `app.use('/api/v1/tenant', tenantRoutes)`
* `app.use('/api/v1/users', userRoutes)`
* `app.use('/api/v1/leads', leadRoutes)`
* `app.use('/api/v1/tasks', taskRoutes)`
* `app.use('/api/v1/dashboard', dashboardRoutes)`
* `app.use('/api/v1/settings', settingsRoutes)`

## 8. Environment Variables
**Server (`/server/.env`):**
* `PORT=5000`
* `NODE_ENV=production`
* `DATABASE_URL=postgresql://user:pass@host:5432/crm?schema=public`
* `JWT_SECRET=super_secure_random_string`
* `JWT_EXPIRES_IN=7d`

**Client (`/client/.env`):**
* `VITE_API_BASE_URL=https://api.yourdomain.com/v1`

## 9. Security Architecture
* **CORS:** Configured in Express to strictly allow API requests only from the verified frontend domain.
* **Helmet:** Applied in Express to set secure HTTP headers (XSS protection, no-sniff).
* **Rate Limiting:** `express-rate-limit` applied globally, with stricter limits specifically on `/auth/login` to prevent brute force and credential stuffing.
* **Cryptography:** Passwords hashed with Bcrypt (salt rounds: 10 or 12).
* **Data Isolation:** Logical separation backed by mandatory `tenant_id` injection at the ORM layer, preventing cross-tenant data spillage.

## 10. Deployment Architecture
* **Database:** Managed PostgreSQL instance (e.g., Supabase, AWS RDS, or Render PostgreSQL) with daily automated backups.
* **Backend:** Deployed as a scalable Node.js container or service (e.g., Render, Railway, AWS ECS).
* **Frontend:** Built via Vite as static assets and hosted on a global Edge CDN (e.g., Vercel, Netlify, or AWS CloudFront) for zero-latency delivery.
* **CI/CD:** GitHub Actions configured to:
  1. Run Prisma schema generation and unit tests.
  2. Build the Vite frontend payload.
  3. Auto-deploy to Staging/Production environments on main branch merges.

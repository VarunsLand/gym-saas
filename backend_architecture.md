# SaaS CRM: Backend Architecture & Scaffolding

## 1. Complete Folder & File Structure

```text
server/
├── prisma/
│   ├── schema.prisma            # Database schema and models
│   └── migrations/              # Auto-generated SQL history
├── src/
│   ├── config/                  # App configurations
│   │   ├── env.js               # Environment variable validation (dotenv)
│   │   └── db.js                # Prisma Client singleton instantiation
│   ├── controllers/             # Express route handlers
│   │   ├── auth.controller.js
│   │   ├── tenant.controller.js
│   │   ├── user.controller.js
│   │   ├── lead.controller.js
│   │   ├── interaction.controller.js
│   │   ├── task.controller.js
│   │   ├── dashboard.controller.js
│   │   └── settings.controller.js
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.middleware.js   # Validates JWT and attaches user to req
│   │   ├── role.middleware.js   # Validates admin privileges
│   │   ├── error.middleware.js  # Global error catch-all
│   │   └── validate.middleware.js # Schema validation interceptor
│   ├── routes/                  # Express route definitions
│   │   ├── index.js             # Main router aggregating all v1 routes
│   │   ├── auth.routes.js
│   │   ├── tenant.routes.js
│   │   ├── user.routes.js
│   │   ├── lead.routes.js
│   │   ├── interaction.routes.js
│   │   ├── task.routes.js
│   │   ├── dashboard.routes.js
│   │   └── settings.routes.js
│   ├── services/                # Core business logic & Prisma calls
│   │   ├── auth.service.js
│   │   ├── tenant.service.js
│   │   ├── user.service.js
│   │   ├── lead.service.js
│   │   ├── interaction.service.js
│   │   ├── task.service.js
│   │   ├── dashboard.service.js
│   │   └── settings.service.js
│   ├── validations/             # Input validation schemas (Joi/Zod)
│   │   ├── auth.validation.js
│   │   ├── tenant.validation.js
│   │   ├── user.validation.js
│   │   ├── lead.validation.js
│   │   ├── interaction.validation.js
│   │   ├── task.validation.js
│   │   └── settings.validation.js
│   ├── utils/                   # Helpers and constants
│   │   ├── ApiError.js          # Custom error class formatting
│   │   ├── catchAsync.js        # Wrapper to catch async route errors
│   │   ├── jwtUtils.js          # JWT sign/verify logic
│   │   ├── passwordUtils.js     # Bcrypt hash/compare logic
│   │   └── constants.js         # Magic strings, enums, etc.
│   ├── app.js                   # Express app setup (plugins, CORS)
│   └── server.js                # App entry point (app.listen)
├── .env                         # Secrets and environment configurations
├── package.json                 # Node dependencies and scripts
└── README.md                    # Server documentation
```

---

## 2. Component Organization & Responsibilities

### 2.1 Route Organization (`/src/routes`)
* **Responsibility:** Maps specific HTTP verbs (GET, POST, PATCH, DELETE) and URL paths to the correct controller methods. This layer strictly orchestrates the flow and applies necessary middleware.
* **Implementation:** 
  A route file like `lead.routes.js` will export an Express Router.
  `router.post('/', requireAuth, validate(leadValidation.create), leadController.createLead);`
* **Aggregation:** `index.js` acts as the master router, mounting all child routers under `/api/v1/`.

### 2.2 Controller Organization (`/src/controllers`)
* **Responsibility:** Purely handles the HTTP Request/Response cycle. Controllers are kept intentionally "thin".
* **Implementation:**
  1. Extracts data from `req` (such as `req.params`, `req.body`, and `req.user.tenant_id`).
  2. Passes that strict payload to the Service layer.
  3. Takes the returned Service payload and formats it into a standard JSON response (`res.status(200).json(...)`).
  4. Wraps execution in `catchAsync` to cleanly push any errors to the global error handler.

### 2.3 Service Organization (`/src/services`)
* **Responsibility:** The "brain" of the application. The Service layer contains 100% of the business logic and database interactions. The Express framework is entirely decoupled from the database; only Services speak to Prisma.
* **Multi-Tenant Injection Rule:** Every single service method MUST accept `tenantId` as its first parameter to forcefully inject `where: { tenant_id: tenantId }` into all ORM queries.
* **Implementation:**
  ```javascript
  // lead.service.js
  const createLead = async (tenantId, leadData) => {
    return prisma.lead.create({
      data: {
        ...leadData,
        tenant_id: tenantId // Hard-enforced boundary
      }
    });
  };
  ```

### 2.4 Middleware Organization (`/src/middlewares`)
* **Responsibility:** Reusable functions that intercept requests to perform security checks, context injection, or response formatting before a route is fully processed.
* **Key Middlewares:**
  * `auth.middleware.js`: Extracts the Bearer token, verifies the JWT, and securely attaches `{ id, tenant_id, role }` directly to the `req.user` object. Rejects with 401 if invalid.
  * `role.middleware.js`: An extension of auth that checks if `req.user.role === 'ADMIN'`. Returns 403 Forbidden for unauthorized staff attempts.
  * `validate.middleware.js`: A higher-order function that accepts a validation schema and strictly enforces `req.body`/`req.query` types. Returns 400 Bad Request instantly if validation fails.
  * `error.middleware.js`: The final stop for exceptions. Formats stack traces in dev, but sanitizes errors into a clean JSON structure in production to prevent data leakage.

### 2.5 Validation Organization (`/src/validations`)
* **Responsibility:** Defines strict declarative schemas for all incoming API payloads using an object schema validator (like Joi or Zod).
* **Implementation:** Ensures no garbage data, incorrect types, or malicious payloads ever reach the Controller or Service layers.
* **Example (`lead.validation.js`):**
  Defines `createLeadSchema` forcing `first_name` to be a string (max 100 chars), `phone_number` to be present, and strips out undefined keys.

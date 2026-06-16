# SaaS CRM: Database Architecture & Multi-Tenant Design

## 1. Multi-Tenant Data Isolation Strategy
**Approach:** Logical Separation (Pooled Database) with Row-Level Security (RLS)
* **How it works:** All businesses share the same database and tables. Every single table (except global configurations) will include a `tenant_id` column.
* **Security:** We will utilize PostgreSQL Row-Level Security (RLS) policies. This ensures that every database query automatically filters by `tenant_id` based on the authenticated user's session token. Even if an application bug allows a cross-tenant query, the database engine will reject it, preventing data leaks.

## 2. Complete Database Schema (Conceptual)

### 2.1 Core Tables
* **`tenants`** (The Businesses)
  * Represents the paying business entity (Gym, Clinic, etc.).
  * Columns: `id` (UUID, PK), `name` (String), `industry` (String), `timezone` (String), `created_at` (Timestamp), `updated_at` (Timestamp), `status` (Enum: active, suspended).
  
* **`users`** (The Staff/Owners)
  * Represents individual accounts logging into the system.
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `email` (String, Unique per tenant), `password_hash` (String), `first_name` (String), `last_name` (String), `role` (Enum: admin, staff), `created_at` (Timestamp), `updated_at` (Timestamp), `last_login_at` (Timestamp).
  
* **`lead_sources`** (Configurable Entry Points)
  * To categorize where leads come from (WhatsApp, Walk-in, Referral).
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `name` (String), `is_active` (Boolean), `created_at` (Timestamp).

### 2.2 CRM Operations Tables
* **`leads`** (The Potential Customers)
  * The core entity representing a business opportunity.
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `source_id` (UUID, FK), `assigned_to` (UUID, FK to users - optional), `first_name` (String), `last_name` (String), `phone_number` (String), `email` (String, optional), `service_of_interest` (String), `status` (Enum: new, in_progress, won, lost), `created_at` (Timestamp), `updated_at` (Timestamp).
  
* **`interactions`** (Notes & Activity Timeline)
  * An immutable, append-only log of conversations with a lead.
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `lead_id` (UUID, FK), `user_id` (UUID, FK - who recorded it), `interaction_type` (Enum: call, whatsapp, walk_in, note, status_change), `notes` (Text), `created_at` (Timestamp).
  
* **`follow_up_tasks`** (Scheduling Engine)
  * Drives the "Today's Tasks" dashboard.
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `lead_id` (UUID, FK), `assigned_to` (UUID, FK to users), `due_date` (Timestamp with Timezone), `status` (Enum: pending, completed, cancelled), `completed_at` (Timestamp), `created_at` (Timestamp), `updated_at` (Timestamp).

### 2.3 System Tables
* **`audit_logs`** (Security & Compliance)
  * Tracks high-level mutations (deletions, setting changes, mass exports).
  * Columns: `id` (UUID, PK), `tenant_id` (UUID, FK), `user_id` (UUID, FK), `action` (String), `entity_type` (String), `entity_id` (UUID), `previous_data` (JSONB), `new_data` (JSONB), `ip_address` (String), `created_at` (Timestamp).

## 3. Table Relationships
* `tenants` (1) to (Many) `users`
* `tenants` (1) to (Many) `leads`
* `tenants` (1) to (Many) `lead_sources`
* `users` (1) to (Many) `leads` (via `assigned_to` column)
* `leads` (1) to (Many) `interactions`
* `leads` (1) to (Many) `follow_up_tasks`
* `users` (1) to (Many) `follow_up_tasks` (via `assigned_to` column)
* *Integrity Rule:* All Foreign Keys must Cascade Delete if a `tenant` is wiped, but Restrict/Set Null if a `user` is deleted (to retain historical lead data).

## 4. Required Indexes
To maintain sub-50ms query times at scale, the following BTREE indexes are required:
* **Multi-Tenant Lookup:** Every foreign key must be indexed, commonly as a composite index with the tenant to optimize join clauses: e.g., `(tenant_id, lead_id)`, `(tenant_id, user_id)`.
* **Lead Search:** `(tenant_id, phone_number)` for fast collision detection, and `(tenant_id, status)` for list views.
* **Dashboard Performance:** A partial index on `follow_up_tasks (tenant_id, assigned_to, due_date) WHERE status = 'pending'`. This is specifically designed to power the "Today's Tasks" dashboard instantaneously without scanning completed tasks.
* **Sorting:** `(tenant_id, created_at DESC)` on the `interactions` table for rendering chronological timelines quickly.

## 5. User Permissions Model
* **Authentication:** Handled via secure, HTTP-only JWTs or server-side sessions tied to the user's UUID.
* **Roles:**
  * **Admin:** Unrestricted access within their `tenant_id`. Can view all leads, reassign staff, manage billing, configure lead sources, and view all audit logs.
  * **Staff:** Can read/write `leads`, `interactions`, and `follow_up_tasks`. Prevented at the application/API tier from accessing global configuration routes, modifying tenant settings, or exporting bulk data.

## 6. Lead Ownership Model
* A lead belongs entirely to the `tenant`.
* An `assigned_to` column links a lead to a specific `user`. 
* **MVP Routing:** Any staff member can pick up a "New" unassigned lead. Once they interact with it, they become the "owner" (`assigned_to`).
* **Visibility:** To foster collaboration in small businesses, all staff can *see* all leads within the tenant, but their default dashboard view is filtered to show *their* assigned leads.

## 7. Follow-up Scheduling Model
* **Decoupling:** Follow-ups are distinct from the Lead status. A lead can be "In Progress" with a task due "Today", "Tomorrow", or "Overdue".
* **Completion Lifecycle:** When a user completes a task, the UI immediately prompts them to schedule the *next* task.
* **Safety Net:** The system continuously checks if `status = pending` tasks exist for a lead. If none exist and the lead is not Won/Lost, it flags the lead as an "Orphaned Lead" ensuring no lead is forgotten.
* **Timezones:** All `due_date` timestamps are stored in UTC. The application converts them to the `tenants.timezone` when calculating what constitutes "Today" for a specific business.

## 8. Audit & Logging Requirements
* **Standard Logging:** The `interactions` table acts as the business timeline (recording who called whom and when).
* **Security Audit Trail:** The `audit_logs` table strictly records high-risk actions. This is populated either via PostgreSQL triggers or application middleware. It captures user creation/deletion, bulk lead exports, role changes, or permanent deletions.
* **Storage Optimization:** `previous_data` and `new_data` utilize JSONB for flexible, space-efficient snapshots of the row state before and after the mutation.

## 9. Future Scalability Considerations
* **Connection Pooling:** Implement PgBouncer or a modern proxy (like Prisma Accelerate or Supabase connection pooling) from Day 1 to manage database connections efficiently across thousands of concurrent tenant users.
* **Partitioning:** When the database size warrants it, we will utilize PostgreSQL native Table Partitioning on `tenant_id` for massive, append-heavy tables like `interactions` and `audit_logs`.
* **Search Capabilities:** If wildcard text search on notes/leads becomes a bottleneck, we will implement PostgreSQL Full-Text Search (using GIST/GIN indexes) before introducing external complexities like Elasticsearch.
* **Query Performance:** Ensure the chosen ORM or Query Builder correctly batches queries and forcefully injects `tenant_id` filtering at the base level to prevent N+1 queries and guarantee cross-tenant data isolation.

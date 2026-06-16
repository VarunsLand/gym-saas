# SaaS CRM: Production Database Specification

## 1. Global Strategies

### 1.1 Soft Delete Strategy
* **Approach:** Instead of physically deleting records from the database, we use a `deleted_at (TIMESTAMP)` column on critical tables (`tenants`, `users`, `leads`). 
* **Reasoning:** Prevents accidental data loss, maintains referential integrity for historical audit logs, and allows for easy recovery. Application queries will globally filter `WHERE deleted_at IS NULL`.
* **Hard Deletes:** `interactions` and `follow_up_tasks` can be hard-deleted if their parent `lead` is hard-deleted (for GDPR compliance), but generally, we rely on soft deletes for core business entities.

### 1.2 Index Strategy
* **Multi-Tenant Indexes:** Every foreign key and highly-queried column must be part of a composite index starting with `tenant_id` to ensure isolated, high-performance querying (e.g., `(tenant_id, created_at)`).
* **Primary Keys:** All `id` columns use `UUID` (specifically UUIDv4 or UUIDv7 for better clustered indexing performance).

---

## 2. Global Enums

* **`user_role`**: `ADMIN`, `STAFF`
* **`tenant_status`**: `ACTIVE`, `SUSPENDED`, `CANCELLED`
* **`lead_status`**: `NEW`, `IN_PROGRESS`, `WON`, `LOST`
* **`interaction_type`**: `CALL`, `WHATSAPP`, `EMAIL`, `MEETING`, `WALK_IN`, `NOTE`, `STATUS_CHANGE`
* **`task_status`**: `PENDING`, `COMPLETED`, `CANCELLED`

---

## 3. Table Definitions

### 3.1 `tenants`
* **Why it exists:** The root entity for the multi-tenant architecture. Every piece of data in the system (except system configs) belongs to a tenant.
* **What it stores:** Business account details, billing status, and localization configuration.
* **Connections:** Parent to `users`, `leads`, `lead_sources`, and `audit_logs`.

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | Not Null |
| `industry` | VARCHAR(100) | Nullable |
| `timezone` | VARCHAR(50) | Not Null, Default: 'UTC' |
| `status` | ENUM `tenant_status` | Not Null, Default: 'ACTIVE' |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `updated_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `deleted_at` | TIMESTAMP (TZ) | Nullable (Soft Delete) |

* **Indexes:** PK(`id`)

---

### 3.2 `users`
* **Why it exists:** Represents the staff and owners logging into the CRM.
* **What it stores:** Authentication credentials, profile information, and authorization roles.
* **Connections:** Belongs to `tenants`. Parent to `leads` (as assigned owner), `interactions` (as author), and `follow_up_tasks` (as assignee).

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `email` | VARCHAR(255) | Not Null |
| `password_hash`| VARCHAR(255) | Not Null |
| `first_name` | VARCHAR(100) | Not Null |
| `last_name` | VARCHAR(100) | Not Null |
| `role` | ENUM `user_role` | Not Null, Default: 'STAFF' |
| `last_login_at`| TIMESTAMP (TZ) | Nullable |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `updated_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `deleted_at` | TIMESTAMP (TZ) | Nullable (Soft Delete) |

* **Unique Constraints:** `UNIQUE(tenant_id, email)` - Ensures emails are unique *per business*, not globally.
* **Indexes:** `(tenant_id, email)`

---

### 3.3 `lead_sources`
* **Why it exists:** Allows businesses to customize where their leads come from (e.g., "Facebook Ad", "Front Desk").
* **What it stores:** Lookup values for lead origins.
* **Connections:** Belongs to `tenants`. Referenced by `leads`.

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `name` | VARCHAR(100) | Not Null |
| `is_active` | BOOLEAN | Not Null, Default: TRUE |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |

* **Indexes:** `(tenant_id, is_active)`

---

### 3.4 `leads`
* **Why it exists:** The core entity of the CRM. Represents a potential customer.
* **What it stores:** Contact information, current pipeline status, and staff assignment.
* **Connections:** Belongs to `tenants`. References `users` (assigned_to) and `lead_sources`. Parent to `interactions` and `follow_up_tasks`.

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `source_id` | UUID | Nullable, FK to `lead_sources(id)` ON DELETE SET NULL |
| `assigned_to` | UUID | Nullable, FK to `users(id)` ON DELETE SET NULL |
| `first_name` | VARCHAR(100) | Not Null |
| `last_name` | VARCHAR(100) | Nullable |
| `phone_number` | VARCHAR(50) | Not Null |
| `email` | VARCHAR(255) | Nullable |
| `service` | VARCHAR(255) | Nullable (Service of interest) |
| `status` | ENUM `lead_status`| Not Null, Default: 'NEW' |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `updated_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `deleted_at` | TIMESTAMP (TZ) | Nullable (Soft Delete) |

* **Constraints / Cascades:** If the assigned `user` is hard-deleted, `assigned_to` becomes NULL (Lead returns to an unassigned pool). If `lead_source` is deleted, it becomes NULL.
* **Indexes:** 
  * `(tenant_id, phone_number)` - For quick duplicate checks.
  * `(tenant_id, status)` - To power the directory list views.
  * `(tenant_id, assigned_to)` - For filtering by owner.

---

### 3.5 `interactions`
* **Why it exists:** Provides an immutable, append-only history of everything that happens to a lead.
* **What it stores:** Notes, records of calls/messages, and system-generated logs (e.g., "Status changed from New to In Progress").
* **Connections:** Belongs to `tenants`. References `leads` and `users` (the author).

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `lead_id` | UUID | Not Null, FK to `leads(id)` ON DELETE CASCADE |
| `user_id` | UUID | Nullable, FK to `users(id)` ON DELETE SET NULL |
| `type` | ENUM `interaction_type` | Not Null |
| `notes` | TEXT | Nullable |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |

* **Constraints / Cascades:** If a lead is hard-deleted, all its interactions are CASCADE deleted. If a user is hard-deleted, `user_id` becomes NULL (the note text remains intact, but the author becomes anonymous/system).
* **Indexes:** `(tenant_id, lead_id, created_at DESC)` - Specifically optimized for rendering the chronological timeline on the Lead Details screen.

---

### 3.6 `follow_up_tasks`
* **Why it exists:** Powers the action-oriented workflow ("Today's Tasks"). Decouples individual tasks from the overall lead status.
* **What it stores:** Deadlines, task status, and ownership.
* **Connections:** Belongs to `tenants`. References `leads` and `users`.

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `lead_id` | UUID | Not Null, FK to `leads(id)` ON DELETE CASCADE |
| `assigned_to` | UUID | Not Null, FK to `users(id)` ON DELETE CASCADE |
| `due_date` | TIMESTAMP (TZ) | Not Null |
| `status` | ENUM `task_status`| Not Null, Default: 'PENDING' |
| `completed_at` | TIMESTAMP (TZ) | Nullable |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |
| `updated_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |

* **Constraints / Cascades:** If a lead or the assigned user is hard-deleted, the task is CASCADE deleted.
* **Indexes:** 
  * `(tenant_id, assigned_to, due_date)` - **Partial index `WHERE status = 'PENDING'`** (Critical for instantaneously loading the dashboard without scanning historical tasks).
  * `(tenant_id, lead_id)` - To fetch tasks for a specific lead profile.

---

### 3.7 `audit_logs`
* **Why it exists:** Security and compliance. Tracks destructive, administrative, or bulk actions.
* **What it stores:** Snapshots of data changes (who changed what, and when).
* **Connections:** Belongs to `tenants`. References `users`.

| Column | Type | Constraints & Behavior |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Not Null, FK to `tenants(id)` ON DELETE CASCADE |
| `user_id` | UUID | Nullable, FK to `users(id)` ON DELETE SET NULL |
| `action` | VARCHAR(255) | Not Null (e.g., 'user.deleted', 'lead.exported') |
| `entity_type` | VARCHAR(100) | Not Null (e.g., 'leads', 'users') |
| `entity_id` | UUID | Not Null |
| `previous_data`| JSONB | Nullable |
| `new_data` | JSONB | Nullable |
| `ip_address` | VARCHAR(45) | Nullable |
| `created_at` | TIMESTAMP (TZ) | Not Null, Default: NOW() |

* **Indexes:** `(tenant_id, created_at DESC)` and `(tenant_id, entity_type, entity_id)`.

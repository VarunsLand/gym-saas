# SaaS CRM: REST API Specification (v1)

## Global Architecture & Security

* **Base URL:** `/api/v1`
* **Authentication:** Bearer Token (JWT) sent in the `Authorization` header. 
  * The verified JWT payload will contain: `{ "user_id": UUID, "tenant_id": UUID, "role": ENUM }`.
* **Multi-Tenancy Enforced:** The backend automatically extracts `tenant_id` from the JWT and injects it into all database queries. The client NEVER passes `tenant_id` in the URL or JSON payload. This prevents Insecure Direct Object Reference (IDOR) vulnerabilities where a user tries to access another business's data.
* **Standard Error Response Structure:**
  ```json
  { "error": "Error_Code_String", "message": "Human readable message." }
  ```

---

## 1. Authentication Endpoints

### 1.1 Signup (Create Business)
* **Method:** `POST`
* **Route:** `/auth/signup`
* **Purpose:** Register a new business tenant and create the initial Admin user.
* **Auth Requirements:** None (Public)
* **Request Body:** 
  `{ "business_name": "String", "industry": "String", "first_name": "String", "last_name": "String", "email": "String", "password": "String" }`
* **Response Body (201 Created):** 
  `{ "token": "JWT_String", "user": { "id": "UUID", "role": "ADMIN" } }`
* **Error Responses:** `400 Bad Request` (Validation failure), `409 Conflict` (Email already exists in system).

### 1.2 Login
* **Method:** `POST`
* **Route:** `/auth/login`
* **Purpose:** Authenticate an existing user and issue a JWT.
* **Auth Requirements:** None (Public)
* **Request Body:** 
  `{ "email": "String", "password": "String" }`
* **Response Body (200 OK):** 
  `{ "token": "JWT_String", "user": { "id": "UUID", "first_name": "String", "role": "ENUM" } }`
* **Error Responses:** `401 Unauthorized` (Invalid credentials).

---

## 2. Tenant Endpoints

### 2.1 Get Current Tenant Profile
* **Method:** `GET`
* **Route:** `/tenant/profile`
* **Purpose:** Retrieve the business profile for the authenticated tenant.
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** 
  `{ "id": "UUID", "name": "String", "industry": "String", "timezone": "String", "status": "ENUM" }`

### 2.2 Update Tenant Profile
* **Method:** `PATCH`
* **Route:** `/tenant/profile`
* **Purpose:** Update business details (e.g., changing timezone or name).
* **Auth Requirements:** Valid JWT (Admin Role Only)
* **Request Body:** 
  `{ "name": "String?", "industry": "String?", "timezone": "String?" }`
* **Response Body (200 OK):** Updated tenant object.
* **Error Responses:** `403 Forbidden` (Requires Admin role).

---

## 3. User & Staff Endpoints

### 3.1 Get Staff List
* **Method:** `GET`
* **Route:** `/users`
* **Purpose:** Retrieve all staff members belonging to the current tenant for the Team Directory.
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** 
  `[ { "id": "UUID", "first_name": "String", "last_name": "String", "email": "String", "role": "ENUM", "last_login_at": "Timestamp" } ]`

### 3.2 Invite / Create Staff Member
* **Method:** `POST`
* **Route:** `/users`
* **Purpose:** Add a new employee to the CRM.
* **Auth Requirements:** Valid JWT (Admin Role Only)
* **Request Body:** 
  `{ "first_name": "String", "last_name": "String", "email": "String", "role": "ENUM", "password": "String" }`
* **Response Body (201 Created):** Created user object (excluding password hash).
* **Error Responses:** `403 Forbidden` (Requires Admin), `409 Conflict` (Email already exists within this tenant namespace).

---

## 4. Lead Endpoints

### 4.1 Get Leads List
* **Method:** `GET`
* **Route:** `/leads`
* **Purpose:** Fetch a paginated, filterable list of leads for the directory table.
* **Auth Requirements:** Valid JWT (Any Role)
* **Query Parameters:** `?status=ENUM&assigned_to=UUID&search=String&page=Int&limit=Int`
* **Response Body (200 OK):** 
  `{ "data": [ Lead_Objects ], "meta": { "total_count": Int, "current_page": Int } }`

### 4.2 Get Lead Details
* **Method:** `GET`
* **Route:** `/leads/:id`
* **Purpose:** Fetch the full profile of a specific lead.
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** Lead object.
* **Error Responses:** `404 Not Found` (Lead does not exist or belongs to a different tenant).

### 4.3 Create Lead
* **Method:** `POST`
* **Route:** `/leads`
* **Purpose:** Capture a new lead from manual entry or a web form.
* **Auth Requirements:** Valid JWT (Any Role)
* **Request Body:** 
  `{ "first_name": "String", "last_name": "String?", "phone_number": "String", "source_id": "UUID?", "service": "String?" }`
* **Response Body (201 Created):** Created lead object.

### 4.4 Update Lead (Status / Owner)
* **Method:** `PATCH`
* **Route:** `/leads/:id`
* **Purpose:** Change a lead's pipeline status, update contact info, or reassign them to a different staff member.
* **Auth Requirements:** Valid JWT (Any Role)
* **Request Body:** 
  `{ "status": "ENUM?", "assigned_to": "UUID?", "first_name": "String?", "phone_number": "String?" }`
* **Response Body (200 OK):** Updated lead object.

---

## 5. Interaction Endpoints

### 5.1 Get Interactions for a Lead
* **Method:** `GET`
* **Route:** `/leads/:lead_id/interactions`
* **Purpose:** Retrieve the chronological timeline of notes and events for a specific lead.
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** 
  `[ { "id": "UUID", "type": "ENUM", "notes": "String", "created_at": "Timestamp", "author": { "id": "UUID", "first_name": "String" } } ]`
* **Error Responses:** `404 Not Found` (Lead ID invalid).

### 5.2 Log a New Interaction
* **Method:** `POST`
* **Route:** `/leads/:lead_id/interactions`
* **Purpose:** Save a note, log a call, or record a WhatsApp touchpoint.
* **Auth Requirements:** Valid JWT (Any Role)
* **Request Body:** 
  `{ "type": "ENUM", "notes": "String?" }`
* **Response Body (201 Created):** Created interaction object.

---

## 6. Follow-up Task Endpoints

### 6.1 Get Active Tasks
* **Method:** `GET`
* **Route:** `/tasks`
* **Purpose:** Fetch the priority list for the Follow-up Center.
* **Auth Requirements:** Valid JWT (Any Role)
* **Query Parameters:** `?status=PENDING&assigned_to=UUID&timeframe=TODAY|OVERDUE|UPCOMING`
* **Response Body (200 OK):** 
  `[ { "id": "UUID", "due_date": "Timestamp", "status": "ENUM", "lead": { "id": "UUID", "name": "String", "phone_number": "String" } } ]`

### 6.2 Schedule a Task
* **Method:** `POST`
* **Route:** `/leads/:lead_id/tasks`
* **Purpose:** Create a new follow-up reminder for a lead.
* **Auth Requirements:** Valid JWT (Any Role)
* **Request Body:** 
  `{ "due_date": "Timestamp", "assigned_to": "UUID" }`
* **Response Body (201 Created):** Created task object.

### 6.3 Complete / Update Task
* **Method:** `PATCH`
* **Route:** `/tasks/:id`
* **Purpose:** Mark a task as completed or reschedule its due date.
* **Auth Requirements:** Valid JWT (Any Role)
* **Request Body:** 
  `{ "status": "ENUM?", "due_date": "Timestamp?" }`
* **Response Body (200 OK):** Updated task object.

---

## 7. Dashboard Endpoints

### 7.1 Get Dashboard Metrics
* **Method:** `GET`
* **Route:** `/dashboard/metrics`
* **Purpose:** Retrieve the high-level KPIs for the home screen.
* **Auth Requirements:** Valid JWT (Any Role)
* **Query Parameters:** `?date_range=CURRENT_MONTH`
* **Response Body (200 OK):** 
  `{ "total_leads": Int, "leads_won": Int, "leads_lost": Int, "tasks_due_today": Int }`

### 7.2 Get Activity Feed
* **Method:** `GET`
* **Route:** `/dashboard/activity`
* **Purpose:** Retrieve the scrolling feed of recent interactions across the whole business.
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** 
  `[ { "id": "UUID", "lead_name": "String", "action_type": "ENUM", "user_name": "String", "timestamp": "Timestamp" } ]`

---

## 8. Settings & Lookup Endpoints

### 8.1 Get Lead Sources
* **Method:** `GET`
* **Route:** `/settings/lead-sources`
* **Purpose:** Fetch the dropdown options for lead sources (used in the "Add Lead" modal).
* **Auth Requirements:** Valid JWT (Any Role)
* **Response Body (200 OK):** 
  `[ { "id": "UUID", "name": "String", "is_active": Boolean } ]`

### 8.2 Create Lead Source
* **Method:** `POST`
* **Route:** `/settings/lead-sources`
* **Purpose:** Add a new custom lead origin (e.g., "TikTok Ad").
* **Auth Requirements:** Valid JWT (Admin Role Only)
* **Request Body:** `{ "name": "String" }`
* **Response Body (201 Created):** Created lead source object.
* **Error Responses:** `403 Forbidden` (Requires Admin).

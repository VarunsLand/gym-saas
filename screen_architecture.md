# SaaS CRM: Complete Screen Architecture

## Global Layout Elements

### Sidebar Structure (Desktop)
*Behavior: Fixed on left for desktop, collapses to a bottom navigation bar or hamburger menu on mobile.*
* **Top:** Business Logo & Name.
* **Primary Navigation:**
  * **Dashboard:** (Home icon)
  * **Follow-up Center:** (Calendar/Checkmark icon) - *Includes an unread badge indicating 'Tasks Due Today'*
  * **Leads Directory:** (Users icon)
* **Admin Navigation (Only visible if `role === admin`):**
  * **Staff Management:** (Badge/Shield icon)
  * **Workspace Settings:** (Gear icon)
* **Bottom:** User Profile (Avatar, Name, Email) with "Logout" option.

### Header Structure
* **Left:** Global Search bar (Fuzzy search by Lead Name or Phone Number).
* **Right:** 
  * **Notification Bell:** Alerts for reassigned leads or critical system updates.
  * **Primary CTA:** "Quick Add Lead" Button (Prominent, solid color).

### Global UI States
* **Quick Actions:** "Quick Add Lead" opens a centralized modal from *anywhere* in the app via the Header button or a keyboard shortcut (`Cmd/Ctrl + K`).
* **Empty States:** Clear, illustrative graphics with a primary CTA. 
  * *Example (Leads):* "Your pipeline is empty. Add your first lead manually to get started." + [Add Lead Button].
  * *Example (Follow-ups):* "All caught up! No tasks due today. Enjoy your coffee."
* **Error States:** 
  * *Transient (Form failures, API timeouts):* Toast notifications top-right (e.g., "Failed to save note. Please check your connection.").
  * *Structural (Failed page load):* Fallback boundary UI components ("Could not load leads.") with a "Retry" button.

---

## Screen Inventory

### 1. Authentication Screens
* **Screen Name:** Login / Signup / Forgot Password
* **Purpose:** Secure entry point, account creation, and recovery.
* **Components:** Brand Logo, Email & Password Form, "Forgot Password" link, Validation text.
* **Actions:** Authenticate, Create Tenant (Signup), Request reset link.
* **Data Displayed:** Form validation messages.
* **Mobile Behavior:** Full screen, clean white background, forms stack vertically. 
* **Navigation Flow:** Successful login -> Dashboard. Successful signup -> Setup Wizard (Business Profile).

### 2. Dashboard (Home)
* **Screen Name:** Overview Dashboard
* **Purpose:** The daily operational hub giving a bird's-eye view of pipeline health.
* **Components:** 
  * **KPI Metric Cards:** Total Leads, Leads Won, Leads Lost (for the current month).
  * **"Urgent Tasks" Panel:** A mini-view of the Follow-up Center highlighting "Overdue" and "Today".
  * **"Recent Activity" Feed:** A rolling log of the latest notes or status changes made by the team.
* **Actions:** Click a KPI card to view the filtered Leads List. Click a task to open the Lead Details.
* **Data Displayed:** Aggregated counts from the `leads` table, pending rows from `follow_up_tasks`, recent rows from `interactions`.
* **Mobile Behavior:** KPI cards convert into a horizontal swipeable carousel. The Urgent Tasks panel takes primary vertical focus.
* **Navigation Flow:** Acts as a router; deep links into Lead Details or the Leads Directory.

### 3. Follow-up Center
* **Screen Name:** Follow-ups & Tasks
* **Purpose:** A heavily action-oriented view driving the daily workflow, decoupled from lead pipeline statuses.
* **Components:** 
  * **Tabs:** Overdue (Red), Today (Primary Color), Upcoming (Gray).
  * **Task List:** Rows showing lead name, task due date, and assigned owner.
  * **Inline Actions:** Quick action icons on hover.
* **Actions:** Mark Complete, Reschedule, "WhatsApp" (launches `wa.me/number`), "Call".
* **Data Displayed:** Joined data: `Lead Name`, `Phone`, `Task Due Date`, `Task Status`.
* **Mobile Behavior:** Converts to a list of touch-friendly cards. Swipe right to "Mark Complete", swipe left to "Reschedule".
* **Navigation Flow:** Clicking the row text opens the full Lead Details slide-out.

### 4. Leads List
* **Screen Name:** Leads Directory
* **Purpose:** The master database of all business opportunities.
* **Components:** 
  * **Data Table (Desktop):** Sortable columns.
  * **Filters Bar:** Dropdowns for Status, Source, and Assigned Staff.
  * **Bulk Action Checkboxes:** (Admin only) for mass reassignment.
* **Actions:** Sort columns, apply multi-filters, Export CSV (Admin), click into a lead.
* **Data Displayed:** Name, Phone, Status Badge, Next Follow-up Date, Owner.
* **Mobile Behavior:** Table converts into a card-based list. Columns disappear; instead, cards show Name, Status pill, and a Phone icon.
* **Navigation Flow:** Clicking a row opens the Lead Details.

### 5. Lead Details
* **Screen Name:** Lead Profile (Slide-out panel or dedicated route)
* **Purpose:** Deep dive into a single lead's history and current status.
* **Components:** 
  * **Header/Left Side (Contact Card):** Name, Phone, Email, Source, Service of Interest.
  * **Status & Owner Dropdowns:** Prominent selectors to update the pipeline state.
  * **Right Side (Activity Timeline):** Chronological feed of all past interactions.
  * **Input Area:** Rich text box anchored at the bottom to "Add Note" and a date picker to "Schedule Next Follow-up".
* **Actions:** Edit lead info, change status, log new interaction, mark current task complete, schedule next task, delete lead (Admin only).
* **Data Displayed:** Specific row from `leads`, all related rows from `interactions` (ordered by date desc), and active `follow_up_tasks`.
* **Mobile Behavior:** View stacks vertically. Contact card first, timeline below, with a sticky "Add Note" FAB (Floating Action Button) or docked input area at the bottom of the viewport.
* **Navigation Flow:** Accessible from Dashboard, Follow-up Center, or Leads List. Closing the slide-out returns the user to their previous context.

### 6. Add/Edit Lead (Modal)
* **Screen Name:** Quick Add / Edit Lead Form
* **Purpose:** Frictionless, rapid entry or modification of lead data.
* **Components:** Input fields: First Name, Last Name, Phone, Email (optional), Source Dropdown, Service of Interest.
* **Actions:** Save, Cancel.
* **Data Displayed:** Blank if New. Pre-filled data if in 'Edit' mode.
* **Mobile Behavior:** Full screen modal overlay for focused, distraction-free data entry.
* **Navigation Flow:** "Save" closes the modal, triggers a success toast, and optionally navigates to the newly created Lead Details.

### 7. Staff Management (Admin Only)
* **Screen Name:** Team Directory
* **Purpose:** Manage who has access to the business CRM.
* **Components:** List of active staff members, "Invite Staff" button, Role badges (Admin/Staff).
* **Actions:** Invite via email address, revoke access, change user role, view "Last Login" timestamps.
* **Data Displayed:** Rows from `users` table linked to the current `tenant_id`.
* **Mobile Behavior:** Standard list view with ellipsis (...) dropdowns for actions.
* **Navigation Flow:** Accessible via Sidebar -> Staff Management.

### 8. Settings (Admin Only)
* **Screen Name:** Workspace Settings
* **Purpose:** Configure business-level CRM logic.
* **Components:** Tabs or side-menu for: Business Profile, Lead Sources, Data Export, Billing.
* **Actions:** Update company name/timezone, add/edit/disable custom lead sources (e.g., "Summer Promo Walk-in", "TikTok Ad").
* **Data Displayed:** `tenants` table data, `lead_sources` lookup table data.
* **Mobile Behavior:** Vertically stacked accordion menus instead of horizontal tabs.
* **Navigation Flow:** Accessible via Sidebar -> Settings.

### 9. User Profile
* **Screen Name:** Personal Settings
* **Purpose:** Manage individual user preferences and security.
* **Components:** Avatar upload, First/Last Name inputs, Password reset form.
* **Actions:** Update personal info, change password, logout.
* **Data Displayed:** Authenticated user's specific row from the `users` table.
* **Mobile Behavior:** Standard stacked form layout.
* **Navigation Flow:** Accessible via the bottom Sidebar user avatar.

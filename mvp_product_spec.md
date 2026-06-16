# SaaS CRM for Local Businesses: MVP Product Specification

## Overview
**Target Audience:** Gyms, Clinics, Coaching Centers, Salons, and other local businesses.
**Core Problem:** Businesses lose potential customers because they forget to follow up on leads from WhatsApp, Instagram, referrals, calls, and walk-ins.
**Goal:** Provide a fast, simple, and actionable system to capture leads and ensure zero missed follow-ups.

---

## 1. Complete User Workflow (Signup to Daily Usage)

### Onboarding
1. **Signup:** User (Business Owner) registers with email and creates a password.
2. **Business Profile:** Enters basic business details (Name, Industry).
3. **Quick Setup:** Adds any staff members and customizes simple lead sources (e.g., "Walk-in", "WhatsApp").

### Daily Usage
1. **Morning Routine:** Owner/Staff logs in and reviews the **"Today's Tasks"** dashboard to see who needs a follow-up.
2. **Lead Capture (Throughout the Day):** When an inquiry occurs, the user clicks "Quick Add" to log basic contact info and the source.
3. **Actioning Leads:** User clicks the "WhatsApp" or "Call" button on the lead, reaches out, logs a brief note, and sets the *next* follow-up date.
4. **End of Day:** User ensures all "Today" follow-ups are either completed, rescheduled, or marked as Lost/Won.

---

## 2. Business Workflow (Lead Movement)

This represents how a single lead flows through the system from discovery to conversion:

1. **Capture:** Lead reaches out. Staff enters Lead Name, Phone, Service of Interest, and Source into the CRM.
2. **Initial Contact:** Staff reaches out to the lead (e.g., sends pricing) and logs this interaction.
3. **Scheduling Next Action:** Staff sets a "Follow-up Reminder" for a specific date (e.g., 2 days later).
4. **Follow-up Trigger:** On the scheduled date, the lead appears on the prioritized "Today's Follow-ups" list.
5. **Nurture:** Staff contacts them again. If the lead needs more time, a new follow-up date is set.
6. **Resolution:** The lead either signs up (marked as **Won**) or stops responding/declines (marked as **Lost**).

---

## 3. MVP Scope

The MVP focuses strictly on **Lead Capture** and **Follow-up Reminders**. It removes all friction from data entry.

* **Fast Lead Entry:** A simple modal to quickly add Name, Phone, Service, and Source.
* **Enforced Follow-ups:** The system encourages setting a "Next Follow-up Date" for every open lead.
* **Action-Oriented Dashboard:** Focuses on "Overdue", "Today", and "Upcoming" leads rather than complex charts.
* **Interaction Logging:** Simple text area to add historical notes.
* **WhatsApp Integration (Lightweight):** A click-to-chat button that opens WhatsApp Web/App pre-filled with the lead's number.
* **Basic Analytics:** Counters for Total Leads, Leads Won, and Leads Lost for the current month.

---

## 4. Required Pages/Screens

1. **Authentication:** Login, Signup, Forgot Password.
2. **Dashboard (Home):** The operational hub. Shows daily tasks (Overdue, Today, Tomorrow) and top-level metrics.
3. **Leads Directory:** A table or list view of all leads, filterable by Status and searchable by Name/Phone.
4. **Lead Detail View:** A slide-out panel or dedicated page showing:
    * Contact info
    * Current Status
    * Activity history / Notes timeline
    * Input to log a new note and schedule the next follow-up.
5. **Settings:** Profile, Business details, Staff management, and simple dropdown configurations.

---

## 5. User Roles

* **Admin (Owner):** Full access. Can manage billing, export data, manage staff, and view business-wide analytics.
* **Staff:** Operational access. Can add leads, log notes, update statuses, and view their assigned follow-ups. Cannot export data or delete leads.

---

## 6. Lead Lifecycle / Status Flow

A simple, linear status flow to avoid pipeline bloat:

1. **New:** Lead entered, no contact attempted yet.
2. **In Progress:** Initial conversation started, actively being nurtured.
3. **Won:** Lead became a paying customer.
4. **Lost:** Lead explicitly said no, or stopped responding after multiple attempts.

*Note: The primary driver of action is the "Next Follow-up Date", not just the Status.*

---

## 7. Daily Actions (Business Owner / Staff)

* **Review:** Check "Overdue" and "Today's" follow-ups.
* **Reach Out:** Click the WhatsApp/Call link to contact leads.
* **Log:** Type a 1-sentence summary of what happened.
* **Reschedule:** Pick a new date for the next touchpoint.
* **Capture:** Rapidly add any new walk-ins or messages as new leads.

---

## 8. Non-Goals (Features NOT in Version 1)

To guarantee speed to market and focus on the core problem, the following are strictly excluded from the MVP:

* Automated WhatsApp/SMS/Email drip campaigns.
* Invoicing, billing, or payment processing.
* Customizable sales pipelines with drag-and-drop Kanban boards.
* Complex calendar integrations or appointment scheduling.
* Social media API integrations (e.g., auto-importing from Facebook/Instagram ads).
* Multi-branch or franchise management.
* Dedicated iOS/Android mobile apps (we will rely on a mobile-responsive web app instead).

# AI Agent Instructions: "My Camp" Project Setup & Development

## 1. Project Overview
[cite_start]You are building a Full-Stack web application named "My Camp"[cite: 75]. [cite_start]This system is designed to manage Jewish Agency summer camp delegations in the US, centralizing all camper data, daily updates, and administrative tasks into one platform[cite: 19, 75, 142].

## 2. Tech Stack Setup
[cite_start]Please initialize the project using the following stack[cite: 81]:
* [cite_start]**Frontend:** Vite + React[cite: 81].
* [cite_start]**Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)[cite: 81].
* [cite_start]**Hosting/Deployment:** Vercel for Frontend, Supabase Cloud for Backend[cite: 81].
* [cite_start]**Styling:** Start with clean, structural Greyscale UI (no complex colors/fonts yet) focusing purely on layout and functionality[cite: 25].

## 3. Database & Architecture (Supabase)
[cite_start]Please set up the PostgreSQL database with strict Row Level Security (RLS)[cite: 81, 109]. [cite_start]The system has three main user roles: Head of Delegation (Admin), Staff, and Parent[cite: 32, 127, 129]. 

* [cite_start]**RLS Rules:** Ensure a parent can only view their specific camper's profile and comments[cite: 109].
* [cite_start]**Realtime:** Enable Supabase Realtime for instant push notifications on the daily feed (e.g., when a parent comments or an admin posts an incident)[cite: 106].
* [cite_start]**Storage:** Configure Supabase Storage buckets for "Daily Photos", "Receipts", and "Camper Documents"[cite: 89, 93].

## 4. Core Routing & Navigation
[cite_start]Implement the following navigation flow[cite: 34, 38]:
* [cite_start]**Public Routes:** Landing page with User Role Selection (Parent/Staff) -> Login -> Register / Forgot Password[cite: 32, 85].
* [cite_start]**Protected Routes (Parents/Staff):** Home (Feed) [cite: 47][cite_start], Camper Profile [cite: 53][cite_start], Profile Settings, Contact[cite: 32].
* [cite_start]**Admin/Staff Only Routes:** Main Staff Dashboard [cite: 59][cite_start], Expense Reporting [cite: 56][cite_start], Incident/Safety Reporting, Lesson Plans[cite: 32].

## 5. Key Screens to Build

**A. [cite_start]Home / Daily Updates Feed** [cite: 48, 85]
* **Purpose:** Central feed for real-time daily summaries and photos[cite: 48, 85].
* [cite_start]**UI Components:** Navigation bar, scrolling Feed Cards (Text, Gallery, Author name), and a text field for comments[cite: 48].
* **Interactions:** Admins see an "Upload New Post" button. [cite_start]Parents see a "Save Photo" icon and can submit comments[cite: 48]. 

**B. [cite_start]Camper Profile** [cite: 54, 85]
* [cite_start]**Purpose:** Quick access to critical camper data[cite: 54, 85].
* **UI Components:** Header with name/photo. [cite_start]Three tabs: "Personal Details", "Critical Info (Diet/Medical)", and "Documents"[cite: 54].
* **Interactions:** Read-only for parents. [cite_start]Admins have an "Edit" button and quick-dial/message buttons to contact parents instantly[cite: 54].

**C. [cite_start]Expense Reporting (Admin Only)** [cite: 57, 85]
* **Purpose:** Form to log financial expenses for budget tracking[cite: 57, 85].
* [cite_start]**UI Components:** Input fields for Amount, Date picker, Category dropdown (e.g., Transport, Food), and free-text Description[cite: 57].
* [cite_start]**Interactions:** "Attach Receipt" button that uploads an image/PDF to Supabase Storage[cite: 57]. [cite_start]"Submit" button sends data to the DB[cite: 57].

**D. [cite_start]Staff Dashboard (Admin Only)** [cite: 60, 85]
* **Purpose:** Control Panel for the Head of Delegation[cite: 60, 85].
* [cite_start]**UI Components:** Information Widgets (Budget utilization progress bar, Open Tasks count, Safety Incidents count, Unread Parent Messages)[cite: 60]. 
* [cite_start]**Interactions:** Include quick Call-to-Action (CTA) buttons for "Report Expense", "Report Incident", and "New Post"[cite: 60]. [cite_start]Include a quick-access list of campers showing critical status alerts (e.g., missing insurance, allergies)[cite: 60].

## 6. Execution Instructions for AI
1. Start by scaffolding the Vite+React application and installing Supabase client libraries.
2. Build the basic routing and authentication flow first.
3. Create the Database tables and policies as specified.
4. Build the UI components screen-by-screen, starting with the Staff Dashboard and Daily Feed.
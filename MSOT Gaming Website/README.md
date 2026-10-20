# MSOT — Gamified Learning Platform

MSOT Gamified Learning Platform is a web application designed to turn everyday learning at MSOT into an engaging, gamified experience — featuring learning quests, daily micro-challenges, streaks, leagues, and team battles tied to real classes, assignments, and coding practice.

---

## 🌟 Highlights & Features

- **Cinematic Experience & Visual Design**: Immersive dark theme, glowing cyan-violet accents, backdrop blur filters, and accessible contrast ratios.
- **Student-First Registration**: Direct registration for MSOT students to immediately jump into learning quests and challenges.
- **Automated Profile Provisioning**: Database triggers automatically provision user records in `public.profiles` upon Supabase Auth sign-up, ensuring unprivileged defaults cannot be tampered with by the client.
- **Faculty Approval Workflow**: Faculty applicants are flagged as `pending` upon signup and kept restricted to a dedicated pending status view (`/faculty/pending`) until an authorized administrator approves their application.
- **Protected Administrator Suite (`/admin/users`)**: Search, filter, sort, inspect applicant details, and approve or reject faculty applications with instant feedback and confirmation dialogs.
- **Rigorous Database Security (RLS)**: Enforced via PostgreSQL Row Level Security policies and `SECURITY DEFINER` stored procedures. Ordinary users cannot escalate their role or approve themselves.
- **Password Recovery & Session Management**: Neutral confirmation responses, password reset flow, token refresh, and cross-tab session synchronization.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4
- **Animation**: Motion for React (`motion/react`) + HTML5 2D Canvas
- **Routing**: React Router v7
- **Authentication & Database**: Supabase JS Client v2 (`@supabase/supabase-js`)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers`)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Testing**: Vitest + Testing Library

---

## 📁 Project Architecture

```
nova/
├── .env.example                     # Environment template
├── .gitignore                       # Git exclusion rules
├── index.html                       # HTML5 entry with Inter font
├── package.json                     # Dependencies & build scripts
├── vite.config.ts                   # Vite + Tailwind v4 config
├── src/
│   ├── App.tsx                      # Root application & Toast provider
│   ├── main.tsx                     # React DOM entry point
│   ├── router.tsx                   # Route definitions & guards
│   ├── index.css                    # Design system tokens & Tailwind v4
│   ├── components/
│   │   ├── animation/
│   │   │   ├── CinematicIntro.tsx   # 5-stage opening animation
│   │   │   └── ParticleField.tsx    # Canvas floating particle field
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx   # Role & approval status guards
│   │   ├── layout/
│   │   │   ├── AuthLayout.tsx       # Auth shell with particles & glow
│   │   │   └── DashboardLayout.tsx  # Dashboard header & content shell
│   │   └── ui/
│   │       ├── Button.tsx           # Motion buttons with variants
│   │       ├── GlassPanel.tsx       # Glassmorphism container
│   │       ├── Input.tsx            # Styled form input with visibility toggle
│   │       └── RoleSelector.tsx     # Student vs Faculty applicant selector
│   ├── context/
│   │   ├── AuthContext.ts           # Context definition
│   │   └── AuthProvider.tsx         # Session & profile lifecycle provider
│   ├── features/
│   │   ├── admin/
│   │   │   └── AdminUsers.tsx       # User management & faculty approvals
│   │   ├── auth/
│   │   │   ├── AccessDeniedPage.tsx # 403 unauthorized page
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx        # Authentication view
│   │   │   ├── RegisterPage.tsx     # User & faculty applicant signup
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.tsx # Approved faculty view
│   │   │   └── FacultyPending.tsx   # Application under review view
│   │   └── student/
│   │       └── StudentDashboard.tsx # Student dashboard
│   ├── hooks/
│   │   ├── useAuth.ts               # Hook to access user and profile
│   │   └── useIntroState.ts         # Hook to control intro animation
│   ├── lib/
│   │   └── supabase.ts              # Centralized Supabase client
│   ├── services/
│   │   ├── approvalService.ts       # Faculty approval RPCs
│   │   ├── authService.ts           # Sign in, sign up, passwords
│   │   ├── profileService.ts        # Profile queries
│   │   └── security.test.ts         # Security invariant tests
│   ├── tests/
│   │   └── acceptanceCriteria.test.ts # 26 comprehensive acceptance tests
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   └── utils/
│       ├── routes.ts                # Route permission logic
│       ├── routes.test.ts           # Route guard unit tests
│       ├── validation.ts            # Zod validation schemas
│       └── validation.test.ts       # Schema unit tests
└── supabase/
    └── migrations/
        ├── 001_create_profiles.sql  # Schema, RLS, triggers & RPCs
        ├── 002_admin_setup.sql      # One-time initial admin promotion
        └── 003_admin_member_management.sql # Member approvals & Faculty/Student role updates
```

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
```bash
cd nova
npm install
```

### 3. Configure Supabase Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and fill in your actual publishable key:
```env
VITE_SUPABASE_URL=https://rjwjanjpctypununlzbv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_publishable_key_here
```

> **Note**: Never expose your Supabase `service_role` key in frontend code or environment variables. Only the public anon key (`publishable_key`) belongs in the client.

### 4. Apply Database Migrations in Supabase

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/rjwjanjpctypununlzbv](https://supabase.com/dashboard/project/rjwjanjpctypununlzbv)
2. In the left navigation, click on **SQL Editor**.
3. Create a new query, paste the contents of [`supabase/migrations/001_create_profiles.sql`](supabase/migrations/001_create_profiles.sql), and click **Run**.
   - This sets up:
     - The `public.profiles` table with foreign key to `auth.users(id)`.
     - Indexes for roles, approval status, and emails.
     - Row Level Security (RLS) policies.
     - The `handle_new_user()` trigger on `auth.users` that automatically creates a profile on sign-up.
     - The `approve_faculty()` and `reject_faculty()` security-definer procedures.

### 5. Initial Administrator Provisioning

To securely configure the administrator account for `sudhanshu91730@gmail.com`:

1. Launch the application:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173/register`.
3. Register an account using:
   - **Full Name**: Administrator
   - **Email**: `sudhanshu91730@gmail.com`
   - **Password**: [Your secret password provided in conversation]
   - **Account Type**: Student / User (public admin registration is intentionally prohibited).
4. Verify the email if confirmation is enabled in your Supabase project.
5. In your Supabase Dashboard, go to **SQL Editor**, open [`supabase/migrations/002_admin_setup.sql`](supabase/migrations/002_admin_setup.sql), and click **Run**:
   ```sql
   DO $$
   DECLARE
     target_id UUID;
   BEGIN
     SELECT id INTO target_id
     FROM public.profiles
     WHERE email = 'sudhanshu91730@gmail.com';
     
     IF target_id IS NULL THEN
       RAISE EXCEPTION 'User with email sudhanshu91730@gmail.com not found. Please register first.';
     END IF;
     
     UPDATE public.profiles
     SET 
       role = 'admin',
       approval_status = 'not_required',
       requested_role = 'student',
       updated_at = now()
     WHERE id = target_id;
     
     RAISE NOTICE 'Successfully promoted user to admin role.';
   END;
   $$;
   ```
6. Sign in at `http://localhost:5173/login`. You will be automatically redirected to `/admin/users` with full administrative privileges to review and manage all registrations and faculty applications.

---

## 🧪 Running Tests & Quality Checks

Run the automated test suite (56 unit, security & acceptance criteria tests):
```bash
npm run test
```

Run code linting:
```bash
npm run lint
```

Run production build:
```bash
npm run build
```

---

## 🔒 Security Architecture & RLS Summary

| Action | Student | Faculty (Pending) | Faculty (Approved) | Administrator |
|---|---|---|---|---|
| View own profile | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Modify own role/status | ❌ Denied by RLS | ❌ Denied by RLS | ❌ Denied by RLS | ❌ Denied by RLS |
| Access `/dashboard` | ✅ Yes | ❌ (Redirected to `/faculty/pending`) | ✅ Yes | ✅ Yes |
| Access `/faculty/dashboard` | ❌ Denied | ❌ Denied | ✅ Yes | ✅ Yes |
| Access `/admin/users` | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Yes |
| Approve / Reject Faculty | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Via `approve_faculty` RPC |

---

## 📋 What Remains To Be Supplied

1. **Supabase Publishable Key**: Place your actual `VITE_SUPABASE_PUBLISHABLE_KEY` in the `.env` file.
2. **Apply SQL Migration**: Execute `supabase/migrations/001_create_profiles.sql` in the Supabase SQL editor.
3. **Register and Promote Admin**: Register `sudhanshu91730@gmail.com` and run `supabase/migrations/002_admin_setup.sql`.

# Step 1: Foundation Strengthening - Setup Guide

## ✅ What Was Implemented

### 1. **Clerk Role Management System**
- Role-based authentication using Clerk's `publicMetadata`
- Three roles: `student`, `teacher`, `admin`
- Automatic role synchronization between Clerk and database

### 2. **Core Authentication Utilities**

#### `lib/auth.ts`
- `getCurrentUser()` - Fetches authenticated user with role and profile data
- `setUserRole()` - Sets user role in Clerk metadata (admin only)
- `hasRole()` / `hasAnyRole()` - Role checking helpers
- `requireRole()` / `requireAnyRole()` - API route protection
- `syncUserWithDatabase()` - Syncs Clerk users with database

#### `lib/prisma.ts`
- Singleton Prisma client with connection pooling
- Development query logging

### 3. **API Routes**

#### `/api/user/role` (GET, POST)
- Get current user's role
- Set user role (admin or self-assignment during onboarding)

#### `/api/user/profile` (GET, POST)
- Get current user profile
- Create student or teacher profile

#### `/api/webhooks/clerk` (POST)
- Handles Clerk webhook events
- Syncs user creation, updates, and deletion with database

### 4. **Onboarding Flow**
- `/onboarding` page with role selection
- Dynamic form based on selected role
- Student form: name, ID, class, section, parent info
- Teacher form: name, ID, subject, qualification
- Admin: instant access (no additional profile needed)

### 5. **Role-Based Dashboards**
- `/dashboard` - Redirects to role-specific dashboard
- `/dashboard/student` - Student dashboard with quick actions
- `/dashboard/teacher` - Teacher dashboard with class management
- `/dashboard/admin` - Admin dashboard with system overview

### 6. **Middleware & Routing**
- Protected routes with Clerk authentication
- Automatic redirect to onboarding if no role/profile
- Automatic redirect to dashboard if already set up

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install svix
```

### Step 2: Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Get your API keys from **API Keys** section
4. Update `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_key
```

### Step 3: Set Up Clerk Webhooks

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - For local development: Use [ngrok](https://ngrok.com/) or [Clerk's local testing](https://clerk.com/docs/integrations/webhooks/sync-data#testing-webhooks-locally)
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** and add to `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run db:seed
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing the Implementation

### Test Flow 1: New User Signup

1. Go to `/sign-up`
2. Create a new account with email
3. After signup, you'll be redirected to `/onboarding`
4. Select a role (Student, Teacher, or Admin)
5. Fill in the profile form
6. Submit and verify redirect to role-specific dashboard

### Test Flow 2: Existing User Login

1. Go to `/sign-in`
2. Login with existing credentials
3. If user has no role: redirect to `/onboarding`
4. If user has role: redirect to `/dashboard` → role-specific dashboard

### Test Flow 3: Role-Based Access

**Student Dashboard:**
- Shows student ID, class, section
- Quick actions: Attendance, Homework, Results, Messages, Complaints, Events

**Teacher Dashboard:**
- Shows teacher ID, subject, qualification
- Quick actions: Classes, Mark Attendance, Homework, Upload Results, Complaints, Analytics

**Admin Dashboard:**
- Shows system statistics (students, teachers, fees, complaints)
- Quick actions: Manage Students, Teachers, Fees, Events, Complaints, Reports

---

## 🔐 Security Features

1. **Role-Based Access Control (RBAC)**
   - Middleware protects all routes
   - API routes verify user roles
   - Database-level user validation

2. **Webhook Verification**
   - Svix signature verification for Clerk webhooks
   - Prevents unauthorized database modifications

3. **Profile Uniqueness**
   - Student IDs and Teacher IDs must be unique
   - Email uniqueness enforced by Clerk

---

## 📝 API Usage Examples

### Get Current User

```typescript
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
// Returns: { id, clerkId, email, role, fullName, studentData?, teacherData? }
```

### Protect API Route

```typescript
import { requireRole } from '@/lib/auth'

export async function POST(req: Request) {
  // Only admins can access
  const user = await requireRole('admin')
  
  // Your logic here
}
```

### Check Multiple Roles

```typescript
import { requireAnyRole } from '@/lib/auth'

export async function GET() {
  // Teachers and admins can access
  const user = await requireAnyRole(['teacher', 'admin'])
  
  // Your logic here
}
```

---

## 🎯 Next Steps

With Step 1 complete, you can now:

1. **Build Feature APIs** - Create endpoints for attendance, homework, results, etc.
2. **Implement Dashboard Features** - Add real functionality to dashboard cards
3. **Add AI Agents** - Integrate OpenAI for complaint routing, performance analysis
4. **Real-time Features** - Add Socket.io for chat and notifications
5. **UI Enhancements** - Build detailed pages for each feature

---

## 🐛 Troubleshooting

### Issue: "User has no role assigned"
- **Solution**: Make sure role is set in Clerk's `publicMetadata` during signup or via onboarding

### Issue: Webhook not working
- **Solution**: 
  - Verify `CLERK_WEBHOOK_SECRET` is correct
  - Check webhook endpoint is publicly accessible
  - Review Clerk Dashboard webhook logs

### Issue: Database connection error
- **Solution**:
  - Run `npx prisma generate`
  - Verify `DATABASE_URL` in `.env.local`
  - Check database file exists: `prisma/dev.db`

### Issue: Redirect loop
- **Solution**:
  - Clear browser cookies
  - Check middleware configuration
  - Verify user has both role AND profile in database

---

## 📚 File Structure

```
app/
├── api/
│   ├── user/
│   │   ├── role/route.ts          # Role management
│   │   └── profile/route.ts       # Profile management
│   └── webhooks/
│       └── clerk/route.ts         # Clerk webhook handler
├── dashboard/
│   ├── layout.tsx                 # Dashboard layout with auth check
│   ├── page.tsx                   # Dashboard router
│   ├── student/page.tsx           # Student dashboard
│   ├── teacher/page.tsx           # Teacher dashboard
│   └── admin/page.tsx             # Admin dashboard
├── onboarding/
│   └── page.tsx                   # Onboarding page
├── sign-in/[[...sign-in]]/page.tsx
├── sign-up/[[...sign-up]]/page.tsx
└── page.tsx                       # Landing page

components/
└── onboarding-form.tsx            # Onboarding form component

lib/
├── auth.ts                        # Authentication utilities
├── prisma.ts                      # Prisma client
└── utils.ts                       # Utility functions

middleware.ts                      # Route protection
```

---

## ✨ Features Summary

✅ Clerk authentication with role management  
✅ Database synchronization via webhooks  
✅ Role-based onboarding flow  
✅ Three role-specific dashboards  
✅ API routes for user management  
✅ Middleware protection  
✅ Type-safe authentication utilities  
✅ Automatic routing based on user state  

**Status**: Foundation complete and ready for feature development!

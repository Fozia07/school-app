import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, setUserRole, UserRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

/**
 * GET /api/user/role
 * Get the current user's role
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      role: user.role,
      hasProfile: !!(user.studentData || user.teacherData),
    })
  } catch (error) {
    console.error('Error getting user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/user/role
 * Set a user's role (admin only, or self-assignment during onboarding)
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, role, isOnboarding } = body as {
      userId?: string
      role: UserRole
      isOnboarding?: boolean
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // If setting another user's role, must be admin
    if (userId && userId !== currentUser.clerkId) {
      if (currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      }

      // Set role in Clerk
      await setUserRole(userId, role)

      // Update role in database
      await prisma.user.update({
        where: { id: userId },
        data: { role: role as Role },
      })

      return NextResponse.json({ success: true, message: 'Role updated successfully' })
    }

    // Self-assignment during onboarding (only if user has no role yet)
    if (isOnboarding) {
      // Check if user already has a role set in Clerk
      if (currentUser.role !== null) {
        return NextResponse.json(
          { error: 'User already has a role assigned' },
          { status: 400 }
        )
      }

      // Admin onboarding gate
      if (role === 'admin') {
        const adminExists = await prisma.user.findFirst({
          where: { role: 'admin' },
        })

        if (adminExists) {
          const adminCode = body.adminCode
          const expectedCode = process.env.ADMIN_ONBOARDING_CODE

          if (!expectedCode || adminCode !== expectedCode) {
            return NextResponse.json(
              { error: 'Admin onboarding code is invalid or not configured. Administrators must be registered by an existing admin.' },
              { status: 403 }
            )
          }
        }
      }

      // Set role in Clerk
      await setUserRole(currentUser.clerkId, role)

      // Update or create user in database
      await prisma.user.upsert({
        where: { email: currentUser.email },
        update: { role: role as Role, clerkId: currentUser.clerkId },
        create: {
          email: currentUser.email,
          clerkId: currentUser.clerkId,
          role: role as Role,
        },
      })

      return NextResponse.json({ success: true, message: 'Role set successfully' })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error setting user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { auth, currentUser as clerkCurrentUser, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export type UserRole = 'student' | 'teacher' | 'admin'

export interface AuthUser {
  id: string
  clerkId: string
  email: string
  role: UserRole | null
  fullName?: string
  studentData?: {
    studentId: string
    class: string
    section: string
    parentName?: string
    parentPhone?: string
  }
  teacherData?: {
    teacherId: string
    subject: string
    qualification?: string
    salary?: number
  }
}

/**
 * Get the current authenticated user with their role and profile data
 * This function fetches data from both Clerk and the database
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const clerkUser = await clerkCurrentUser()

    if (!clerkUser) {
      return null
    }

    // Get role from Clerk's public metadata (might be null initially)
    const role = (clerkUser.publicMetadata?.role as UserRole) || null

    // Find user in database by clerkId or email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          { email: clerkUser.emailAddresses[0]?.emailAddress },
        ],
      },
      include: {
        student: true,
        teacher: true,
      },
    })

    // If user doesn't exist in database, create them
    if (!dbUser) {
      console.log(`Creating database user for Clerk user ${userId}`)
      try {
        dbUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            role: role ? (role as Role) : null,
          },
          include: {
            student: true,
            teacher: true,
          },
        })
      } catch (createError) {
        // Race condition: another thread/request (like clerk webhook) might have created the user
        console.warn('Race condition in user creation, retrying lookup:', createError)
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { clerkId: userId },
              { email: clerkUser.emailAddresses[0]?.emailAddress },
            ],
          },
          include: {
            student: true,
            teacher: true,
          },
        })
        if (!dbUser) {
          throw new Error('Failed to create or find user in database')
        }
      }
    } else if (!dbUser.clerkId) {
      // If user exists (e.g. from seed or webhook lookup) but clerkId is not set, set it now
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { clerkId: userId },
        include: {
          student: true,
          teacher: true,
        },
      })
    }

    // Build response based on role
    const currentUser: AuthUser = {
      id: dbUser.id,
      clerkId: userId,
      email: dbUser.email,
      role: (clerkUser.publicMetadata?.role as UserRole) || (dbUser.role as UserRole) || null,
      fullName: undefined,
    }

    // Add role-specific data
    if (dbUser.student) {
      currentUser.fullName = dbUser.student.fullName
      currentUser.studentData = {
        studentId: dbUser.student.studentId,
        class: dbUser.student.class,
        section: dbUser.student.section,
        parentName: dbUser.student.parentName || undefined,
        parentPhone: dbUser.student.parentPhone || undefined,
      }
    } else if (dbUser.teacher) {
      currentUser.fullName = dbUser.teacher.fullName
      currentUser.teacherData = {
        teacherId: dbUser.teacher.teacherId,
        subject: dbUser.teacher.subject,
        qualification: dbUser.teacher.qualification || undefined,
        salary: dbUser.teacher.salary || undefined,
      }
    } else {
      // Admin or user without profile
      currentUser.fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined
    }

    return currentUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Set a user's role in Clerk metadata
 * This should typically only be called by admins
 */
export async function setUserRole(clerkUserId: string, role: UserRole): Promise<void> {
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role,
      },
    })
  } catch (error) {
    console.error('Error setting user role:', error)
    throw new Error('Failed to set user role')
  }
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === requiredRole
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  return user && user.role ? roles.includes(user.role) : false
}

/**
 * Require a specific role or throw an error
 * Useful for protecting API routes
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized: No user found')
  }

  if (user.role !== requiredRole) {
    throw new Error(`Unauthorized: Required role ${requiredRole}, but user has role ${user.role}`)
  }

  return user
}

/**
 * Require any of the specified roles or throw an error
 */
export async function requireAnyRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized: No user found')
  }

  if (!user.role || !roles.includes(user.role)) {
    throw new Error(`Unauthorized: Required one of roles [${roles.join(', ')}], but user has role ${user.role}`)
  }

  return user
}

/**
 * Sync a Clerk user with the database
 * Creates User, Student, or Teacher records as needed
 */
export async function syncUserWithDatabase(
  clerkUserId: string,
  email: string,
  role: UserRole | null,
  profileData?: {
    fullName: string
    studentId?: string
    teacherId?: string
    class?: string
    section?: string
    subject?: string
    qualification?: string
    parentName?: string
    parentPhone?: string
    dateOfBirth?: Date
    joiningDate?: Date
    enrollmentDate?: Date
  }
): Promise<void> {
  try {
    // Check if user already exists by clerkId or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: clerkUserId },
          { email },
        ],
      },
      include: { student: true, teacher: true },
    })

    if (existingUser) {
      console.log(`User ${email} already exists in database`)
      // If clerkId is missing, update it
      if (!existingUser.clerkId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkId: clerkUserId },
        })
      }
      return
    }

    // Create user with role-specific profile
    if (role === 'student' && profileData) {
      await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          role: 'student',
          student: {
            create: {
              studentId: profileData.studentId || `S${Date.now()}`,
              fullName: profileData.fullName,
              class: profileData.class || '',
              section: profileData.section || '',
              dateOfBirth: profileData.dateOfBirth,
              parentName: profileData.parentName,
              parentPhone: profileData.parentPhone,
              enrollmentDate: profileData.enrollmentDate || new Date(),
            },
          },
        },
      })
    } else if (role === 'teacher' && profileData) {
      await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          role: 'teacher',
          teacher: {
            create: {
              teacherId: profileData.teacherId || `T${Date.now()}`,
              fullName: profileData.fullName,
              subject: profileData.subject || '',
              qualification: profileData.qualification,
              joiningDate: profileData.joiningDate || new Date(),
            },
          },
        },
      })
    } else {
      // Admin or user without profile (like when role is null or admin)
      await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          role: role ? (role as Role) : null,
        },
      })
    }

    console.log(`Successfully synced user ${email} with database`)
  } catch (error) {
    console.error('Error syncing user with database:', error)
    throw new Error('Failed to sync user with database')
  }
}

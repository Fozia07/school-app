import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/user/profile
 * Create or update user profile (Student or Teacher)
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { role } = body

    if (role === 'student') {
      const { fullName, studentId, class: className, section, parentName, parentPhone } = body

      // Validate required fields
      if (!fullName || !studentId || !className || !section) {
        return NextResponse.json(
          { error: 'Missing required fields: fullName, studentId, class, section' },
          { status: 400 }
        )
      }

      // Check if student profile already exists
      const existingStudent = await prisma.student.findFirst({
        where: { userId: currentUser.id },
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student profile already exists' },
          { status: 400 }
        )
      }

      // Check if studentId is unique
      const studentIdExists = await prisma.student.findUnique({
        where: { studentId },
      })

      if (studentIdExists) {
        return NextResponse.json(
          { error: 'Student ID already in use' },
          { status: 400 }
        )
      }

      // Create student profile
      const student = await prisma.student.create({
        data: {
          userId: currentUser.id,
          studentId,
          fullName,
          class: className,
          section,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          enrollmentDate: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Student profile created successfully',
        student,
      })
    }

    if (role === 'teacher') {
      const { fullName, teacherId, subject, qualification } = body

      // Validate required fields
      if (!fullName || !teacherId || !subject) {
        return NextResponse.json(
          { error: 'Missing required fields: fullName, teacherId, subject' },
          { status: 400 }
        )
      }

      // Check if teacher profile already exists
      const existingTeacher = await prisma.teacher.findFirst({
        where: { userId: currentUser.id },
      })

      if (existingTeacher) {
        return NextResponse.json(
          { error: 'Teacher profile already exists' },
          { status: 400 }
        )
      }

      // Check if teacherId is unique
      const teacherIdExists = await prisma.teacher.findUnique({
        where: { teacherId },
      })

      if (teacherIdExists) {
        return NextResponse.json(
          { error: 'Teacher ID already in use' },
          { status: 400 }
        )
      }

      // Create teacher profile
      const teacher = await prisma.teacher.create({
        data: {
          userId: currentUser.id,
          teacherId,
          fullName,
          subject,
          qualification: qualification || null,
          joiningDate: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Teacher profile created successfully',
        teacher,
      })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      user: currentUser,
    })
  } catch (error) {
    console.error('Error getting profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

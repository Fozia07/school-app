'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserRole } from '@/lib/auth'
import { Users, BookOpen, Shield } from 'lucide-react'

interface OnboardingFormProps {
  userEmail: string
}

export function OnboardingForm({ userEmail }: OnboardingFormProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields for student
  const [studentData, setStudentData] = useState({
    fullName: '',
    studentId: '',
    class: '',
    section: '',
    parentName: '',
    parentPhone: '',
  })

  // Form fields for teacher
  const [teacherData, setTeacherData] = useState({
    fullName: '',
    teacherId: '',
    subject: '',
    qualification: '',
  })

  // Admin onboarding code
  const [adminCode, setAdminCode] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First, set the role
      const roleResponse = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          isOnboarding: true,
          adminCode: selectedRole === 'admin' ? adminCode : undefined,
        }),
      })

      if (!roleResponse.ok) {
        const data = await roleResponse.json()
        throw new Error(data.error || 'Failed to set role')
      }

      // If student or teacher, create profile
      if (selectedRole === 'student') {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'student',
            ...studentData,
          }),
        })

        if (!profileResponse.ok) {
          const data = await profileResponse.json()
          throw new Error(data.error || 'Failed to create profile')
        }
      } else if (selectedRole === 'teacher') {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'teacher',
            ...teacherData,
          }),
        })

        if (!profileResponse.ok) {
          const data = await profileResponse.json()
          throw new Error(data.error || 'Failed to create profile')
        }
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Select Your Role</CardTitle>
          <CardDescription>Choose how you'll be using the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleRoleSelect('student')}
              className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <Users className="h-12 w-12 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Student</h3>
              <p className="text-sm text-gray-600">
                Access your classes, homework, and grades
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('teacher')}
              className="p-6 border-2 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
            >
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Teacher</h3>
              <p className="text-sm text-gray-600">
                Manage classes, assignments, and student progress
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="p-6 border-2 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <Shield className="h-12 w-12 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Administrator</h3>
              <p className="text-sm text-gray-600">
                Manage school operations and users
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Role: <span className="font-semibold capitalize">{selectedRole}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={studentData.fullName}
                  onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    required
                    value={studentData.studentId}
                    onChange={(e) => setStudentData({ ...studentData, studentId: e.target.value })}
                    placeholder="e.g., S001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Input
                    id="class"
                    required
                    value={studentData.class}
                    onChange={(e) => setStudentData({ ...studentData, class: e.target.value })}
                    placeholder="e.g., 10th"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  required
                  value={studentData.section}
                  onChange={(e) => setStudentData({ ...studentData, section: e.target.value })}
                  placeholder="e.g., A"
                  maxLength={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  value={studentData.parentName}
                  onChange={(e) => setStudentData({ ...studentData, parentName: e.target.value })}
                  placeholder="Enter parent name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={studentData.parentPhone}
                  onChange={(e) => setStudentData({ ...studentData, parentPhone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </>
          )}

          {selectedRole === 'teacher' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={teacherData.fullName}
                  onChange={(e) => setTeacherData({ ...teacherData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherId">Teacher ID *</Label>
                  <Input
                    id="teacherId"
                    required
                    value={teacherData.teacherId}
                    onChange={(e) => setTeacherData({ ...teacherData, teacherId: e.target.value })}
                    placeholder="e.g., T001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    required
                    value={teacherData.subject}
                    onChange={(e) => setTeacherData({ ...teacherData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={teacherData.qualification}
                  onChange={(e) => setTeacherData({ ...teacherData, qualification: e.target.value })}
                  placeholder="e.g., M.Sc. Mathematics"
                />
              </div>
            </>
          )}

          {selectedRole === 'admin' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Shield className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">
                  Administrator accounts have full access to the system.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Onboarding Code *</Label>
                <Input
                  id="adminCode"
                  type="password"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter the secret admin onboarding code"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedRole(null)}
              disabled={loading}
            >
              Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

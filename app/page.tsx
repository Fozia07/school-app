import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, BookOpen, BarChart } from "lucide-react";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    if (!currentUser.role || (!currentUser.studentData && !currentUser.teacherData && currentUser.role !== 'admin')) {
      redirect('/onboarding');
    }
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <School className="h-16 w-16 text-blue-400" />
          <h1 className="text-5xl font-bold text-foreground">School Management System</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          An AI-powered platform for modern schools, providing separate dashboards for students, teachers, and administrators with intelligent automation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-400" /> Students</CardTitle>
            </CardHeader>
            <CardContent><p className="text-muted-foreground">Track attendance, view results, submit complaints, communicate with teachers.</p></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-400" /> Teachers</CardTitle>
            </CardHeader>
            <CardContent><p className="text-muted-foreground">Mark attendance, assign homework, upload results, generate AI-assisted remarks.</p></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-purple-400" /> Administrators</CardTitle>
            </CardHeader>
            <CardContent><p className="text-muted-foreground">Manage school operations, fees, events, and view AI-powered insights.</p></CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get Started</h2>
            <p className="text-muted-foreground mb-6">Sign in to access your role-specific dashboard</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8"><Link href="/sign-in">Sign In</Link></Button>
              <Button size="lg" variant="outline" className="px-8"><Link href="/sign-up">Create Account</Link></Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-8">
            <p>Demo mode: Use any email to sign in (Clerk test environment)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

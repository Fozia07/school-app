import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your school dashboard</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/80",
                footerActionLink: "text-primary hover:underline",
                card: "shadow-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-border bg-background text-foreground hover:bg-muted",
                formFieldLabel: "text-foreground",
                formFieldInput: "bg-background border-border text-foreground",
                footer: "bg-transparent",
                footerActionText: "text-muted-foreground",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary",
              },
            }}
          />
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo credentials: Use any email (test mode enabled)</p>
        </div>
      </div>
    </div>
  );
}

import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-sm border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your learning journey with HiPath AI
          </p>
        </div>
        
        <div className="mt-8">
          <AuthForm isLogin={false} />
        </div>
      </div>
    </div>
  )
}

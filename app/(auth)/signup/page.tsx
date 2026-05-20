import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = { title: 'Sign up | Infield Intel' }

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Join the Infield Intel community — it&apos;s free</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

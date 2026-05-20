import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Log in | Infield Intel' }

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Log in to your Infield Intel account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

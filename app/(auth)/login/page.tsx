import Image from 'next/image'
import Link from 'next/link'
import { LogoIcon } from '@/components/ui/LogoIcon'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Log In' }

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <LogoIcon size={72} />
            <span
              className="text-primary text-lg font-bold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Infield <span className="text-amber-500">Intel</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-wide uppercase mb-1">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Log in to track your reviews and rankings.
          </p>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — image (hidden on small screens) */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1200&q=80&auto=format&fit=crop"
          alt="Baseball field"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-12">
          <p className="text-4xl font-bold tracking-wide uppercase leading-tight mb-3">
            Know Before<br />
            <span className="text-amber-400">You Play</span>
          </p>
          <p className="text-white/70 max-w-xs text-sm">
            Real reviews from real players and families across San Antonio and beyond.
          </p>
        </div>
      </div>
    </div>
  )
}

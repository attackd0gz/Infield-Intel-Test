import Image from 'next/image'
import Link from 'next/link'
import { LogoIcon } from '@/components/ui/LogoIcon'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = { title: 'Sign Up | Infield Intel' }

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — image (hidden on small screens) */}
      <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1200&q=80&auto=format&fit=crop"
          alt="Baseball field aerial"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-12">
          <p className="text-4xl font-bold tracking-wide uppercase leading-tight mb-3">
            Earn Your<br />
            <span className="text-amber-400">Stripes</span>
          </p>
          <p className="text-white/70 max-w-xs text-sm">
            Every review levels you up. Climb from Rookie all the way to Hall of Famer.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <LogoIcon size={36} />
            <span
              className="text-primary text-lg font-bold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Infield <span className="text-amber-500">Intel</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-wide uppercase mb-1">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Join the community. Reviewing is always free.
          </p>

          <SignupForm />

          <p className="text-center text-xs text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

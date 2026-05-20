import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export const metadata = { title: '404 — Page Not Found' }

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden px-4">
      {/* Background field */}
      <Image
        src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1920&q=80&auto=format&fit=crop"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-zinc-950/80" />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-md">
        {/* Big number */}
        <p
          className="text-[9rem] font-black leading-none text-amber-400 select-none"
          style={{ fontFamily: 'var(--font-oswald), sans-serif', textShadow: '0 4px 40px rgba(217,119,6,0.4)' }}
        >
          404
        </p>

        <h1
          className="text-3xl font-bold tracking-widest uppercase mb-3"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Strike Three — You&apos;re Out
        </h1>

        <p className="text-white/60 text-sm leading-relaxed mb-8">
          That page doesn&apos;t exist, took a bad hop, or was moved to
          the bench. Let&apos;s get you back in the game.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/complexes">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold w-full sm:w-auto gap-2">
              <Search className="h-4 w-4" />
              Browse Complexes
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

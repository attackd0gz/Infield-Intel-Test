'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // Log to your error reporting service here if you add one
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
      <div className="max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <h1
          className="text-2xl font-bold tracking-wide uppercase mb-2"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          We hit an unexpected error. This has been noted — but you can
          try again or head back to the home plate.
        </p>

        {/* Show digest in dev for easier debugging */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

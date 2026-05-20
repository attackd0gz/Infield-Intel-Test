'use client'

import { useEffect } from 'react'
import { LogoIcon } from '@/components/ui/LogoIcon'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

// global-error replaces the root layout entirely — must supply its own <html><body>
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'oklch(0.28 0.08 158)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <LogoIcon size={64} />

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Critical Error
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>
            Something broke at the application level. Try reloading.
          </p>
          {error.digest && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '0.5rem' }}>
              {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1.75rem',
            background: '#D97706',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          Reload App
        </button>
      </body>
    </html>
  )
}

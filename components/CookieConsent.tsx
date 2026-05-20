'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { Cookie } from 'lucide-react'

type Consent = 'all' | 'essential'
const STORAGE_KEY = 'cookie_consent'

export function CookieConsent() {
  // null  = not yet decided (show banner)
  // other = previously stored decision (hide banner)
  const [consent, setConsent] = useState<Consent | null | 'loading'>('loading')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null
    setConsent(stored)
  }, [])

  function accept(choice: Consent) {
    localStorage.setItem(STORAGE_KEY, choice)
    setConsent(choice)
  }

  return (
    <>
      {/* Gate analytics events on consent */}
      <Analytics
        beforeSend={(event) => {
          const stored = localStorage.getItem(STORAGE_KEY)
          return stored === 'all' ? event : null
        }}
      />

      {/* Banner — only shown until the user decides */}
      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-white/10 bg-zinc-900 px-5 py-4 shadow-2xl text-white">

              <Cookie className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />

              <p className="flex-1 text-sm text-white/80 leading-relaxed">
                We use essential cookies to keep you signed in, and optional analytics to
                understand how the site is used — no ads, no tracking across other sites.{' '}
                <Link href="/privacy" className="text-amber-400 underline underline-offset-4 hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </p>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => accept('essential')}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
                >
                  Essential only
                </button>
                <button
                  onClick={() => accept('all')}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

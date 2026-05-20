import Image from 'next/image'
import { Mail, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="relative h-48 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1920&q=80&auto=format&fit=crop"
          alt="Baseball field"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold tracking-wide uppercase">Contact Us</h1>
          <p className="text-white/70 mt-1 text-sm">We&apos;d love to hear from you</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-lg font-bold tracking-wide uppercase mb-3">Get In Touch</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Have a question, bug report, or want to claim your complex listing?
                Fill out the form and we&apos;ll get back to you promptly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <a
                    href="mailto:hello@infieldintel.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    hello@infieldintel.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Response Time</p>
                  <p className="text-sm text-muted-foreground">Within 1–2 business days</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary text-white p-5">
              <p className="font-bold text-sm uppercase tracking-wide mb-1">Own a Complex?</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Claim your listing, respond to reviews, and post announcements.
                Select &ldquo;Claim a Complex Listing&rdquo; in the subject.
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-2 border rounded-xl p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}

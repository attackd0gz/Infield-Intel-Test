import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
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
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold tracking-wide uppercase">Privacy Policy</h1>
          <p className="text-white/70 mt-1 text-sm">Last updated: May 20, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-zinc prose-headings:font-bold prose-headings:tracking-wide prose-headings:uppercase prose-a:text-primary">
          <p className="lead text-muted-foreground">
            Infield Intel (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your
            privacy. This policy explains what information we collect, how we use it, and your rights.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li><strong>Account information:</strong> name, email address, username, and password when you create an account.</li>
            <li><strong>Profile information:</strong> bio, profile photo, and other details you choose to add.</li>
            <li><strong>User content:</strong> reviews, star ratings, photos, and any other content you submit.</li>
            <li><strong>Communications:</strong> messages you send us through the Contact page.</li>
          </ul>
          <p>We also collect information automatically, including:</p>
          <ul>
            <li>Log data (IP address, browser type, pages visited, time of visit)</li>
            <li>Device information (hardware model, operating system)</li>
            <li>Usage data (features used, search queries, interactions)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Display your reviews and profile to other users</li>
            <li>Calculate your badge level and points</li>
            <li>Respond to your contact messages and support requests</li>
            <li>Improve and personalize the Infield Intel experience</li>
            <li>Send transactional emails (account confirmation, password reset)</li>
            <li>Monitor for abuse and enforce our Terms of Service</li>
          </ul>

          <h2>3. Information We Share</h2>
          <p>
            We do not sell your personal information. We share information only in the following circumstances:
          </p>
          <ul>
            <li><strong>Publicly posted content:</strong> Your username, profile photo, badge level, and reviews are visible to all visitors of Infield Intel.</li>
            <li><strong>Service providers:</strong> We use third-party services that process data on our behalf, including Supabase (database and file storage), Vercel (hosting), and Google (Maps, Places, and OAuth sign-in). These providers are bound by their own privacy policies.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of Infield Intel and its users.</li>
          </ul>

          <h2>4. Third-Party Services</h2>
          <p>Infield Intel integrates with the following third-party services:</p>
          <ul>
            <li><strong>Google Maps / Places API</strong> — used to display maps and seed complex listings. Subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</li>
            <li><strong>Google OAuth</strong> — optional sign-in method. Google may collect data per their policy.</li>
            <li><strong>Supabase</strong> — stores your account data, reviews, and uploaded photos. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase&apos;s Privacy Policy</a>.</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active. If you delete your
            account, we will delete your personal data within 30 days, except where retention is required
            by law. Publicly posted reviews may be anonymized rather than deleted.
          </p>

          <h2>6. Children&apos;s Privacy</h2>
          <p>
            Infield Intel is not directed to children under the age of 13. We do not knowingly collect
            personal information from children under 13. If we learn that we have collected such information,
            we will delete it promptly.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information via your profile settings</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of non-transactional communications</li>
          </ul>
          <p>
            To exercise these rights, email us at{' '}
            <a href="mailto:hello@infieldintel.com">hello@infieldintel.com</a>.
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to maintain your session and remember your
            preferences. You can control cookie behavior through your browser settings, though disabling
            cookies may affect site functionality.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users of
            significant changes by email. Continued use of Infield Intel after changes take effect
            constitutes acceptance of the updated policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{' '}
            <Link href="/contact">contact us</Link> or email{' '}
            <a href="mailto:hello@infieldintel.com">hello@infieldintel.com</a>.
          </p>
        </div>
      </section>
    </div>
  )
}

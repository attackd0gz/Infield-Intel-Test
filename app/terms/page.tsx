import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Terms of Service | Infield Intel' }

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-wide uppercase">Terms of Service</h1>
          <p className="text-white/70 mt-1 text-sm">Last updated: May 20, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-zinc prose-headings:font-bold prose-headings:tracking-wide prose-headings:uppercase prose-a:text-primary">
          <p className="lead text-muted-foreground">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Infield Intel and all related services.
            By creating an account or using the site, you agree to these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Infield Intel, you confirm that you are at least 13 years old, have read
            and understood these Terms, and agree to be bound by them. If you are under 18, you represent
            that you have your parent or guardian&apos;s permission to use the service.
          </p>

          <h2>2. Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information when creating your account</li>
            <li>Keep your password secure and not share it with others</li>
            <li>Notify us immediately at <a href="mailto:hello@infieldintel.com">hello@infieldintel.com</a> if you suspect unauthorized access</li>
            <li>Use one account per person — duplicate accounts may be removed</li>
          </ul>

          <h2>3. User Content</h2>
          <p>
            Infield Intel allows you to post reviews, photos, and other content (&ldquo;User Content&rdquo;). You retain
            ownership of your User Content, but by posting it you grant Infield Intel a non-exclusive,
            royalty-free, worldwide license to display, reproduce, and distribute that content as part of
            the service.
          </p>
          <p>You agree that your User Content will NOT:</p>
          <ul>
            <li>Be false, misleading, or fraudulent</li>
            <li>Contain personal attacks, harassment, or hate speech</li>
            <li>Include private information about other individuals without their consent</li>
            <li>Infringe on any copyright, trademark, or other intellectual property rights</li>
            <li>Contain spam, advertising, or promotional material for competing services</li>
            <li>Include sexually explicit, violent, or otherwise inappropriate material</li>
          </ul>
          <p>
            We reserve the right to remove User Content that violates these Terms at any time and without
            prior notice.
          </p>

          <h2>4. Review Integrity</h2>
          <p>
            Infield Intel is built on honest, first-hand experiences. You agree to only review complexes
            you have personally visited. Submitting fake reviews, reviewing your own complex, or coordinating
            with others to manipulate ratings is strictly prohibited and may result in account termination.
          </p>

          <h2>5. Complex Owner Accounts</h2>
          <p>
            Owners who claim a complex listing agree to provide accurate information about their facility.
            Owners may respond to reviews and post announcements but may not use the platform to harass
            reviewers or post misleading information. Infield Intel reserves the right to revoke owner
            status for policy violations.
          </p>

          <h2>6. Points, Badges, and Leaderboard</h2>
          <p>
            The badge and points system is provided for entertainment purposes. Points and badge levels
            have no monetary value and may be adjusted or removed at any time. We reserve the right to
            modify the reward system without notice.
          </p>

          <h2>7. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Scrape, crawl, or use automated tools to access the service without permission</li>
            <li>Interfere with or disrupt the service&apos;s infrastructure</li>
            <li>Impersonate another person or entity</li>
            <li>Attempt to circumvent any content moderation or security measure</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            All content on Infield Intel that is not User Content — including the logo, design, code, and
            original text — is owned by Infield Intel and may not be copied or used without permission.
          </p>

          <h2>9. Disclaimers</h2>
          <p>
            Infield Intel is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee the
            accuracy of complex listings or user reviews. Complex information sourced from Google Places
            may be outdated. Always verify important details directly with a complex before visiting.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Infield Intel and its operators shall not be liable
            for any indirect, incidental, special, or consequential damages arising from your use of the
            service. Our total liability for any claim shall not exceed the amount you paid us in the
            12 months prior to the claim (if any).
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violation of these Terms. You may
            delete your account at any time by contacting us. Upon termination, your right to use the
            service ceases immediately.
          </p>

          <h2>12. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify registered users of material
            changes by email. Continued use of Infield Intel after changes take effect constitutes
            acceptance of the updated Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Texas, without regard to conflict of
            law principles. Any disputes shall be resolved in the courts of Bexar County, Texas.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            Questions about these Terms? <Link href="/contact">Contact us</Link> or email{' '}
            <a href="mailto:hello@infieldintel.com">hello@infieldintel.com</a>.
          </p>
        </div>
      </section>
    </div>
  )
}

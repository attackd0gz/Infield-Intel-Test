import { SubmitComplexForm } from '@/components/complexes/SubmitComplexForm'

export const metadata = { title: 'Submit a Complex' }

export default function SubmitComplexPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-wide uppercase mb-1">Submit a Complex</h1>
        <p className="text-muted-foreground text-sm">
          Know a baseball complex that isn&apos;t listed? Submit it and our team will review
          and add it to the directory.
        </p>
      </div>
      <SubmitComplexForm />
    </div>
  )
}

export interface AmenityQuestion {
  key: string
  label: string
  options: string[]
  hasOther?: boolean   // whether "Other" triggers a comment box
}

export const AMENITY_QUESTIONS: AmenityQuestion[] = [
  {
    key: 'fan_seating',
    label: 'Fan Seating',
    options: ['Yes', 'Limited', 'No'],
  },
  {
    key: 'shade',
    label: 'Shade',
    options: ['Yes', 'Partial', 'No'],
  },
  {
    key: 'restrooms',
    label: 'Restrooms',
    options: ['Clean', 'Adequate', 'Poor', 'None'],
  },
  {
    key: 'concession_stand',
    label: 'Concession Stand',
    options: ['Yes', 'No'],
  },
  {
    key: 'parking',
    label: 'Parking',
    options: ['Plenty', 'Limited', 'Street Only', 'Other'],
    hasOther: true,
  },
  {
    key: 'field_conditions',
    label: 'Field Conditions',
    options: ['Excellent', 'Good', 'Fair', 'Poor', 'Other'],
    hasOther: true,
  },
  {
    key: 'lighting',
    label: 'Lighting (Night Games)',
    options: ['Full', 'Partial', 'None', 'N/A'],
  },
]

/** Returns a Tailwind color class for a given amenity value. */
export function amenityValueColor(value: string): string {
  const positive = new Set(['Yes', 'Clean', 'Excellent', 'Good', 'Plenty', 'Full'])
  const neutral  = new Set(['Limited', 'Adequate', 'Partial', 'Fair', 'Other', 'N/A', 'Street Only'])
  const negative = new Set(['No', 'Poor', 'None'])

  if (positive.has(value)) return 'bg-green-50 text-green-700 border-green-200'
  if (negative.has(value)) return 'bg-red-50   text-red-700   border-red-200'
  if (neutral.has(value))  return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-zinc-100 text-zinc-600 border-zinc-200'
}

/** Human-readable label for a key. */
export function amenityLabel(key: string): string {
  return AMENITY_QUESTIONS.find(q => q.key === key)?.label ?? key
}

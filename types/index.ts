export type UserRole = 'user' | 'owner' | 'admin'

export type BadgeLevel =
  | 'Rookie'
  | 'Minor Leaguer'
  | 'Single-A'
  | 'Double-A'
  | 'Triple-A'
  | 'Major Leaguer'
  | 'All-Star'
  | 'MVP'
  | 'Hall of Famer'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  badge_level: BadgeLevel
  points: number
  review_count: number
  photo_count: number
  helpful_votes: number
  bio: string | null
  created_at: string
}

export interface Complex {
  id: string
  google_place_id: string | null
  name: string
  address: string
  city: string
  state: string
  zip: string | null
  lat: number
  lng: number
  phone: string | null
  website: string | null
  description: string | null
  amenities: string[]
  cover_photo_url: string | null
  average_rating: number
  review_count: number
  owner_id: string | null
  created_at: string
}

export interface Review {
  id: string
  complex_id: string
  user_id: string
  rating: number
  title: string
  body: string
  visit_date: string | null
  helpful_count: number
  created_at: string
  updated_at: string
  profile?: Profile
  photos?: ReviewPhoto[]
}

export interface ReviewPhoto {
  id: string
  review_id: string
  user_id: string
  storage_path: string
  url: string
  caption: string | null
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  profile: Profile
}

export const BADGE_THRESHOLDS: Record<BadgeLevel, number> = {
  'Rookie': 0,
  'Minor Leaguer': 3,
  'Single-A': 10,
  'Double-A': 25,
  'Triple-A': 50,
  'Major Leaguer': 100,
  'All-Star': 200,
  'MVP': 500,
  'Hall of Famer': 1000,
}

export function getBadgeForPoints(points: number): BadgeLevel {
  const levels = Object.entries(BADGE_THRESHOLDS).reverse() as [BadgeLevel, number][]
  for (const [level, threshold] of levels) {
    if (points >= threshold) return level
  }
  return 'Rookie'
}

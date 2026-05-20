'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, ChevronRight } from 'lucide-react'
import type { PlayerType, Profile } from '@/types'

const MLB_TEAMS = [
  // AL East
  'Yankees', 'Red Sox', 'Rays', 'Blue Jays', 'Orioles',
  // AL Central
  'Twins', 'White Sox', 'Guardians', 'Tigers', 'Royals',
  // AL West
  'Astros', 'Rangers', 'Athletics', 'Angels', 'Mariners',
  // NL East
  'Braves', 'Mets', 'Phillies', 'Marlins', 'Nationals',
  // NL Central
  'Cubs', 'Cardinals', 'Brewers', 'Pirates', 'Reds',
  // NL West
  'Dodgers', 'Giants', 'Padres', 'Diamondbacks', 'Rockies',
]

const AGE_GROUPS = [
  'Youth (8–12)', 'Middle School (13–14)', 'High School (15–18)',
  'College', 'Adult League', 'Pro / Semi-Pro',
]

const PLAYER_TYPES: { value: PlayerType; label: string; emoji: string; desc: string }[] = [
  { value: 'player', label: 'Player', emoji: '⚾', desc: 'I play the game' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👧', desc: 'My kid plays' },
  { value: 'coach', label: 'Coach', emoji: '📋', desc: 'I coach a team' },
  { value: 'fan', label: 'Fan', emoji: '🏟️', desc: 'I love the game' },
]

interface Props {
  profile: Profile
}

export function OnboardingForm({ profile }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1
  const [playerType, setPlayerType] = useState<PlayerType | null>(null)

  // Step 2
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [customTeam, setCustomTeam] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  function toggleTeam(team: string) {
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    )
  }

  function addCustomTeam() {
    const trimmed = customTeam.trim()
    if (!trimmed || selectedTeams.includes(trimmed)) return
    setSelectedTeams(prev => [...prev, trimmed])
    setCustomTeam('')
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        player_type: playerType,
        age_group: ageGroup || null,
        favorite_teams: selectedTeams,
        onboarding_complete: true,
      })
      .eq('id', profile.id)

    if (error) {
      toast.error('Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    setStep(3)
  }

  const TOTAL_STEPS = 2
  const progress = (step / TOTAL_STEPS) * 100

  if (step === 3) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-8">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-wide uppercase">You&apos;re in the lineup!</h2>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
            Your profile is set up. Start exploring complexes and leave your first review to earn points.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8"
            onClick={() => router.push('/complexes')}
          >
            Browse Complexes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <button
            onClick={() => router.push(`/profile/${profile.username}`)}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            View my profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: Who are you? */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase">Who are you at the field?</h2>
            <p className="text-muted-foreground text-sm mt-1">This helps us personalize your experience.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PLAYER_TYPES.map(({ value, label, emoji, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlayerType(value)}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ${
                  playerType === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="font-bold text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={!playerType}
            onClick={() => setStep(2)}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <button
            type="button"
            onClick={() => { setPlayerType(null); setStep(2) }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Step 2: Baseball world */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase">Your Baseball World</h2>
            <p className="text-muted-foreground text-sm mt-1">Select any teams you follow — MLB, local, or your own.</p>
          </div>

          {/* MLB quick-picks */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">MLB Teams</p>
            <div className="flex flex-wrap gap-2">
              {MLB_TEAMS.map(team => (
                <button
                  key={team}
                  type="button"
                  onClick={() => toggleTeam(team)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedTeams.includes(team)
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Custom team add */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Local / Youth Teams</p>
            <div className="flex gap-2">
              <Input
                value={customTeam}
                onChange={e => setCustomTeam(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTeam() } }}
                placeholder="Type a team name and press Enter"
              />
              <Button type="button" variant="outline" onClick={addCustomTeam} disabled={!customTeam.trim()}>
                Add
              </Button>
            </div>
            {selectedTeams.filter(t => !MLB_TEAMS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTeams.filter(t => !MLB_TEAMS.includes(t)).map(team => (
                  <span
                    key={team}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    {team}
                    <button
                      type="button"
                      onClick={() => toggleTeam(team)}
                      className="hover:text-red-600 ml-0.5 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Age group (players only) */}
          {playerType === 'player' && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Your Level</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(group => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setAgeGroup(ageGroup === group ? '' : group)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      ageGroup === group
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <Button
              className="flex-1"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? 'Saving…' : "Let's go!"}
              {!saving && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip and finish
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Geocodes a street address using the Google Geocoding API.
 * Uses GOOGLE_PLACES_API_KEY (server-side only).
 * Returns { lat, lng } on success, null on failure.
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip?: string | null,
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn('geocodeAddress: GOOGLE_PLACES_API_KEY not set')
    return null
  }

  const query = [address, city, state, zip].filter(Boolean).join(', ')
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`

  try {
    const res = await fetch(url)
    const data = await res.json() as {
      status: string
      results: { geometry: { location: { lat: number; lng: number } } }[]
    }

    if (data.status !== 'OK' || !data.results?.[0]) {
      console.warn('Geocoding returned no results:', data.status, 'for', query)
      return null
    }

    return data.results[0].geometry.location
  } catch (err) {
    console.error('Geocoding error for', query, err)
    return null
  }
}

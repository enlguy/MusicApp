"use client"

import { Artist } from '@/lib/types'

// This prompt instructs ChatGPT to return similar artists in a specific JSON format
const SYSTEM_PROMPT = `
You are a music recommendation expert who provides similar artists based on user input.
Always respond with JSON only in the exact format:
{
  "artists": [
    {
      "name": "Artist Name",
      "genre": "Primary Genre",
      "description": "Brief 1-2 sentence description of the artist",
      "popularity": 85,
      "years_active": "1990-present"
    }
  ]
}
Provide 5 similar artists. Ensure description is concise. Popularity should be a number between 1-100.
`

export async function fetchSimilarArtists(artistName: string): Promise<Artist[]> {
  try {
    const response = await fetch('/api/similar-artists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        artistName,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.artists || []
  } catch (error) {
    console.error('Error fetching similar artists:', error)
    throw error
  }
}
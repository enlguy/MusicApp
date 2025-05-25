import { NextResponse } from 'next/server'
import { OpenAIResponse } from '@/lib/types'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is missing')
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const { artistName } = await request.json()

    if (!artistName || typeof artistName !== 'string') {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
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
              Provide exactly 5 similar artists to "${artistName}". 
              Ensure description is concise and helpful. 
              Popularity should be a number between 1-100.
              Do not include any explanations, only return the JSON.
            `,
          },
          {
            role: 'user',
            content: `Find 5 similar artists to ${artistName}`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch from OpenAI')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Parse the JSON content from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonContent = jsonMatch ? jsonMatch[0] : content
      const parsedData: OpenAIResponse = JSON.parse(jsonContent)

      // Add IDs to each artist
      const artistsWithIds = parsedData.artists.map((artist) => ({
        ...artist,
        id: `${artist.name.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 5)}`,
      }))

      return NextResponse.json({ artists: artistsWithIds })
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, content)
      return NextResponse.json(
        { error: 'Failed to parse artist recommendations' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in similar-artists API route:', error)
    return NextResponse.json(
      { error: 'Failed to get artist recommendations' },
      { status: 500 }
    )
  }
}
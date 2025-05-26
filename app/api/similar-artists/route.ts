import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenAIResponse } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is missing");
    return NextResponse.json(
      { error: "OpenAI API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const { artistName } = await request.json();

    if (!artistName || typeof artistName !== "string") {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    console.log("Fetching similar artists for:", artistName);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are a music recommendation expert. You must respond with valid JSON only, no additional text or formatting.

Return exactly this JSON structure with 5 similar artists to the requested artist:

{
  "artists": [
    {
      "name": "Artist Name",
      "genre": "Primary Genre",
      "description": "Brief 1-2 sentence description of the artist and their style",
      "popularity": 85,
      "soundcloud_url": "https://soundcloud/artist",
    }
  ]
}

Rules:
- Always return exactly 5 artists
- Never include the original artist in the list
- Popularity must be a number between 1-100
- Description should be 1-2 sentences maximum
- The SoundCloud URL must be a valid URL
- The SoundCloud artist page should be a verified artist page
- Only return the JSON, no other text or markdown formatting`,
        },
        {
          role: "user",
          content: `Find 5 similar artists to ${artistName}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response");
      return NextResponse.json(
        { error: "No content received from OpenAI" },
        { status: 500 }
      );
    }

    console.log("Raw OpenAI content:", content);

    // Parse the JSON content from the response
    try {
      // Clean the content by removing any markdown code blocks or extra text
      let cleanContent = content.trim();

      // Remove markdown code block markers if present
      cleanContent = cleanContent
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");

      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      console.log("Cleaned content for parsing:", cleanContent);

      const parsedData: OpenAIResponse = JSON.parse(cleanContent);

      // Validate the parsed data
      if (!parsedData.artists || !Array.isArray(parsedData.artists)) {
        throw new Error("Invalid response format: missing artists array");
      }

      if (parsedData.artists.length === 0) {
        throw new Error("No artists returned in response");
      }

      // Add IDs to each artist and validate required fields
      const artistsWithIds = parsedData.artists.map((artist, index) => {
        if (!artist.name) {
          throw new Error(`Artist at index ${index} is missing name`);
        }

        return {
          ...artist,
          id: `${artist.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
          genre: artist.genre || "Unknown",
          description: artist.description || "No description available",
          popularity:
            typeof artist.popularity === "number"
              ? Math.max(1, Math.min(100, artist.popularity))
              : 50,
          years_active: artist.years_active || "Unknown",
        };
      });

      console.log("Successfully processed artists:", artistsWithIds.length);

      return NextResponse.json({ artists: artistsWithIds });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Content that failed to parse:", content);

      return NextResponse.json(
        {
          error: "Failed to parse artist recommendations from OpenAI response",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in similar-artists API route:", error);

    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message);

      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      } else if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your OpenAI configuration." },
          { status: 401 }
        );
      } else if (error.status === 402) {
        return NextResponse.json(
          { error: "Insufficient credits. Please check your OpenAI account." },
          { status: 402 }
        );
      } else {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.message}` },
          { status: error.status || 500 }
        );
      }
    }

    // Handle other errors
    let errorMessage = "Failed to get artist recommendations";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

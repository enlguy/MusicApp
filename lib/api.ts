"use client";

import { Artist } from "@/lib/types";

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
`;

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSimilarArtists(
  artistName: string
): Promise<Artist[]> {
  try {
    // Rate limiting: ensure we don't make requests too quickly
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await delay(waitTime);
    }

    lastRequestTime = Date.now();

    console.log("Making request to:", "/api/similar-artists");
    console.log("Request payload:", { artistName });

    const response = await fetch("/api/similar-artists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ artistName }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);

      let errorMessage = `API error: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error, use the status text
        errorMessage = `${response.status}: ${response.statusText}`;
      }

      // Handle specific error codes
      if (response.status === 404) {
        throw new Error(
          "API endpoint not found. Check your routing configuration."
        );
      } else if (response.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again."
        );
      } else if (response.status === 500) {
        throw new Error(`Server error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    const data = await response.json();
    console.log("Received data:", data);

    if (!data.artists || !Array.isArray(data.artists)) {
      throw new Error("Invalid response format from API");
    }

    return data.artists;
  } catch (error) {
    console.error("Error in fetchSimilarArtists:", error);
    throw error;
  }
}

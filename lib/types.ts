export interface Artist {
  name: string;
  id?: string;
  url?: string;
  genre?: string;
  description?: string;
  popularity?: number;
  years_active?: string;
  similar_artists?: string[];
  soundcloud_url?: string;
}

export interface OpenAIResponse {
  artists: Artist[];
}

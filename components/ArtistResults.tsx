"use client";

import React from "react";
import { Music2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Artist } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/motion";
import Link from "next/link";

interface ArtistResultsProps {
  artists: Artist[];
  onArtistClick: (artist: Artist) => void;
}

export default function ArtistResults({
  artists,
  onArtistClick,
}: ArtistResultsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map((artist, index) => (
        <motion.div
          key={`${artist.name}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary/20 to-purple-500/30",
                    "text-primary"
                  )}
                >
                  <Music2 className="h-6 w-6" />
                </div>
                {artist.genre && (
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground">
                    {artist.genre}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold mb-2">{artist.name}</h3>
                <Button className="bg-blue-600">
                  <a
                    rel="external"
                    target="_blank"
                    href={artist.soundcloud_url}
                  >
                    SoundCloud
                  </a>
                </Button>
              </div>
              console.log({artist.soundcloud_url})
              {artist.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                  {artist.description}
                </p>
              )}
              {artist.popularity && (
                <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${artist.popularity}%` }}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between p-4 pt-0 gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => onArtistClick(artist)}
              >
                Explore Similar
              </Button>

              {artist.url && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open artist page</span>
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

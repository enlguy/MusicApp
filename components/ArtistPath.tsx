"use client"

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Artist } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ArtistPathProps {
  path: Artist[]
  onNavigate: (index: number) => void
}

export default function ArtistPath({ path, onNavigate }: ArtistPathProps) {
  if (path.length <= 1) return null
  
  return (
    <div className="overflow-x-auto scrollbar-hide py-2">
      <nav className="flex items-center space-x-1 text-sm">
        {path.map((artist, index) => (
          <React.Fragment key={`${artist.name}-${index}`}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground mx-1" />
            )}
            <button
              onClick={() => onNavigate(index)}
              className={cn(
                "px-3 py-1 rounded-full whitespace-nowrap transition-all hover:bg-secondary/80",
                index === path.length - 1
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {artist.name}
            </button>
          </React.Fragment>
        ))}
      </nav>
    </div>
  )
}
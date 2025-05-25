"use client"

import React, { useState } from 'react'
import { Search, Music, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ArtistResults from '@/components/ArtistResults'
import ArtistPath from '@/components/ArtistPath'
import { Artist } from '@/lib/types'
import { fetchSimilarArtists } from '@/lib/api'
import { motion, AnimatePresence } from '@/lib/motion'

export default function ArtistExplorer() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState<Artist[]>([])
  const [results, setResults] = useState<Artist[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const artists = await fetchSimilarArtists(inputValue)
      setResults(artists)
      setCurrentPath([{ name: inputValue, id: 'root' }])
    } catch (err) {
      setError('Failed to fetch artists. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArtistClick = async (artist: Artist) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newArtists = await fetchSimilarArtists(artist.name)
      setResults(newArtists)
      setCurrentPath([...currentPath, artist])
    } catch (err) {
      setError('Failed to fetch similar artists. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToArtist = async (index: number) => {
    if (index >= currentPath.length - 1) return
    
    const artist = currentPath[index]
    setIsLoading(true)
    setError(null)
    
    try {
      const artists = await fetchSimilarArtists(artist.name)
      setResults(artists)
      setCurrentPath(currentPath.slice(0, index + 1))
    } catch (err) {
      setError('Failed to navigate to artist. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border/50">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              type="text"
              placeholder="Enter a musical artist..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 bg-background/70 border-border/60 focus:border-primary transition-all"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="group transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Music className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            Discover
          </Button>
        </form>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {currentPath.length > 0 && (
        <ArtistPath path={currentPath} onNavigate={navigateToArtist} />
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Discovering similar artists...</p>
            </div>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArtistResults artists={results} onArtistClick={handleArtistClick} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
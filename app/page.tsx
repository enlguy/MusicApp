import ArtistExplorer from '@/components/ArtistExplorer';
import { ThemeProvider } from '@/components/theme-provider';

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Harmony Explorer
            </h1>
            <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover new artists through musical connections
            </p>
          </header>
          
          <ArtistExplorer />
        </div>
      </main>
    </ThemeProvider>
  );
}
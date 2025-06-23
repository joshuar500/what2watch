'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Shuffle, Tv, Filter, Calendar, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Movie } from '@/types/movie'
import { tmdbClient, WatchProvider } from '@/lib/tmdb'
import { MovieCard } from './MovieCard'
import { cn } from '@/lib/utils'

interface MovieSelectorProps {
  selectedMovies: Movie[]
  onMoviesChange: (movies: Movie[]) => void
  maxSelections?: number
  className?: string
}

// Popular streaming providers with their TMDB IDs
const POPULAR_STREAMING_PROVIDERS = [
  { id: 8, name: 'Netflix', logo: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' },
  { id: 337, name: 'Disney Plus', logo: '/7Fl8ylPDclt3ZYgNbW2t7rbZE9I.jpg' },
  { id: 15, name: 'Hulu', logo: '/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' },
  { id: 119, name: 'Amazon Prime', logo: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg' },
  { id: 384, name: 'HBO Max', logo: '/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg' },
  { id: 2, name: 'Apple TV+', logo: '/peURlLlr8jggOwK53fJ5wdQl05y.jpg' },
  { id: 531, name: 'Paramount+', logo: '/xbhHa1YgtpwhC8lb1NQ3kb1NQ3ACVcLd.jpg' }
]

// Decade options
const DECADE_OPTIONS = [
  { value: '2020s', label: '2020s', start: '2020-01-01', end: '2029-12-31' },
  { value: '2010s', label: '2010s', start: '2010-01-01', end: '2019-12-31' },
  { value: '2000s', label: '2000s', start: '2000-01-01', end: '2009-12-31' },
  { value: '1990s', label: '1990s', start: '1990-01-01', end: '1999-12-31' },
  { value: '1980s', label: '1980s', start: '1980-01-01', end: '1989-12-31' },
  { value: '1970s', label: '1970s', start: '1970-01-01', end: '1979-12-31' },
  { value: 'all', label: 'All Time', start: '', end: '' }
]

export function MovieSelector({
  selectedMovies,
  onMoviesChange,
  maxSelections = 3,
  className
}: MovieSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedStreamingProviders, setSelectedStreamingProviders] = useState<number[]>([])
  const [selectedDecade, setSelectedDecade] = useState<string>('1990s') // Default to 90s
  const [movieProviders, setMovieProviders] = useState<Record<number, WatchProvider[]>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch streaming providers for a list of movies
  const fetchMovieProviders = useCallback(async (movies: Movie[]) => {
    const providerMap: Record<number, WatchProvider[]> = {}

    // Only fetch for movies we don't already have data for
    const moviesToFetch = movies.filter(movie => !movieProviders[movie.id])

    if (moviesToFetch.length === 0) return

    // Fetch in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < moviesToFetch.length; i += batchSize) {
      const batch = moviesToFetch.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (movie) => {
          try {
            const providers = await tmdbClient.getMovieWatchProviders(movie.id)
            const usProviders = providers.results.US?.flatrate || []
            providerMap[movie.id] = usProviders
          } catch (error) {
            console.error(`Error fetching providers for movie ${movie.id}:`, error)
            providerMap[movie.id] = []
          }
        })
      )

      // Small delay between batches
      if (i + batchSize < moviesToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setMovieProviders(prev => ({ ...prev, ...providerMap }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove movieProviders dependency to prevent infinite loops

  // Load movies based on selected decade and filters
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true)

        // Sort options for variety
        const sortOptions = [
          'release_date.asc',
          'release_date.desc',
          'vote_count.asc',  // Lower vote count = more obscure
          'original_title.asc',
          'original_title.desc',
          'popularity.asc'   // Lower popularity = more obscure
        ]

        const allMovies: Movie[] = []

        // Get selected decade configuration
        const decadeConfig = DECADE_OPTIONS.find(d => d.value === selectedDecade)

        // Determine if we're filtering by streaming providers
        const hasStreamingFilter = selectedStreamingProviders.length > 0

        // Determine how many pages to fetch based on streaming filter
        const pagesToFetch = hasStreamingFilter ? 10 : 5 // More pages when filtering by streaming

        // Fetch from multiple pages with different sort orders
        for (let i = 0; i < pagesToFetch; i++) {
          const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)]
          const randomPage = Math.floor(Math.random() * 20) + 1 // Random page 1-20

          try {
            const discoveryParams: Record<string, string | number> = {
              sortBy: randomSort,
              page: randomPage,
              voteCountGte: 10,      // Has some votes
              voteCountLte: hasStreamingFilter ? 5000 : 1000, // Allow more mainstream movies when filtering by streaming
              popularityLte: hasStreamingFilter ? 200 : 50   // Allow more popular movies when filtering by streaming
            }

            // Add decade filter if not "all"
            if (decadeConfig && decadeConfig.start && decadeConfig.end) {
              discoveryParams.primaryReleaseDateGte = decadeConfig.start
              discoveryParams.primaryReleaseDateLte = decadeConfig.end
            }

            // Add streaming filter if providers are selected
            if (hasStreamingFilter) {
              discoveryParams.withWatchProviders = selectedStreamingProviders.join(',')
              discoveryParams.watchRegion = 'US'
              discoveryParams.withWatchMonetizationTypes = 'flatrate'
            }

            const response = await tmdbClient.discoverMovies(discoveryParams)
            allMovies.push(...response.results)
          } catch (error) {
            console.error('Error fetching movies page:', error)
          }
        }

        // Remove duplicates and shuffle
        const uniqueMovies = allMovies.filter((movie, index, self) =>
          index === self.findIndex(m => m.id === movie.id)
        )

        // Shuffle the results for more randomness
        const shuffledMovies = uniqueMovies.sort(() => 0.5 - Math.random())
        const finalMovies = shuffledMovies.slice(0, hasStreamingFilter ? 60 : 40) // More movies when streaming filter is active

        setMovies(finalMovies)

        // Fetch streaming providers for these movies
        fetchMovieProviders(finalMovies)
      } catch (error) {
        console.error('Error loading movies:', error)
        // Fallback to a search based on decade
        try {
          const decadeYear = selectedDecade === '1990s' ? '1990' : selectedDecade.slice(0, 4)
          const fallbackResponse = await tmdbClient.searchMovies(decadeYear)

          let filteredMovies = fallbackResponse.results

          // Filter by decade if not "all"
          if (selectedDecade !== 'all') {
            const decadeConfig = DECADE_OPTIONS.find(d => d.value === selectedDecade)
            if (decadeConfig && decadeConfig.start && decadeConfig.end) {
              const startYear = parseInt(decadeConfig.start.split('-')[0])
              const endYear = parseInt(decadeConfig.end.split('-')[0])

              filteredMovies = fallbackResponse.results.filter(movie => {
                const year = new Date(movie.release_date).getFullYear()
                return year >= startYear && year <= endYear
              })
            }
          }

          const fallbackMovies = filteredMovies.slice(0, 20)
          setMovies(fallbackMovies)
          fetchMovieProviders(fallbackMovies)
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStreamingProviders, selectedDecade]) // Remove fetchMovieProviders dependency

  // Debounced search - prioritize movies from selected decade
  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsLoading(true)

      const response = await tmdbClient.searchMovies(query)

      // Get selected decade configuration
      const decadeConfig = DECADE_OPTIONS.find(d => d.value === selectedDecade)

      // Prioritize movies from selected decade in search results
      const sortedResults = response.results.sort((a, b) => {
        const aYear = new Date(a.release_date).getFullYear()
        const bYear = new Date(b.release_date).getFullYear()

        let aInDecade = false
        let bInDecade = false

        if (decadeConfig && decadeConfig.start && decadeConfig.end) {
          const startYear = parseInt(decadeConfig.start.split('-')[0])
          const endYear = parseInt(decadeConfig.end.split('-')[0])
          aInDecade = aYear >= startYear && aYear <= endYear
          bInDecade = bYear >= startYear && bYear <= endYear
        }

        if (aInDecade && !bInDecade) return -1
        if (!aInDecade && bInDecade) return 1

        // If both or neither are in selected decade, sort by popularity (lower = more obscure)
        return a.popularity - b.popularity
      })

      const finalResults = sortedResults.slice(0, 20)
      setSearchResults(finalResults)

      // Fetch streaming providers for search results
      fetchMovieProviders(finalResults)
    } catch (error) {
      console.error('Error searching movies:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDecade]) // Add selectedDecade dependency

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMovies(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchMovies])

  const handleMovieSelect = (movie: Movie) => {
    const isSelected = selectedMovies.some(m => m.id === movie.id)

    if (isSelected) {
      // Remove movie
      onMoviesChange(selectedMovies.filter(m => m.id !== movie.id))
    } else if (selectedMovies.length < maxSelections) {
      // Add movie
      onMoviesChange([...selectedMovies, movie])
    }
  }

  const clearSelection = () => {
    onMoviesChange([])
  }

  const shuffleMovies = () => {
    setMovies(prev => [...prev].sort(() => 0.5 - Math.random()))
  }

  const toggleStreamingProvider = (providerId: number) => {
    setSelectedStreamingProviders(prev => {
      const newProviders = prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]

      return newProviders
    })
  }

  const moviesToShow = searchQuery.trim() ? searchResults : movies
  const canSelectMore = selectedMovies.length < maxSelections

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
      </div>

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Filter className="w-4 h-4" />
          Filters
        </motion.button>

        <div className="flex items-center justify-center gap-2 mt-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-600 dark:text-purple-400">
            {DECADE_OPTIONS.find(d => d.value === selectedDecade)?.label} Movies
          </span>
          {selectedStreamingProviders.length > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <Tv className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {selectedStreamingProviders.length} Streaming Service{selectedStreamingProviders.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {!searchQuery && (
          <button
            onClick={shuffleMovies}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        )}
      </div>

      {/* Slide-out Filter Menu */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Decade Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <label className="font-semibold text-gray-900 dark:text-white">Decade</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DECADE_OPTIONS.map((decade) => (
                      <button
                        key={decade.value}
                        onClick={() => setSelectedDecade(decade.value)}
                        className={cn(
                          'p-3 rounded-lg border text-sm font-medium transition-all',
                          selectedDecade === decade.value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        {decade.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Streaming Filter */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-blue-600" />
                    <label className="font-semibold text-gray-900 dark:text-white">Streaming Services</label>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select streaming services to filter movies (US region):
                    </p>
                    <div className="space-y-2">
                      {POPULAR_STREAMING_PROVIDERS.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => toggleStreamingProvider(provider.id)}
                          className={cn(
                            'flex items-center gap-3 w-full p-3 rounded-lg border transition-all',
                            selectedStreamingProviders.includes(provider.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <img
                            src={tmdbClient.getProviderLogoUrl(provider.logo, 'w45') || ''}
                            alt={provider.name}
                            className="w-8 h-8 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span className="text-sm font-medium">{provider.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedStreamingProviders.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✅ Filtering by {selectedStreamingProviders.length} service{selectedStreamingProviders.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedDecade('1990s')
                      setSelectedStreamingProviders([])
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for specific movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Movies Grid */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
          {searchQuery.trim()
            ? 'Search Results'
            : selectedStreamingProviders.length > 0
              ? `Streaming ${DECADE_OPTIONS.find(d => d.value === selectedDecade)?.label} Movies`
              : `${DECADE_OPTIONS.find(d => d.value === selectedDecade)?.label} Movies`}
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : moviesToShow.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {moviesToShow.map((movie) => {
              const isSelected = selectedMovies.some(m => m.id === movie.id)
              const canSelect = canSelectMore || isSelected

              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSelected={isSelected}
                  onSelect={canSelect ? handleMovieSelect : undefined}
                  className={cn(
                    !canSelect && 'opacity-50 cursor-not-allowed'
                  )}
                  streamingProviders={movieProviders[movie.id] || []}
                  show90sBadge={true}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery.trim()
              ? 'No movies found. Try a different search term.'
              : 'No movies available.'}
          </div>
        )}
      </div>
    </div>
  )
} 
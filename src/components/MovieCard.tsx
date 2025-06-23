'use client'

import Image from 'next/image'
import { Star, Calendar, Users, Tv } from 'lucide-react'
import { Movie } from '@/types/movie'
import { tmdbClient, WatchProvider } from '@/lib/tmdb'
import { formatRating, cn } from '@/lib/utils'

interface MovieCardProps {
  movie: Movie
  isSelected?: boolean
  onSelect?: (movie: Movie) => void
  className?: string
  showDetails?: boolean
  streamingProviders?: WatchProvider[]
  show90sBadge?: boolean
}

export function MovieCard({
  movie,
  isSelected = false,
  onSelect,
  className,
  showDetails = true,
  streamingProviders = [],
  show90sBadge = false
}: MovieCardProps) {
  const posterUrl = tmdbClient.getPosterUrl(movie.poster_path)
  const year = new Date(movie.release_date).getFullYear()
  const is90s = year >= 1990 && year <= 1999

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        className
      )}
      onClick={() => onSelect?.(movie)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Rating overlay */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{formatRating(movie.vote_average)}</span>
        </div>

        {/* Badges - positioned to avoid overlap */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 z-10">
          {(show90sBadge && is90s) && (
            <div className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              90s
            </div>
          )}
          {streamingProviders.length > 0 && (
            <div className="bg-green-500 text-white px-1 py-1 rounded-md text-xs font-bold flex items-center">
              <Tv className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Streaming providers - positioned on the right side */}
        {streamingProviders.length > 0 && (
          <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 z-10 max-w-[80px]">
            {streamingProviders.slice(0, 3).map((provider) => (
              <div
                key={provider.provider_id}
                className="relative"
                title={provider.provider_name}
              >
                <img
                  src={tmdbClient.getProviderLogoUrl(provider.logo_path, 'w45') || ''}
                  alt={provider.provider_name}
                  className="w-6 h-6 rounded shadow-lg border border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ))}
            {streamingProviders.length > 3 && (
              <div className="w-6 h-6 bg-gray-800/80 text-white rounded text-xs flex items-center justify-center font-bold shadow-lg">
                +{streamingProviders.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movie Info */}
      {showDetails && (
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{movie.vote_count}</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {movie.overview}
          </p>

          {/* Streaming info in details */}
          {streamingProviders.length > 0 && showDetails && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400">Streaming on:</span>
                {streamingProviders.slice(0, 4).map((provider) => (
                  <div key={provider.provider_id} className="flex items-center gap-1">
                    <img
                      src={tmdbClient.getProviderLogoUrl(provider.logo_path, 'w45') || ''}
                      alt={provider.provider_name}
                      className="w-4 h-4 rounded"
                      title={provider.provider_name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{provider.provider_name}</span>
                  </div>
                ))}
                {streamingProviders.length > 4 && (
                  <span className="text-xs text-gray-500">+{streamingProviders.length - 4} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
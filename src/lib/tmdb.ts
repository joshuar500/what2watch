import { Movie, TMDBSearchResponse, TMDBGenresResponse } from '@/types/movie'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Use Bearer token from environment - this is the API Read Access Token from TMDB
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhOWY3NmYyYjY5Mzc3OWRlOTc0MjU3NDAxODc3NDdlOSIsIm5iZiI6MTQ3NTk1MTQ5Ny44NTYsInN1YiI6IjU3ZjkzYjg5YzNhMzY4NTBkODAwNDcyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qhDVY-WsvP0WS8UbWk3o6cnBbnwjpYwhVfHKUFMzspk'

export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProvidersResponse {
  results: {
    [region: string]: {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}

export interface AllWatchProvidersResponse {
  results: WatchProvider[];
}

export class TMDBClient {
  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    const url = `${TMDB_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('TMDB API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`TMDB API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching from TMDB:', error)
      throw error
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    const endpoint = `/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    return this.fetchFromTMDB<TMDBSearchResponse>(endpoint)
  }

  async getPopularMovies(page: number = 1): Promise<TMDBSearchResponse> {
    const endpoint = `/movie/popular?page=${page}`
    return this.fetchFromTMDB<TMDBSearchResponse>(endpoint)
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse> {
    const endpoint = `/trending/movie/${timeWindow}`
    return this.fetchFromTMDB<TMDBSearchResponse>(endpoint)
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    const endpoint = `/movie/${movieId}`
    return this.fetchFromTMDB<Movie>(endpoint)
  }

  async getGenres(): Promise<TMDBGenresResponse> {
    const endpoint = '/genre/movie/list'
    return this.fetchFromTMDB<TMDBGenresResponse>(endpoint)
  }

  async getMovieWatchProviders(movieId: number): Promise<WatchProvidersResponse> {
    const endpoint = `/movie/${movieId}/watch/providers`
    return this.fetchFromTMDB<WatchProvidersResponse>(endpoint)
  }

  async getAllWatchProviders(region: string = 'US'): Promise<AllWatchProvidersResponse> {
    const endpoint = `/watch/providers/movie?watch_region=${region}`
    return this.fetchFromTMDB<AllWatchProvidersResponse>(endpoint)
  }

  async discoverMovies(params: {
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
    primaryReleaseDateGte?: string; // YYYY-MM-DD format
    primaryReleaseDateLte?: string; // YYYY-MM-DD format
    voteCountGte?: number;
    voteCountLte?: number;
    popularityLte?: number;
    withWatchProviders?: string; // Comma or pipe separated provider IDs
    watchRegion?: string; // ISO 3166-1 country code
    withWatchMonetizationTypes?: string; // flatrate|free|ads|rent|buy
  } = {}): Promise<TMDBSearchResponse> {
    const queryParams = new URLSearchParams()

    if (params.genre) queryParams.append('with_genres', params.genre.toString())
    if (params.year) queryParams.append('year', params.year.toString())
    if (params.sortBy) queryParams.append('sort_by', params.sortBy)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.primaryReleaseDateGte) queryParams.append('primary_release_date.gte', params.primaryReleaseDateGte)
    if (params.primaryReleaseDateLte) queryParams.append('primary_release_date.lte', params.primaryReleaseDateLte)
    if (params.voteCountGte) queryParams.append('vote_count.gte', params.voteCountGte.toString())
    if (params.voteCountLte) queryParams.append('vote_count.lte', params.voteCountLte.toString())
    if (params.popularityLte) queryParams.append('popularity.lte', params.popularityLte.toString())
    if (params.withWatchProviders) queryParams.append('with_watch_providers', params.withWatchProviders)
    if (params.watchRegion) queryParams.append('watch_region', params.watchRegion)
    if (params.withWatchMonetizationTypes) queryParams.append('with_watch_monetization_types', params.withWatchMonetizationTypes)

    const endpoint = `/discover/movie?${queryParams.toString()}`
    return this.fetchFromTMDB<TMDBSearchResponse>(endpoint)
  }

  // Utility methods for image URLs
  getPosterUrl(posterPath: string | null, size: 'w154' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!posterPath) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
  }

  getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!backdropPath) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`
  }

  getProviderLogoUrl(logoPath: string | null, size: 'w45' | 'w92' | 'w154' | 'w185' | 'original' = 'w92'): string | null {
    if (!logoPath) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${logoPath}`
  }
}

// Export a singleton instance
export const tmdbClient = new TMDBClient() 
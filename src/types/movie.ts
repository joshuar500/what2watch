export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBGenresResponse {
  genres: Genre[];
}

// Game related types
export interface GamePlayer {
  id: string;
  name: string;
  selectedMovies: Movie[];
}

export interface GameState {
  id: string;
  players: [GamePlayer, GamePlayer];
  currentPlayer: number;
  diceRolls: number[];
  winningNumber?: number;
  winningMovie?: Movie;
  status: 'waiting' | 'selecting' | 'playing' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface DiceRoll {
  value: number;
  timestamp: Date;
  playerId: string;
} 
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, ArrowRight } from 'lucide-react'
import { Movie } from '@/types/movie'
import { MovieSelector } from '@/components/MovieSelector'
import { DiceRoller } from '@/components/DiceRoller'
import { MovieCard } from '@/components/MovieCard'
import { checkForWin } from '@/lib/utils'



type GamePhase = 'welcome' | 'player1-selecting' | 'player2-selecting' | 'ready' | 'playing' | 'finished'

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('welcome')
  const [player1Movies, setPlayer1Movies] = useState<Movie[]>([])
  const [player2Movies, setPlayer2Movies] = useState<Movie[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [diceRolls, setDiceRolls] = useState<number[]>([])
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null)

  const allMovies = [...player1Movies, ...player2Movies]

  const handleDiceRoll = (value: number) => {
    const newRolls = [...diceRolls, value]
    setDiceRolls(newRolls)

    const winningNumber = checkForWin(newRolls)
    if (winningNumber && allMovies[winningNumber - 1]) {
      setWinningMovie(allMovies[winningNumber - 1])
      setGamePhase('finished')
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }
  }

  const resetGame = () => {
    setGamePhase('welcome')
    setPlayer1Movies([])
    setPlayer2Movies([])
    setCurrentPlayer(1)
    setDiceRolls([])
    setWinningMovie(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              What To Watch
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {gamePhase === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-2xl mx-auto"
          >
            {/* Simplified Hero */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                What To Watch
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Can&apos;t decide what to watch? Let the dice choose! Each player picks 3 movies, then roll to see which one wins.
              </p>
            </div>

            {/* Quick How It Works */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <span>Pick Movies</span>
              </div>
              <ArrowRight className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <span>Roll Dice</span>
              </div>
              <ArrowRight className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">3</span>
                </div>
                <span>Watch!</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGamePhase('player1-selecting')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Start Playing
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {gamePhase === 'player1-selecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Player 1 - Pick 3 Movies
              </h2>
            </div>

            <MovieSelector
              selectedMovies={player1Movies}
              onMoviesChange={setPlayer1Movies}
              maxSelections={3}
            />
          </motion.div>
        )}

        {gamePhase === 'player2-selecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Player 2 - Pick 3 Movies (numbered 4-6)
              </h2>
            </div>

            {/* Movie Selection Grid - All 6 positions */}
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Movie Selection Progress
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {/* Player 1's movies (positions 1-3) */}
                {player1Movies.map((movie, index) => (
                  <div key={movie.id} className="relative">
                    <MovieCard
                      movie={movie}
                      showDetails={false}
                    />
                    <div className="absolute -top-1 -left-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {/* Player 2's movies (positions 4-6) - show selected ones or empty slots */}
                {Array.from({ length: 3 }).map((_, index) => {
                  const movieIndex = index
                  const movie = player2Movies[movieIndex]
                  const position = index + 4

                  if (movie) {
                    return (
                      <div key={movie.id} className="relative">
                        <MovieCard
                          movie={movie}
                          showDetails={false}
                        />
                        <div className="absolute -top-1 -left-1 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {position}
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div key={`empty-${position}`} className="relative">
                        <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
                          <div className="text-2xl text-gray-400 mb-1">?</div>
                          <div className="text-xs text-gray-500">Player 2</div>
                        </div>
                        <div className="absolute -top-1 -left-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {position}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>

            <MovieSelector
              selectedMovies={player2Movies}
              onMoviesChange={setPlayer2Movies}
              maxSelections={3}
            />
          </motion.div>
        )}

        {(gamePhase === 'ready' || gamePhase === 'playing') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Let&apos;s Roll!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {gamePhase === 'ready' ? 'Roll dice until someone gets a double' : `Player ${currentPlayer}&apos;s turn`}
              </p>
            </div>

            {/* Compact Movie Display */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-blue-600">Player 1 (1-3)</h3>
                <div className="grid grid-cols-3 gap-1">
                  {player1Movies.map((movie, index) => (
                    <div key={movie.id} className="relative">
                      <MovieCard movie={movie} showDetails={false} />
                      <div className="absolute -top-1 -left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-purple-600">Player 2 (4-6)</h3>
                <div className="grid grid-cols-3 gap-1">
                  {player2Movies.map((movie, index) => (
                    <div key={movie.id} className="relative">
                      <MovieCard movie={movie} showDetails={false} s />
                      <div className="absolute -top-1 -left-1 bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {index + 4}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dice Rolling */}
            <div className="text-center">
              <DiceRoller
                onRoll={(value) => {
                  setGamePhase('playing')
                  handleDiceRoll(value)
                }}
              />
            </div>

            {/* Roll History */}
            {diceRolls.length > 0 && (
              <div className="text-center">
                <h4 className="font-semibold mb-4">Roll History</h4>
                <div className="flex justify-center gap-2 flex-wrap">
                  {diceRolls.map((roll, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {roll}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {gamePhase === 'finished' && winningMovie && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-green-600">🎉 We Have a Winner! 🎉</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Time to watch...
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <MovieCard movie={winningMovie} className="transform scale-110" />
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Grab your popcorn and enjoy the show!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Sticky Bottom Bar for Selected Movies */}
      {(gamePhase === 'player1-selecting' || gamePhase === 'player2-selecting') && (
        (gamePhase === 'player1-selecting' ? player1Movies : player2Movies).length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {(gamePhase === 'player1-selecting' ? player1Movies : player2Movies).map((movie, index) => (
                        <div
                          key={movie.id}
                          className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-200 relative"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Movie number badge */}
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                            {gamePhase === 'player1-selecting' ? index + 1 : index + 4}
                          </div>
                        </div>
                      ))}
                      {/* Empty slots */}
                      {Array.from({ length: 3 - (gamePhase === 'player1-selecting' ? player1Movies : player2Movies).length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                        >
                          <span className="text-xs text-gray-400">
                            {gamePhase === 'player1-selecting'
                              ? player1Movies.length + index + 1
                              : player2Movies.length + index + 4
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                    <span>
                      {gamePhase === 'player1-selecting' ? 'Player 1' : 'Player 2'} - {(gamePhase === 'player1-selecting' ? player1Movies : player2Movies).length}/3 movies selected
                    </span>
                  </div>
                </div>
                {(gamePhase === 'player1-selecting' ? player1Movies : player2Movies).length === 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (gamePhase === 'player1-selecting') {
                        setGamePhase('player2-selecting')
                      } else {
                        setGamePhase('ready')
                      }
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    {gamePhase === 'player1-selecting' ? 'Continue to Player 2' : 'Start Game!'}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  )
}

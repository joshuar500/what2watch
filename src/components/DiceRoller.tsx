'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles } from 'lucide-react'
import { rollDice, cn } from '@/lib/utils'

interface DiceRollerProps {
  onRoll: (value: number) => void
  disabled?: boolean
  className?: string
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

export function DiceRoller({ onRoll, disabled = false, className }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const [animationValue, setAnimationValue] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleRoll = async () => {
    if (disabled || isRolling) return

    setIsRolling(true)

    // Animate through different dice faces
    const animationDuration = 1000
    const animationSteps = 10
    const stepDuration = animationDuration / animationSteps

    for (let i = 0; i < animationSteps; i++) {
      setAnimationValue(Math.floor(Math.random() * 6) + 1)
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }

    // Final roll
    const finalValue = rollDice()
    setCurrentValue(finalValue)
    setAnimationValue(finalValue)
    setIsRolling(false)

    // Brief celebration effect
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 800)

    onRoll(finalValue)
  }

  const DiceIcon = diceIcons[animationValue - 1]

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-4', className)}
      animate={showCelebration ? { y: [0, -5, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="relative">
        <motion.button
          onClick={handleRoll}
          disabled={disabled || isRolling}
          className={cn(
            'relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all duration-200',
            'hover:shadow-xl hover:from-blue-600 hover:to-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-4 focus:ring-blue-300'
          )}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          animate={{
            rotate: isRolling ? 360 : 0,
            scale: isRolling ? [1, 1.1, 1] : (showCelebration ? [1, 1.15, 1] : 1),
            x: isRolling ? [0, -2, 2, -1, 1, 0] : 0
          }}
          transition={{
            rotate: {
              duration: 0.5,
              repeat: isRolling ? Infinity : 0,
              ease: 'linear'
            },
            scale: {
              duration: isRolling ? 0.3 : 0.4,
              repeat: isRolling ? Infinity : (showCelebration ? 1 : 0),
              repeatType: isRolling ? 'reverse' : 'mirror'
            },
            x: {
              duration: 0.1,
              repeat: isRolling ? Infinity : 0
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={animationValue}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
            >
              <DiceIcon className="w-16 h-16" />
            </motion.div>
          </AnimatePresence>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-md" />
        </motion.button>

        {/* Celebration sparkles */}
        <AnimatePresence>
          {showCelebration && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, (Math.random() - 0.5) * 100]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <button
          onClick={handleRoll}
          disabled={disabled || isRolling}
          className={cn(
            'px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md',
            'hover:bg-blue-700 transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>

        {currentValue && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          >
            You rolled a {currentValue}!
          </motion.p>
        )}
      </div>
    </motion.div>
  )
} 
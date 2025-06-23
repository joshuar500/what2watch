import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatRating(rating: number): string {
  return (rating / 10 * 5).toFixed(1)
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function checkForWin(rolls: number[]): number | null {
  const counts = rolls.reduce((acc, roll) => {
    acc[roll] = (acc[roll] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  for (const [roll, count] of Object.entries(counts)) {
    if (count >= 2) {
      return parseInt(roll)
    }
  }

  return null
} 
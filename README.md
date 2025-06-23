# What To Watch App

A fun, interactive movie selection app where users compete to choose what movie to watch through an exciting dice-rolling competition system.

## 🎬 Features

### Core Gameplay
- **Movie Selection**: Users choose 3 movies from The Movie Database (TMDB) API
- **Competition System**: Two users compete by each selecting their 3 favorite movies
- **Dice Rolling Mechanic**: Roll dice (1-6) to determine the winning movie
  - Each number corresponds to one of the 6 total movies (3 from each user)
  - Must roll the same number **twice** for that movie to be selected as the winner
- **Community Battle**: Option to battle the entire userbase to determine the daily movie
- **Daily Discussion Forum**: Community forum to discuss the chosen movie of the day

### Technical Features
- Modern React/Next.js frontend with TypeScript
- Beautiful, responsive UI with Tailwind CSS
- Real-time multiplayer functionality
- User authentication and profiles
- Movie search and browsing via TMDB API
- Dice animation and sound effects
- Forum system for movie discussions
- Vote tracking and leaderboards

## 🏗️ Project Structure

```
choosemovie/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MovieCard.tsx
│   │   ├── DiceRoller.tsx
│   │   ├── MovieSelector.tsx
│   │   └── Forum.tsx
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Home/lobby
│   │   ├── game/           # Game pages
│   │   ├── community/      # Community battles
│   │   └── forum/          # Discussion forum
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API clients
│   │   ├── tmdb.ts         # TMDB API client
│   │   └── database.ts     # Database operations
│   ├── styles/             # CSS and styling
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── prisma/                 # Database schema
└── package.json
```

## 🎯 User Flow

1. **Registration/Login**: Users create accounts or sign in
2. **Movie Selection**: Each user searches and selects 3 movies from TMDB
3. **Game Setup**: Two users are matched for a competition
4. **Dice Rolling**: Players take turns rolling dice until someone gets a double
5. **Winner Selection**: The movie corresponding to the winning number is chosen
6. **Community Features**: 
   - Option to challenge the entire community
   - Daily movie selection for community discussion
7. **Forum Discussion**: Users discuss the chosen movie in dedicated threads

## 🎲 Game Rules

### Standard 1v1 Mode
- Each player selects 3 movies
- Movies are numbered 1-6 (Player 1: movies 1-3, Player 2: movies 4-6)
- Players alternate rolling a single die
- First player to roll the same number twice wins
- The movie corresponding to that number is selected for watching

### Community Battle Mode
- Multiple users submit their top 3 movies
- Community votes on the final 6 movies
- Random dice rolling determines the daily winner
- Winning movie becomes the "Movie of the Day"

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (animations)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API**: TMDB API for movie data
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm
- PostgreSQL database
- TMDB API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd choosemovie
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add the following variables:
```env
TMDB_API_KEY=your_tmdb_api_key
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Set up the database
```bash
pnpm prisma generate
pnpm prisma db push
```

5. Run the development server
```bash
pnpm dev
```

## 🎨 Design Philosophy

- **Simple but Beautiful**: Clean, modern interface that doesn't overwhelm users
- **Mobile-First**: Responsive design that works perfectly on all devices
- **Engaging Interactions**: Smooth animations and satisfying dice-rolling mechanics
- **Community-Focused**: Features that encourage discussion and social interaction

## 📋 Development Roadmap

### Phase 1: Core Features ✅
- [x] Project setup with Next.js and TypeScript
- [ ] TMDB API integration
- [ ] Basic movie search and selection
- [ ] Simple dice rolling mechanism
- [ ] 1v1 game mode

### Phase 2: Enhanced Gameplay
- [ ] User authentication
- [ ] Multiplayer matchmaking
- [ ] Animated dice rolling
- [ ] Game history and statistics

### Phase 3: Community Features
- [ ] Community battle mode
- [ ] Daily movie selection
- [ ] Forum system
- [ ] User profiles and leaderboards

### Phase 4: Polish & Optimization
- [ ] Advanced animations
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced forum features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎬 Movie Data

This product uses the TMDB API but is not endorsed or certified by TMDB.

![TMDB Logo](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg)

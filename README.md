# 🎮 Card Clash Online - Real-time Multiplayer Game

A full-stack, real-time multiplayer card game built with modern web technologies. Play with friends or against AI opponents in this classic card-matching game.

> **⚠️ Legal Disclaimer:**  
> This project is an **educational/portfolio demonstration** inspired by classic card-matching games. UNO® is a registered trademark of Mattel, Inc. This project is **not affiliated with, endorsed by, or sponsored by Mattel**. This is a non-commercial, fan-made implementation created solely for learning and portfolio purposes. All game mechanics are based on publicly known rules of traditional card games.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 📊 Development Status

**Current Phase:** Phase 2 Complete ✅  
**Next Phase:** Phase 3 - Game Layout Redesign

- ✅ Phase 1: Core game mechanics (multiplayer, bots, all cards)
- ✅ Phase 2: Authentication + database + friend system  
- 📜 Phase 3: Circular table layout redesign
- 📜 Phase 4: Production deployment
- 📜 Phase 5: Polish & features
- 📜 Phase 6: Portfolio presentation

**See [PROGRESS.md](PROGRESS.md) for detailed development log.**


## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](#) _(Add your link)_
- **Backend**: [Deployed on Render](#) _(Add your link)_

## ✨ Features

- ✅ **Real-time multiplayer** - Play with 2-4 players using WebSockets
- ✅ **AI Opponents** - Add bots to fill empty slots or practice solo
- ✅ **Full card-matching ruleset** - Draw 2, Draw 4, Skip, Reverse, Wild cards
- ✅ **Room system** - Create/join private rooms with friends
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Server-side validation** - No cheating, all logic runs on backend
- ✅ **Turn-based gameplay** - Automatic turn management with visual indicators

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL** - Relational database for users and game history
- **Redis** - In-memory storage for real-time game state
- **Prisma** - Type-safe database ORM

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - WebSocket client
- **Tailwind CSS** - Utility-first CSS framework

## 📁 Project Structure

```
card-clash/
├── backend/
│   ├── src/
│   │   ├── game/           # Core game logic (deck, rules, state)
│   │   ├── bot/            # AI opponent logic
│   │   ├── socket/         # WebSocket event handlers
│   │   ├── services/       # Business logic layer
│   │   ├── managers/       # State management (Redis)
│   │   └── server.ts       # Express + Socket.IO setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (Game, Card, Lobby)
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main application
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- PostgreSQL (local or cloud)
- Redis (local or cloud)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/card-clash-online.git
cd card-clash-online
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

The backend will start on `http://localhost:3001`

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

4. **Play!**
- Open `http://localhost:5173` in your browser
- Create an account or login
- Create/join a room
- Share the room ID with friends or add bots
- Start the game and enjoy!

## 🎯 How to Play

1. **Create Account**: Register with username and password
2. **Join a Room**: Create a new room or join with a room code
3. **Wait for Players**: Share the room code with friends or add AI bots
4. **Start Game**: Once 2-4 players are ready, start the game
5. **Play Cards**: On your turn, play a card that matches the color or number
6. **Special Cards**:
   - **Skip**: Skip the next player's turn
   - **Reverse**: Reverse the play direction
   - **Draw 2**: Next player draws 2 cards and loses their turn
   - **Wild**: Choose any color to continue
   - **Wild Draw 4**: Choose a color and next player draws 4 cards
7. **Win**: First player to empty their hand wins!

## 🔧 Environment Variables

### Backend `.env`
```env
# Server
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cardclash

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-session-secret-change-this
```

### Frontend `.env` (optional)
```env
VITE_SERVER_URL=http://localhost:3001
```

## 🚀 Deployment

### Backend (Render/Railway/Fly.io)

1. Create a new Web Service
2. Connect your GitHub repository
3. Add PostgreSQL and Redis add-ons
4. Set build command: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy`
5. Set start command: `cd backend && npm start`
6. Add environment variables (see `.env.example`)

### Frontend (Vercel/Netlify)

1. Create a new project
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_SERVER_URL`: Your backend URL

## 🎨 Game Architecture

### Backend Design
- **Centralized Logic**: All game rules and validation on server
- **Event-Driven**: Socket.IO handles real-time communication
- **Hybrid Persistence**: Redis for active games, PostgreSQL for users/history
- **Stateless Rules**: Pure functions for game mechanics
- **Room-Based**: Multiple concurrent games supported
- **Reconnection Support**: Players can rejoin after disconnection

### Frontend Design
- **React Hooks**: Modern functional components
- **TypeScript**: Full type safety
- **Real-time Updates**: Instant UI updates via WebSocket events
- **Component-Based**: Reusable and maintainable UI components

## 🤖 AI Bot Logic

The rule-based bot:
1. Looks for playable cards matching color or value
2. Prioritizes non-wild cards over wild cards
3. Chooses the most common color in hand when playing wild
4. Draws if no playable cards available

## 📮 Future Enhancements

- [ ] Game history UI & statistics dashboard
- [ ] Leaderboards
- [ ] In-game chat system
- [ ] Sound effects & card animations
- [ ] Tournament mode
- [ ] Advanced AI with better strategy
- [ ] Custom house rules
- [ ] Mobile app (React Native)
- [ ] Testing suite (Jest, Playwright)

## 🤝 Contributing

This is a portfolio/educational project, but contributions are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Note:** This is a non-commercial educational project. UNO® is a trademark of Mattel, Inc. This project is not affiliated with or endorsed by Mattel.

## 👤 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/SamirMD0)
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/samir-mardini-76928b318/)
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

## 🙏 Acknowledgments

- Inspired by classic card-matching games
- Built as a full-stack portfolio project
- Socket.IO documentation and community
- Modern web development best practices

## 🎓 Educational Purpose

This project was created to demonstrate:
- Real-time multiplayer architecture with WebSockets
- Full-stack TypeScript development
- Hybrid persistence strategies (Redis + PostgreSQL)
- Authentication and authorization
- State management in distributed systems
- React best practices with hooks and context
- RESTful API design

---

⭐ **Star this repo if you find it helpful for learning!**
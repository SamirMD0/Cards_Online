# 🎮 UNO Online - Real-time Multiplayer Game

A full-stack, real-time multiplayer UNO card game built with modern web technologies. Play with friends or against AI opponents in this faithful recreation of the classic card game.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](#) _(Add your link)_
- **Backend**: [Deployed on Render](#) _(Add your link)_

## ✨ Features

- ✅ **Real-time multiplayer** - Play with 2-4 players using WebSockets
- ✅ **AI Opponents** - Add bots to fill empty slots or practice solo
- ✅ **Full UNO ruleset** - Draw 2, Draw 4, Skip, Reverse, Wild cards
- ✅ **Room system** - Create/join private rooms with friends
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Server-side validation** - No cheating, all logic runs on backend
- ✅ **Turn-based gameplay** - Automatic turn management with visual indicators

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **In-memory storage** - Fast game state management (scalable to Redis/DB)

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - WebSocket client
- **CSS3** - Modern styling with gradients and animations

## 📁 Project Structure

```
uno-game/
├── backend/
│   ├── src/
│   │   ├── game/           # Core game logic (deck, rules, state)
│   │   ├── bot/            # AI opponent logic
│   │   ├── socket/         # WebSocket event handlers
│   │   └── server.js       # Express + Socket.IO setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (Game, Card, Lobby)
│   │   ├── socket.js       # Socket.IO client config
│   │   └── App.jsx         # Main application
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/uno-online.git
cd uno-online
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
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
- Enter your name and room ID
- Share the room ID with friends or add bots
- Start the game and enjoy!

## 🎯 How to Play

1. **Join a Room**: Enter your name and a room ID (or use Quick Play for a random room)
2. **Wait for Players**: Share the room ID with friends or add AI bots
3. **Start Game**: Once 2-4 players are ready, start the game
4. **Play Cards**: On your turn, play a card that matches the color or number
5. **Special Cards**:
   - **Skip**: Skip the next player's turn
   - **Reverse**: Reverse the play direction
   - **Draw 2**: Next player draws 2 cards and loses their turn
   - **Wild**: Choose any color to continue
   - **Wild Draw 4**: Choose a color and next player draws 4 cards
6. **Win**: First player to empty their hand wins!

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env` (optional)
```env
VITE_SERVER_URL=http://localhost:3001
```

## 🚀 Deployment

### Backend (Render/Railway/Fly.io)

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `CLIENT_URL`: Your frontend URL
   - `NODE_ENV`: production

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
- **Stateless Rules**: Pure functions for game mechanics
- **Room-Based**: Multiple concurrent games supported

### Frontend Design
- **React Hooks**: Modern functional components
- **Real-time Updates**: Instant UI updates via WebSocket events
- **Component-Based**: Reusable Card, Game, and Lobby components

## 🤖 AI Bot Logic

The simple rule-based bot:
1. Looks for playable cards matching color or value
2. Prioritizes non-wild cards over wild cards
3. Chooses the most common color in hand when playing wild
4. Draws if no playable cards available

## 🔮 Future Enhancements

- [ ] User authentication & profiles
- [ ] Game history & statistics
- [ ] Leaderboards
- [ ] Chat system
- [ ] Sound effects & animations
- [ ] Tournament mode
- [ ] Persistent storage (PostgreSQL/MongoDB)
- [ ] Advanced AI with machine learning
- [ ] Custom house rules
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

## 🙏 Acknowledgments

- Inspired by the classic UNO card game by Mattel
- Built as a portfolio project to demonstrate full-stack development skills
- Socket.IO documentation and community

---

⭐ **Star this repo if you find it helpful!**
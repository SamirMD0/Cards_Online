# Quick Start Guide

## 🚀 5-Minute Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/uno-online.git
cd uno-online
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Database
```bash
docker run --name uno-postgres \
  -e POSTGRES_PASSWORD=password4ryomen \
  -p 5432:5432 -d postgres:14
```

### 3. Configure Backend
```bash
cd backend
echo 'DATABASE_URL="postgresql://postgres:password4ryomen@localhost:5432/uno_game"
JWT_SECRET="uno-game-secret-key"
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development' > .env

npx prisma migrate dev
```

### 4. Start Servers
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 5. Open App
http://localhost:5173

## 📊 Current Status
- Phase 1: ✅ Complete (Core Game)
- Phase 2: ✅ Complete (Auth + Database)
- Phase 3: 🔜 Next (Game Layout)

See **PROGRESS.md** for detailed documentation.
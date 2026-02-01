# LGTM - Looks Good To Me?

A real-time multiplayer coding game inspired by Among Us, where engineers collaborate to solve coding challenges while an impostor tries to sabotage the code secretly.

## 🎮 Game Overview

**LGTM** is a social deduction coding game where:
- **3 Engineers** work together to complete a coding task
- **1 Impostor** secretly sabotages the code without getting caught
- Players can call **Emergency Meetings** to discuss and vote out suspects
- The game ends when engineers complete the task or the impostor wins

## ✨ Features

### Core Gameplay
- **Real-time Collaborative Coding** - Multiple players edit code simultaneously using Monaco Editor
- **Code Execution & Testing** - Actual JavaScript code execution with test cases
- **Live Edit History** - Track who made what changes
- **Emergency Meetings** - Call meetings to discuss suspicious behavior
- **Voting System** - Vote to eject suspected impostors
- **Chat System** - In-game chat for communication
- **Role Assignment** - Random role assignment (Engineer/Impostor)

### Technical Features
- **WebSocket Real-time Communication** - Powered by Go (gorilla/websocket)
- **Modern UI** - React + Vite + Tailwind CSS
- **Dark/Light Theme** - Toggle between themes
- **Docker Support** - Easy deployment with Docker Compose
- **File-based Tasks** - Manage coding challenges via JSON file

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Or: Go 1.21+ and Bun/Node.js

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd lgtm

# Start the application
docker-compose up --build

# Access the game
# Frontend: http://localhost:8080
# Backend: ws://localhost:3001/ws
```

### Local Development

#### Backend (Go)
```bash
cd server
go mod download
go run main.go
```

#### Frontend (React + Vite)
```bash
cd client
bun install  # or npm install
bun dev      # or npm run dev
```

## 📁 Project Structure

```
lgtm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── LobbyScreen.jsx
│   │   │   ├── GameScreen.jsx
│   │   │   ├── VotingScreen.jsx
│   │   │   ├── ResultScreen.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Icon.jsx
│   │   ├── utils/
│   │   │   └── codeRunner.js  # Code execution & testing
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── server/                 # Go backend
│   ├── main.go            # Entry point
│   ├── hub.go             # WebSocket hub
│   ├── client.go          # Client connection handling
│   ├── room.go            # Game room logic
│   ├── tasks.go           # Task management
│   ├── tasks.json         # Coding challenges
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml
└── README.md
```

## 🎯 How to Play

### 1. Create or Join a Room
- **Create Room**: Start a new game room
- **Join Room**: Enter a 6-character room code

### 2. Wait for Players
- Need exactly **4 players** to start
- See who's in the lobby

### 3. Game Starts
- Roles are randomly assigned:
  - **3 Engineers** - Complete the coding task
  - **1 Impostor** - Sabotage secretly
- A random coding challenge is selected

### 4. During the Game

#### For Engineers:
- Collaborate to solve the coding challenge
- Watch for suspicious code changes
- Call Emergency Meeting if you see sabotage
- Submit the task when all tests pass

#### For Impostor:
- Secretly break the code
- Make subtle mistakes
- Blend in with engineers
- Avoid getting voted out

### 5. Emergency Meetings
- Any player can call a meeting
- Discuss suspicious behavior
- Vote to eject a player
- If impostor is ejected → Engineers win
- If engineer is ejected → Continue game

### 6. Win Conditions

**Engineers Win:**
- Complete the coding task (all tests pass)
- Vote out the impostor

**Impostor Wins:**
- Time runs out (3 minutes)
- Enough engineers are ejected

## 🛠️ Tech Stack

### Backend
- **Go 1.21** - Server language
- **gorilla/websocket** - WebSocket implementation
- **JSON** - Data serialization

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Framer Motion** - Animations

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy (production)

## ⚙️ Configuration

### Tasks Management

Edit `server/tasks.json` to add/modify coding challenges:

```json
{
  "id": 1,
  "title": "FizzBuzz",
  "description": "Write a function that...",
  "functionName": "fizzBuzz",
  "starterCode": "function fizzBuzz(n) {\n  // Your code here\n}",
  "testCases": [
    {"input": 15, "expected": "FizzBuzz"},
    {"input": 9, "expected": "Fizz"}
  ]
}
```

### Environment Variables

No environment variables required. All configuration is in code.

## 🐳 Docker Details

### Services

- **lgtm-server** (Port 3001)
  - Go WebSocket server
  - Handles game logic and real-time communication

- **lgtm-client** (Port 8080)
  - React frontend
  - Served via Nginx

### Network

- Services communicate via `lgtm-network`
- WebSocket proxy configured in Nginx

## 🎨 UI Features

- **Minimalistic Design** - Clean, modern interface
- **Dark/Light Theme** - Toggle in top-right corner
- **Real-time Updates** - Live code synchronization
- **Responsive Layout** - Works on desktop and tablet
- **Icon System** - Minimalistic SVG icons with CDN fallback

## 🔧 Development

### Adding New Tasks

1. Edit `server/tasks.json`
2. Add a new task object with:
   - `id`, `title`, `description`
   - `functionName` (must match function in starterCode)
   - `starterCode` (JavaScript function template)
   - `testCases` (array of input/expected pairs)
3. Restart server

### Code Structure

- **Hub** - Manages all rooms and clients
- **Room** - Game state and logic per room
- **Client** - WebSocket connection per player
- **Tasks** - Coding challenges loaded from JSON

### Channel Architecture

- `client.send` - Unicast messages to specific client
- `room.broadcast` - Broadcast to all players in room
- `hub.register/unregister` - Client lifecycle management

## 📝 Game Rules

1. **4 Players Required** - Exactly 4 players per game
2. **3 Minute Timer** - Engineers have 3 minutes to complete task
3. **60 Second Voting** - 60 seconds to vote during meetings
4. **One Impostor** - Randomly assigned at game start
5. **Code Execution** - Real JavaScript execution with test validation

## 🐛 Troubleshooting

### Server won't start
- Check if `tasks.json` exists in `server/` directory
- Verify Go dependencies: `go mod download`

### WebSocket connection fails
- Check if server is running on port 3001
- Verify Docker containers are up: `docker-compose ps`

### Tasks not loading
- Ensure `tasks.json` is valid JSON
- Check server logs for parsing errors

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🎯 Future Enhancements

- [ ] More coding challenges
- [ ] Difficulty levels
- [ ] Player statistics
- [ ] Custom room settings
- [ ] Spectator mode
- [ ] Replay system

---

**Made with ❤️ for developers who love coding games**

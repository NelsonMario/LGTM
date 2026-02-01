package main

import (
	"encoding/json"
	"math/rand"
	"sync"
	"time"
)

type GameState string

const (
	StateLobby   GameState = "lobby"
	StatePlaying GameState = "playing"
	StateVoting  GameState = "voting"
	StateEnded   GameState = "ended"
)

type Room struct {
	code                string
	hub                 *Hub
	players             map[*Client]*Player
	broadcast           chan []byte
	gameState           GameState
	currentTask         *Task
	currentCode         string
	editHistory         []EditRecord
	votes               map[string]string // voterId -> targetId
	timeRemaining       int
	votingTimeRemaining int
	timer               *time.Ticker
	stopTimer           chan bool
	mutex               sync.RWMutex
}

type Player struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	IsAlive bool   `json:"isAlive"`
	Color   string `json:"color"`
}

type EditRecord struct {
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Timestamp  int64  `json:"timestamp"`
	CharDiff   int    `json:"charDiff"`
}

func NewRoom(code string, hub *Hub) *Room {
	return &Room{
		code:                code,
		hub:                 hub,
		players:             make(map[*Client]*Player),
		broadcast:           make(chan []byte, 256),
		gameState:           StateLobby,
		editHistory:         make([]EditRecord, 0),
		votes:               make(map[string]string),
		timeRemaining:       180,
		votingTimeRemaining: 60,
		stopTimer:           make(chan bool),
	}
}

func (r *Room) Run() {
	for {
		select {
		case message := <-r.broadcast:
			r.mutex.Lock()
			// Collect clients that need to be removed
			clientsToRemove := make([]*Client, 0)
			for client := range r.players {
				select {
				case client.send <- message:
					// Successfully sent
				default:
					// Channel full or closed - mark for removal
					// Don't close channel here - it will be closed by hub.unregister
					clientsToRemove = append(clientsToRemove, client)
				}
			}
			// Remove dead clients outside the loop to avoid modifying map while iterating
			for _, client := range clientsToRemove {
				// Just remove from room - hub will handle channel closing
				delete(r.players, client)
				client.room = nil
				// Signal hub to clean up (non-blocking)
				select {
				case client.hub.unregister <- client:
					// Successfully queued for cleanup
				default:
					// Hub busy, but client already removed from room
					// Channel will be closed when hub processes it
				}
			}
			r.mutex.Unlock()
		}
	}
}

func (r *Room) AddPlayer(client *Client, name string) *Player {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	colors := []string{"#00ff88", "#ff6b6b", "#4ecdc4", "#ffe66d"}
	player := &Player{
		ID:      client.id,
		Name:    name,
		Role:    "",
		IsAlive: true,
		Color:   colors[len(r.players)%len(colors)],
	}
	r.players[client] = player
	client.room = r
	return player
}

func (r *Room) RemovePlayer(client *Client) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	delete(r.players, client)
	client.room = nil
}

func (r *Room) GetPlayers() []*Player {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	players := make([]*Player, 0, len(r.players))
	for _, p := range r.players {
		players = append(players, p)
	}
	return players
}

func (r *Room) GetPlayersPublic() []map[string]interface{} {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	players := make([]map[string]interface{}, 0, len(r.players))
	for _, p := range r.players {
		players = append(players, map[string]interface{}{
			"id":      p.ID,
			"name":    p.Name,
			"isAlive": p.IsAlive,
			"color":   p.Color,
		})
	}
	return players
}

func (r *Room) BroadcastPlayerList() {
	players := r.GetPlayersPublic()
	msg := map[string]interface{}{
		"type":    "player-list",
		"players": players,
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data
}

func (r *Room) StartGame() {
	r.mutex.Lock()

	// Assign roles - 1 impostor, rest engineers
	playerList := make([]*Player, 0, len(r.players))
	for _, p := range r.players {
		playerList = append(playerList, p)
	}

	rand.Seed(time.Now().UnixNano())
	impostorIndex := rand.Intn(len(playerList))

	for i, p := range playerList {
		if i == impostorIndex {
			p.Role = "impostor"
		} else {
			p.Role = "engineer"
		}
	}

	// Select random task
	r.currentTask = &Tasks[rand.Intn(len(Tasks))]
	r.currentCode = r.currentTask.StarterCode
	r.gameState = StatePlaying
	r.timeRemaining = 180
	r.editHistory = make([]EditRecord, 0)

	r.mutex.Unlock()

	// Send game started to each player with their role
	for client, player := range r.players {
		msg := map[string]interface{}{
			"type":      "game-started",
			"role":      player.Role,
			"task":      r.currentTask,
			"timeLimit": 180,
			"players":   r.GetPlayersPublic(),
		}
		data, _ := json.Marshal(msg)
		client.send <- data
	}

	// Start game timer
	go r.StartGameTimer()
}

func (r *Room) StartGameTimer() {
	r.timer = time.NewTicker(1 * time.Second)
	defer r.timer.Stop()

	for {
		select {
		case <-r.timer.C:
			r.mutex.Lock()
			r.timeRemaining--
			timeLeft := r.timeRemaining
			state := r.gameState
			r.mutex.Unlock()

			if state != StatePlaying {
				return
			}

			msg := map[string]interface{}{
				"type":          "time-update",
				"timeRemaining": timeLeft,
			}
			data, _ := json.Marshal(msg)
			r.broadcast <- data

			if timeLeft <= 0 {
				r.EndGame("impostor", "Time ran out!")
				return
			}

		case <-r.stopTimer:
			return
		}
	}
}

func (r *Room) UpdateCode(client *Client, code string) {
	r.mutex.Lock()
	player := r.players[client]
	oldLen := len(r.currentCode)
	r.currentCode = code

	r.editHistory = append(r.editHistory, EditRecord{
		PlayerID:   player.ID,
		PlayerName: player.Name,
		Timestamp:  time.Now().UnixMilli(),
		CharDiff:   len(code) - oldLen,
	})

	// Keep only last 50 edits
	if len(r.editHistory) > 50 {
		r.editHistory = r.editHistory[len(r.editHistory)-50:]
	}
	r.mutex.Unlock()

	msg := map[string]interface{}{
		"type":         "code-updated",
		"code":         code,
		"lastEditor":   player.Name,
		"lastEditorId": player.ID,
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data
}

func (r *Room) CallMeeting(caller *Client) {
	r.mutex.Lock()
	r.gameState = StateVoting
	r.votes = make(map[string]string)
	r.votingTimeRemaining = 60
	callerPlayer := r.players[caller]
	r.mutex.Unlock()

	// Stop game timer
	select {
	case r.stopTimer <- true:
	default:
	}

	msg := map[string]interface{}{
		"type":        "meeting-called",
		"caller":      callerPlayer.Name,
		"editHistory": r.editHistory,
		"players":     r.GetPlayersPublic(),
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data

	go r.StartVotingTimer()
}

func (r *Room) StartVotingTimer() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			r.mutex.Lock()
			r.votingTimeRemaining--
			timeLeft := r.votingTimeRemaining
			state := r.gameState
			r.mutex.Unlock()

			if state != StateVoting {
				return
			}

			msg := map[string]interface{}{
				"type":          "voting-time-update",
				"timeRemaining": timeLeft,
			}
			data, _ := json.Marshal(msg)
			r.broadcast <- data

			if timeLeft <= 0 {
				r.TallyVotes()
				return
			}
		}
	}
}

func (r *Room) CastVote(voter *Client, targetID string) {
	r.mutex.Lock()
	voterPlayer := r.players[voter]
	if voterPlayer != nil && voterPlayer.IsAlive {
		r.votes[voterPlayer.ID] = targetID
	}

	// Count votes
	voteCount := len(r.votes)
	aliveCount := 0
	for _, p := range r.players {
		if p.IsAlive {
			aliveCount++
		}
	}
	r.mutex.Unlock()

	msg := map[string]interface{}{
		"type": "vote-cast",
		"votesCount": map[string]int{
			"voted": voteCount,
			"total": aliveCount,
		},
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data

	if voteCount >= aliveCount {
		r.TallyVotes()
	}
}

func (r *Room) TallyVotes() {
	r.mutex.Lock()

	// Count votes
	voteCounts := make(map[string]int)
	for _, targetID := range r.votes {
		if targetID != "skip" {
			voteCounts[targetID]++
		}
	}

	// Find player with most votes
	maxVotes := 0
	ejectedID := ""
	for id, count := range voteCounts {
		if count > maxVotes {
			maxVotes = count
			ejectedID = id
		}
	}

	// Need majority to eject
	aliveCount := 0
	for _, p := range r.players {
		if p.IsAlive {
			aliveCount++
		}
	}
	majorityNeeded := aliveCount/2 + 1

	var ejectedPlayer *Player
	wasImpostor := false

	if ejectedID != "" && maxVotes >= majorityNeeded {
		for _, p := range r.players {
			if p.ID == ejectedID {
				p.IsAlive = false
				ejectedPlayer = p
				wasImpostor = p.Role == "impostor"
				break
			}
		}
	}

	r.mutex.Unlock()

	// Send voting result
	var ejectedData interface{}
	if ejectedPlayer != nil {
		ejectedData = map[string]string{
			"id":   ejectedPlayer.ID,
			"name": ejectedPlayer.Name,
		}
	}

	msg := map[string]interface{}{
		"type":          "voting-ended",
		"ejectedPlayer": ejectedData,
		"wasImpostor":   wasImpostor,
		"votes":         r.votes,
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data

	// Check win condition
	time.Sleep(3 * time.Second)

	if winner, reason := r.CheckWinCondition(); winner != "" {
		r.EndGame(winner, reason)
	} else {
		r.ResumeGame()
	}
}

func (r *Room) CheckWinCondition() (string, string) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	aliveImpostors := 0
	aliveEngineers := 0

	for _, p := range r.players {
		if p.IsAlive {
			if p.Role == "impostor" {
				aliveImpostors++
			} else {
				aliveEngineers++
			}
		}
	}

	if aliveImpostors == 0 {
		return "engineers", "Impostor was ejected!"
	}

	if aliveImpostors >= aliveEngineers {
		return "impostor", "Impostor outnumbers engineers!"
	}

	return "", ""
}

func (r *Room) ResumeGame() {
	r.mutex.Lock()
	r.gameState = StatePlaying
	r.mutex.Unlock()

	msg := map[string]interface{}{
		"type":          "game-resumed",
		"players":       r.GetPlayersPublic(),
		"timeRemaining": r.timeRemaining,
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data

	go r.StartGameTimer()
}

func (r *Room) EndGame(winner, reason string) {
	r.mutex.Lock()
	r.gameState = StateEnded

	// Stop timer
	select {
	case r.stopTimer <- true:
	default:
	}

	// Get impostor
	var impostor map[string]string
	playersWithRoles := make([]map[string]interface{}, 0)

	for _, p := range r.players {
		if p.Role == "impostor" {
			impostor = map[string]string{
				"id":   p.ID,
				"name": p.Name,
			}
		}
		playersWithRoles = append(playersWithRoles, map[string]interface{}{
			"id":      p.ID,
			"name":    p.Name,
			"role":    p.Role,
			"isAlive": p.IsAlive,
			"color":   p.Color,
		})
	}
	r.mutex.Unlock()

	msg := map[string]interface{}{
		"type":     "game-ended",
		"winner":   winner,
		"reason":   reason,
		"impostor": impostor,
		"players":  playersWithRoles,
	}
	data, _ := json.Marshal(msg)
	r.broadcast <- data
}

func (r *Room) SendToClient(client *Client, msg map[string]interface{}) {
	data, _ := json.Marshal(msg)
	client.send <- data
}

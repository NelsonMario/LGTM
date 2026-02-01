package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 65536
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

type Client struct {
	id        string
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	room      *Room
	closeOnce sync.Once
}

type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

func (c *Client) cleanup() {
	c.closeOnce.Do(func() {
		close(c.send)
		c.conn.Close()
	})
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.cleanup()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[LGTM] WebSocket read error: %v", err)
			}
			break
		}

		c.handleMessage(message)
	}
}

func (c *Client) handleMessage(message []byte) {
	var msg Message
	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("Error parsing message: %v", err)
		return
	}

	switch msg.Type {
	case "create-room":
		var data struct {
			PlayerName string `json:"playerName"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleCreateRoom(data.PlayerName)

	case "join-room":
		var data struct {
			RoomCode   string `json:"roomCode"`
			PlayerName string `json:"playerName"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleJoinRoom(data.RoomCode, data.PlayerName)

	case "start-game":
		c.handleStartGame()

	case "code-update":
		var data struct {
			Code string `json:"code"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleCodeUpdate(data.Code)

	case "call-meeting":
		c.handleCallMeeting()

	case "cast-vote":
		var data struct {
			TargetID string `json:"targetId"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleCastVote(data.TargetID)

	case "chat-message":
		var data struct {
			Message string `json:"message"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleChatMessage(data.Message)

	case "submit-task":
		var data struct {
			Passed bool `json:"passed"`
		}
		json.Unmarshal(msg.Data, &data)
		c.handleSubmitTask(data.Passed)
	}
}

func (c *Client) handleCreateRoom(playerName string) {
	roomCode := GenerateRoomCode()
	room := c.hub.CreateRoom(roomCode)
	player := room.AddPlayer(c, playerName)

	response := map[string]interface{}{
		"type":     "room-created",
		"roomCode": roomCode,
		"player":   player,
		"players":  room.GetPlayersPublic(),
	}
	data, _ := json.Marshal(response)
	c.send <- data

	log.Printf("🏠 [LGTM] Room created: %s by %s", roomCode, playerName)
}

func (c *Client) handleJoinRoom(roomCode, playerName string) {
	room := c.hub.GetRoom(roomCode)

	if room == nil {
		c.sendError("Room not found!")
		return
	}

	if len(room.players) >= 4 {
		c.sendError("Room is full!")
		return
	}

	if room.gameState != StateLobby {
		c.sendError("Game already in progress!")
		return
	}

	player := room.AddPlayer(c, playerName)

	// Send to joining player
	response := map[string]interface{}{
		"type":     "room-joined",
		"roomCode": roomCode,
		"player":   player,
		"players":  room.GetPlayersPublic(),
	}
	data, _ := json.Marshal(response)
	c.send <- data

	// Broadcast to others
	room.BroadcastPlayerList()

	log.Printf("👤 [LGTM] %s joined room: %s", playerName, roomCode)
}

func (c *Client) handleStartGame() {
	if c.room == nil {
		return
	}

	if len(c.room.players) < 4 {
		c.sendError("Need 4 players to start!")
		return
	}

	c.room.StartGame()
	log.Printf("🎮 [LGTM] Game started in room: %s", c.room.code)
}

func (c *Client) handleCodeUpdate(code string) {
	if c.room == nil {
		return
	}

	// Check game state safely
	c.room.mutex.RLock()
	gameState := c.room.gameState
	c.room.mutex.RUnlock()

	if gameState != StatePlaying {
		return
	}

	c.room.UpdateCode(c, code)
}

func (c *Client) handleCallMeeting() {
	if c.room == nil {
		return
	}

	// Check game state safely
	c.room.mutex.RLock()
	gameState := c.room.gameState
	c.room.mutex.RUnlock()

	if gameState != StatePlaying {
		return
	}

	c.room.CallMeeting(c)
}

func (c *Client) handleCastVote(targetID string) {
	if c.room == nil {
		return
	}

	// Check game state safely
	c.room.mutex.RLock()
	gameState := c.room.gameState
	c.room.mutex.RUnlock()

	if gameState != StateVoting {
		return
	}

	c.room.CastVote(c, targetID)
}

func (c *Client) handleChatMessage(message string) {
	if c.room == nil {
		return
	}

	c.room.mutex.RLock()
	player := c.room.players[c]
	isAlive := player != nil && player.IsAlive
	c.room.mutex.RUnlock()

	if !isAlive {
		return
	}

	chatMsg := map[string]interface{}{
		"type":        "chat-message",
		"playerId":    player.ID,
		"playerName":  player.Name,
		"playerColor": player.Color,
		"message":     message,
		"timestamp":   time.Now().UnixMilli(),
	}
	data, _ := json.Marshal(chatMsg)
	c.room.broadcast <- data
}

func (c *Client) handleSubmitTask(passed bool) {
	if c.room == nil {
		return
	}

	// Check game state safely
	c.room.mutex.RLock()
	gameState := c.room.gameState
	c.room.mutex.RUnlock()

	if gameState != StatePlaying {
		return
	}

	if passed {
		// Engineers win! All tests passed on client side
		c.room.EndGame("engineers", "Task completed successfully! All tests passed! 🎉")
		log.Printf("✅ [LGTM] Task submitted successfully in room: %s", c.room.code)
	} else {
		// Send failure message
		response := map[string]interface{}{
			"type":    "task-failed",
			"message": "Tests failed! Fix the code and try again.",
		}
		data, _ := json.Marshal(response)
		c.send <- data
		log.Printf("❌ [LGTM] Task submission failed in room: %s", c.room.code)
	}
}

func (c *Client) sendError(message string) {
	response := map[string]interface{}{
		"type":    "error",
		"message": message,
	}
	data, _ := json.Marshal(response)
	c.send <- data
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.cleanup()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Channel closed, send close message
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		id:        uuid.New().String(),
		hub:       hub,
		conn:      conn,
		send:      make(chan []byte, 256),
		closeOnce: sync.Once{},
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

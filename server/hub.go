package main

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

type Hub struct {
	rooms      map[string]*Room
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]*Room),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			// Client connected, waiting for room action
			log.Printf("Client registered: %s", client.id)

		case client := <-h.unregister:
			h.mutex.Lock()
			if client.room != nil {
				client.room.RemovePlayer(client)
				if len(client.room.players) == 0 {
					delete(h.rooms, client.room.code)
				} else {
					client.room.BroadcastPlayerList()
				}
			}
			close(client.send)
			h.mutex.Unlock()
		}
	}
}

func (h *Hub) CreateRoom(code string) *Room {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	room := NewRoom(code, h)
	h.rooms[code] = room
	go room.Run()
	return room
}

func (h *Hub) GetRoom(code string) *Room {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return h.rooms[code]
}

func (h *Hub) DeleteRoom(code string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	delete(h.rooms, code)
}

func GenerateRoomCode() string {
	rand.Seed(time.Now().UnixNano())
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

package main

import (
	"log"
	"net/http"
)

func main() {
	// Load tasks from file
	if err := LoadTasks(); err != nil {
		log.Fatalf("[LGTM] Failed to load tasks.json: %v", err)
	}

	hub := NewHub()
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	// Serve static files for production
	http.Handle("/", http.FileServer(http.Dir("../client/dist")))

	log.Println("🚀 LGTM server running on :8081")
	log.Println("📡 WebSocket endpoint: ws://localhost:8081/ws")

	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

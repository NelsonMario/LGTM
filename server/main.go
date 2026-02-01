package main

import (
	"log"
	"net/http"
)

func main() {
	hub := NewHub()
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	// Serve static files for production
	http.Handle("/", http.FileServer(http.Dir("../client/dist")))

	log.Println("🚀 LGTM server running on :3001")
	log.Println("📡 WebSocket endpoint: ws://localhost:3001/ws")
	
	if err := http.ListenAndServe(":3001", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

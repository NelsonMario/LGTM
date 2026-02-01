package main

import (
	"encoding/json"
	"log"
	"os"
	"sync"
)

type Task struct {
	ID           int        `json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	FunctionName string     `json:"functionName"`
	StarterCode  string     `json:"starterCode"`
	TestCases    []TestCase `json:"testCases"`
}

type TestCase struct {
	Input    interface{} `json:"input"`
	Expected interface{} `json:"expected"`
}

var (
	Tasks      []Task
	tasksMutex sync.RWMutex
)

// LoadTasks loads tasks from tasks.json file
func LoadTasks() error {
	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	// Load from file
	data, err := os.ReadFile("tasks.json")
	if err != nil {
		return err
	}

	// Parse JSON
	var loadedTasks []Task
	if err := json.Unmarshal(data, &loadedTasks); err != nil {
		return err
	}

	if len(loadedTasks) == 0 {
		log.Printf("[LGTM] Warning: tasks.json is empty")
	}

	Tasks = loadedTasks
	log.Printf("[LGTM] Loaded %d tasks from tasks.json", len(Tasks))
	return nil
}

// GetTasks returns a copy of the current tasks (thread-safe)
func GetTasks() []Task {
	tasksMutex.RLock()
	defer tasksMutex.RUnlock()

	// Return a copy to prevent external modification
	tasksCopy := make([]Task, len(Tasks))
	copy(tasksCopy, Tasks)
	return tasksCopy
}

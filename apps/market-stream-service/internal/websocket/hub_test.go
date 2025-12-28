package websocket

import (
	"testing"
)

func TestNewHub(t *testing.T) {
	hub := NewHub()

	if hub == nil {
		t.Error("NewHub returned nil")
	}

	if hub.clients == nil {
		t.Error("clients map is nil")
	}

	if hub.broadcast == nil {
		t.Error("broadcast channel is nil")
	}

	if hub.Register == nil {
		t.Error("Register channel is nil")
	}

	if hub.Unregister == nil {
		t.Error("Unregister channel is nil")
	}
}

func TestGetClientCount(t *testing.T) {
	hub := NewHub()

	count := hub.GetClientCount()
	if count != 0 {
		t.Errorf("Expected 0 clients, got %d", count)
	}
}

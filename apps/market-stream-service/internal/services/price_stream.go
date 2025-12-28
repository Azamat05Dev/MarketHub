package services

import (
	"log"
	"time"

	"github.com/markethub/market-stream-service/internal/websocket"
	"github.com/markethub/market-stream-service/pkg/fakegen"
)

type PriceStreamService struct {
	hub       *websocket.Hub
	generator *fakegen.FakeDataGenerator
	interval  time.Duration
}

func NewPriceStreamService(hub *websocket.Hub) *PriceStreamService {
	return &PriceStreamService{
		hub:       hub,
		generator: fakegen.NewFakeDataGenerator(),
		interval:  1 * time.Second,
	}
}

func (s *PriceStreamService) Start() {
	log.Println("🚀 Price streaming service started")

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for range ticker.C {
		prices := s.generator.GeneratePrices()
		s.hub.BroadcastPrices(prices)
		
		if s.hub.GetClientCount() > 0 {
			log.Printf("📊 Broadcasted prices to %d clients", s.hub.GetClientCount())
		}
	}
}

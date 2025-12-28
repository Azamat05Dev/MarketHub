package main

import (
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/markethub/market-stream-service/internal/handlers"
	"github.com/markethub/market-stream-service/internal/models"
	"github.com/markethub/market-stream-service/internal/services"
	"github.com/markethub/market-stream-service/internal/websocket"
	"github.com/markethub/market-stream-service/pkg/binance"
)

// Rate limiter
type RateLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	// Clean old requests
	var valid []time.Time
	for _, t := range rl.requests[ip] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	rl.requests[ip] = valid

	if len(rl.requests[ip]) >= rl.limit {
		return false
	}

	rl.requests[ip] = append(rl.requests[ip], now)
	return true
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	// Check if we should use real Binance API
	useRealAPI := os.Getenv("USE_REAL_API") == "true"

	// Initialize Rate Limiter (100 requests per minute)
	rateLimiter := NewRateLimiter(100, time.Minute)

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	if useRealAPI {
		// Use real Binance WebSocket API
		log.Println("📈 Using REAL Binance WebSocket API")
		binanceClient := binance.NewBinanceClient()

		// Set callback to broadcast prices to connected clients
		binanceClient.SetPriceUpdateCallback(func(prices []models.Price) {
			hub.BroadcastPrices(prices)
		})

		// Connect to Binance
		if err := binanceClient.Connect(); err != nil {
			log.Printf("⚠️ Failed to connect to Binance, falling back to fake data: %v", err)
			// Fallback to fake data
			priceService := services.NewPriceStreamService(hub)
			go priceService.Start()
		}
	} else {
		// Use fake data generator
		log.Println("🎭 Using FAKE data generator (set USE_REAL_API=true for real prices)")
		priceService := services.NewPriceStreamService(hub)
		go priceService.Start()
	}

	// Initialize handlers
	handler := handlers.NewHandler(hub)

	// Setup router
	router := mux.NewRouter()

	// Routes
	router.HandleFunc("/health", handler.HandleHealth).Methods("GET")
	router.HandleFunc("/api/prices", handler.HandlePrices).Methods("GET")
	router.HandleFunc("/ws", handler.HandleWebSocket)

	// Apply middlewares
	router.Use(rateLimitMiddleware(rateLimiter))
	router.Use(securityHeadersMiddleware)
	router.Use(corsMiddleware)

	log.Printf("🚀 Market Stream Service started on http://localhost:%s", port)
	log.Printf("📡 WebSocket endpoint: ws://localhost:%s/ws", port)
	log.Printf("🏥 Health check: http://localhost:%s/health", port)
	log.Printf("🔒 Rate limiting: 100 requests/minute")

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal("Server error:", err)
	}
}

func rateLimitMiddleware(rl *RateLimiter) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if !rl.Allow(ip) {
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

package binance

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/markethub/market-stream-service/internal/models"
)

// Binance WebSocket stream URLs
const (
	BinanceWSURL = "wss://stream.binance.com:9443/ws"
)

// Supported trading pairs
var TradingPairs = []string{
	"btcusdt", "ethusdt", "solusdt", "bnbusdt",
	"adausdt", "xrpusdt", "dotusdt", "avaxusdt",
}

// BinanceTradeEvent represents a trade event from Binance
type BinanceTradeEvent struct {
	EventType string `json:"e"` // Event type
	EventTime int64  `json:"E"` // Event time
	Symbol    string `json:"s"` // Symbol
	Price     string `json:"p"` // Price
	Quantity  string `json:"q"` // Quantity
	TradeID   int64  `json:"t"` // Trade ID
}

// BinanceClient manages connection to Binance WebSocket
type BinanceClient struct {
	conn           *websocket.Conn
	prices         map[string]*models.Price
	mu             sync.RWMutex
	onPriceUpdate  func([]models.Price)
	reconnectDelay time.Duration
	isConnected    bool
}

// NewBinanceClient creates a new Binance WebSocket client
func NewBinanceClient() *BinanceClient {
	client := &BinanceClient{
		prices:         make(map[string]*models.Price),
		reconnectDelay: 5 * time.Second,
	}

	// Initialize prices with default values
	symbolNames := map[string]string{
		"btcusdt":  "BTC",
		"ethusdt":  "ETH",
		"solusdt":  "SOL",
		"bnbusdt":  "BNB",
		"adausdt":  "ADA",
		"xrpusdt":  "XRP",
		"dotusdt":  "DOT",
		"avaxusdt": "AVAX",
	}

	for pair, symbol := range symbolNames {
		client.prices[pair] = &models.Price{
			Symbol:    symbol,
			Price:     0,
			Change24h: 0,
			Volume:    0,
			Timestamp: time.Now(),
		}
	}

	return client
}

// SetPriceUpdateCallback sets the callback for price updates
func (c *BinanceClient) SetPriceUpdateCallback(callback func([]models.Price)) {
	c.onPriceUpdate = callback
}

// Connect establishes connection to Binance WebSocket
func (c *BinanceClient) Connect() error {
	// Build stream URL for all pairs
	streams := ""
	for i, pair := range TradingPairs {
		if i > 0 {
			streams += "/"
		}
		streams += pair + "@trade"
	}

	url := BinanceWSURL + "/" + streams
	log.Printf("Connecting to Binance: %s", url)

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return err
	}

	c.conn = conn
	c.isConnected = true
	log.Println("✅ Connected to Binance WebSocket")

	// Start reading messages
	go c.readMessages()

	// Start broadcasting prices periodically
	go c.broadcastPrices()

	return nil
}

// readMessages reads messages from Binance WebSocket
func (c *BinanceClient) readMessages() {
	defer func() {
		c.isConnected = false
		if c.conn != nil {
			c.conn.Close()
		}
		// Attempt reconnection
		go c.reconnect()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			log.Printf("Binance read error: %v", err)
			return
		}

		var trade BinanceTradeEvent
		if err := json.Unmarshal(message, &trade); err != nil {
			continue
		}

		c.updatePrice(trade)
	}
}

// updatePrice updates the price for a trading pair
func (c *BinanceClient) updatePrice(trade BinanceTradeEvent) {
	c.mu.Lock()
	defer c.mu.Unlock()

	pair := toLower(trade.Symbol)
	if price, exists := c.prices[pair]; exists {
		// Parse price string to float
		var newPrice float64
		json.Unmarshal([]byte(trade.Price), &newPrice)

		if newPrice > 0 {
			// Calculate change (simplified - would need 24h data from REST API)
			if price.Price > 0 {
				price.Change24h = ((newPrice - price.Price) / price.Price) * 100
			}
			price.Price = newPrice
			price.Timestamp = time.Now()
		}
	}
}

// broadcastPrices sends price updates to callback every second
func (c *BinanceClient) broadcastPrices() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if c.onPriceUpdate != nil {
			prices := c.GetPrices()
			c.onPriceUpdate(prices)
		}
	}
}

// GetPrices returns all current prices
func (c *BinanceClient) GetPrices() []models.Price {
	c.mu.RLock()
	defer c.mu.RUnlock()

	prices := make([]models.Price, 0, len(c.prices))
	for _, p := range c.prices {
		prices = append(prices, *p)
	}
	return prices
}

// reconnect attempts to reconnect to Binance
func (c *BinanceClient) reconnect() {
	for {
		log.Printf("Attempting to reconnect to Binance in %v...", c.reconnectDelay)
		time.Sleep(c.reconnectDelay)

		if err := c.Connect(); err != nil {
			log.Printf("Reconnection failed: %v", err)
			continue
		}
		break
	}
}

// Close closes the WebSocket connection
func (c *BinanceClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

// IsConnected returns connection status
func (c *BinanceClient) IsConnected() bool {
	return c.isConnected
}

func toLower(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			c += 32
		}
		result[i] = c
	}
	return string(result)
}

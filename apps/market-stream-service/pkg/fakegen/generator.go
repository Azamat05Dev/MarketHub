package fakegen

import (
	"math"
	"math/rand"
	"time"

	"github.com/markethub/market-stream-service/internal/models"
)

type FakeDataGenerator struct {
	basePrices map[string]float64
	rand       *rand.Rand
}

func NewFakeDataGenerator() *FakeDataGenerator {
	return &FakeDataGenerator{
		basePrices: map[string]float64{
			"BTC": 95000.00,
			"ETH": 3500.00,
			"SOL": 145.00,
			"BNB": 620.00,
			"ADA": 0.65,
			"XRP": 0.58,
			"DOT": 7.20,
			"AVAX": 38.50,
		},
		rand: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func (g *FakeDataGenerator) GeneratePrices() []models.Price {
	prices := make([]models.Price, 0, len(g.basePrices))
	now := time.Now()

	for symbol, basePrice := range g.basePrices {
		// Generate realistic price fluctuation (±2%)
		fluctuation := (g.rand.Float64() - 0.5) * 0.04 // -2% to +2%
		currentPrice := basePrice * (1 + fluctuation)

		// Generate 24h change (±10%)
		change24h := (g.rand.Float64() - 0.5) * 20 // -10% to +10%

		// Generate volume based on price
		volume := basePrice * g.rand.Float64() * 1000000

		prices = append(prices, models.Price{
			Symbol:    symbol,
			Price:     math.Round(currentPrice*100) / 100,
			Change24h: math.Round(change24h*100) / 100,
			Volume:    math.Round(volume*100) / 100,
			Timestamp: now,
		})

		// Update base price for next iteration (slow drift)
		g.basePrices[symbol] = currentPrice
	}

	return prices
}

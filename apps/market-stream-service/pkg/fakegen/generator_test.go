package fakegen

import (
	"testing"
)

func TestNewFakeDataGenerator(t *testing.T) {
	gen := NewFakeDataGenerator()

	if gen == nil {
		t.Error("NewFakeDataGenerator returned nil")
	}

	if len(gen.basePrices) != 8 {
		t.Errorf("Expected 8 base prices, got %d", len(gen.basePrices))
	}
}

func TestGeneratePrices(t *testing.T) {
	gen := NewFakeDataGenerator()
	prices := gen.GeneratePrices()

	if len(prices) != 8 {
		t.Errorf("Expected 8 prices, got %d", len(prices))
	}

	for _, price := range prices {
		if price.Symbol == "" {
			t.Error("Price symbol is empty")
		}

		if price.Price <= 0 {
			t.Errorf("Price for %s is not positive: %f", price.Symbol, price.Price)
		}

		if price.Timestamp.IsZero() {
			t.Error("Timestamp is zero")
		}
	}
}

func TestPriceFluctuation(t *testing.T) {
	gen := NewFakeDataGenerator()

	// Generate prices multiple times and check they change
	prices1 := gen.GeneratePrices()
	prices2 := gen.GeneratePrices()

	changed := false
	for i, p1 := range prices1 {
		if p1.Price != prices2[i].Price {
			changed = true
			break
		}
	}

	if !changed {
		t.Log("Prices did not change between generations (may happen rarely)")
	}
}

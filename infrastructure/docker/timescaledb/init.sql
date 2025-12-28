-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create market prices table
CREATE TABLE IF NOT EXISTS market_prices (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8),
    source VARCHAR(50) DEFAULT 'binance'
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('market_prices', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX idx_market_prices_symbol_time ON market_prices(symbol, time DESC);

-- Create continuous aggregates for 1-minute, 5-minute, and 1-hour data
CREATE MATERIALIZED VIEW IF NOT EXISTS market_prices_1min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(volume) AS volume
FROM market_prices
GROUP BY bucket, symbol;

-- Add retention policy (keep raw data for 7 days, aggregates for 30 days)
SELECT add_retention_policy('market_prices', INTERVAL '7 days', if_not_exists => TRUE);

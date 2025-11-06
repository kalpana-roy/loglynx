package database

import (
	"github.com/pterm/pterm"
	"gorm.io/gorm"
)

// OptimizeDatabase applies additional optimizations after initial migrations
// This includes creating performance indexes and verifying SQLite settings
func OptimizeDatabase(db *gorm.DB, logger *pterm.Logger) error {
	logger.Debug("Applying database optimizations...")

	// Verify WAL mode is enabled (debug level - only show if there's a problem)
	var journalMode string
	if err := db.Raw("PRAGMA journal_mode").Scan(&journalMode).Error; err != nil {
		logger.Warn("Failed to check journal mode", logger.Args("error", err))
	} else if journalMode != "wal" {
		logger.Warn("Database not in WAL mode", logger.Args("mode", journalMode))
	} else {
		logger.Trace("Database journal mode verified", logger.Args("mode", journalMode))
	}

	// Verify page size (trace level - not critical)
	var pageSize int
	if err := db.Raw("PRAGMA page_size").Scan(&pageSize).Error; err != nil {
		logger.Debug("Failed to check page size", logger.Args("error", err))
	} else {
		logger.Trace("Database page size", logger.Args("bytes", pageSize))
	}

	// Create all indexes in a single batch for faster execution
	// IF NOT EXISTS makes this idempotent and fast on subsequent runs
	indexes := []string{
		// Response time index for percentile calculations
		`CREATE INDEX IF NOT EXISTS idx_response_time
		 ON http_requests(response_time_ms)
		 WHERE response_time_ms > 0`,

		// Composite index for timestamp + response_time for optimized percentile queries
		`CREATE INDEX IF NOT EXISTS idx_timestamp_response_time
		 ON http_requests(timestamp, response_time_ms)
		 WHERE response_time_ms > 0`,

		// Composite index for summary queries (timestamp, status_code, response_time_ms)
		`CREATE INDEX IF NOT EXISTS idx_summary_query
		 ON http_requests(timestamp, status_code, response_time_ms)`,

		// Index for cleanup queries (timestamp for deletion)
		`CREATE INDEX IF NOT EXISTS idx_timestamp_cleanup
		 ON http_requests(timestamp)`,
	}

	indexCount := 0
	for _, indexSQL := range indexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			logger.Warn("Failed to create index", logger.Args("error", err))
			return err
		}
		indexCount++
	}

	logger.Debug("Performance indexes verified", logger.Args("count", indexCount))

	// Analyze tables for query optimizer (only log if it fails)
	if err := db.Exec("ANALYZE").Error; err != nil {
		logger.Warn("Failed to analyze database", logger.Args("error", err))
	} else {
		logger.Trace("Database statistics analyzed")
	}

	logger.Debug("Database optimizations completed")
	return nil
}

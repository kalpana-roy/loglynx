package main

import (
	"crypto/sha256"
	"fmt"
	"log"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// HTTPRequest minimal struct for hash recalculation
type HTTPRequest struct {
	ID           uint      `gorm:"primaryKey"`
	Timestamp    time.Time
	ClientIP     string
	Method       string
	Host         string
	Path         string
	QueryString  string
	StatusCode   int
	RequestHash  string
}

func (HTTPRequest) TableName() string {
	return "http_requests"
}

func main() {
	dbPath := "./loglynx.db"

	fmt.Println("🔧 LogLynx Database Hash Migration Tool")
	fmt.Println("========================================")
	fmt.Printf("Database: %s\n\n", dbPath)

	// Open database
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Count total records
	var totalCount int64
	db.Model(&HTTPRequest{}).Count(&totalCount)
	fmt.Printf("📊 Found %d total records\n", totalCount)

	// Process in batches
	batchSize := 1000
	offset := 0
	totalUpdated := 0
	totalErrors := 0

	fmt.Println("\n🔄 Recalculating hashes...")

	for {
		var requests []HTTPRequest
		result := db.Limit(batchSize).Offset(offset).Find(&requests)

		if result.Error != nil {
			log.Fatalf("Failed to fetch records: %v", result.Error)
		}

		if len(requests) == 0 {
			break
		}

		// Recalculate hashes
		for i := range requests {
			req := &requests[i]

			// New hash formula with query string
			hashInput := fmt.Sprintf("%d|%s|%s|%s|%s|%s|%d",
				req.Timestamp.Unix(),
				req.ClientIP,
				req.Method,
				req.Host,
				req.Path,
				req.QueryString, // This was missing before!
				req.StatusCode,
			)
			hash := sha256.Sum256([]byte(hashInput))
			newHash := fmt.Sprintf("%x", hash)

			// Update only if hash changed
			if newHash != req.RequestHash {
				req.RequestHash = newHash
				if err := db.Save(req).Error; err != nil {
					fmt.Printf("❌ Error updating record ID %d: %v\n", req.ID, err)
					totalErrors++
				} else {
					totalUpdated++
				}
			}
		}

		offset += batchSize
		fmt.Printf("   Processed %d / %d records (Updated: %d, Errors: %d)\r",
			offset, totalCount, totalUpdated, totalErrors)
	}

	fmt.Printf("\n\n✅ Migration completed!\n")
	fmt.Printf("   Total records: %d\n", totalCount)
	fmt.Printf("   Updated: %d\n", totalUpdated)
	fmt.Printf("   Errors: %d\n", totalErrors)
	fmt.Printf("   Unchanged: %d\n", totalCount-int64(totalUpdated)-int64(totalErrors))
}

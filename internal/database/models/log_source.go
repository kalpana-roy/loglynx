package models

import (
	"time"
)

type LogSource struct {
    Name            string    `gorm:"primaryKey"`
    Path            string    `gorm:"not null"`
    ParserType      string    `gorm:"not null;index"`
    LastLineContent string
    LastPosition    int64     `gorm:"default:0"`
    LastInode       int64     `gorm:"default:0"` // File inode for identity tracking (SQLite only supports int64)
    LastReadAt      *time.Time
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

func (LogSource) TableName() string {
    return "log_sources"
}
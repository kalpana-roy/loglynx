package handlers

import (
	"encoding/json"
	"fmt"
	"time"

	"loglynx/internal/realtime"

	"github.com/gin-gonic/gin"
	"github.com/pterm/pterm"
)

// RealtimeHandler handles real-time streaming endpoints
type RealtimeHandler struct {
	collector *realtime.MetricsCollector
	logger    *pterm.Logger
}

// NewRealtimeHandler creates a new realtime handler
func NewRealtimeHandler(collector *realtime.MetricsCollector, logger *pterm.Logger) *RealtimeHandler {
	return &RealtimeHandler{
		collector: collector,
		logger:    logger,
	}
}

// getServiceFilter extracts service filter parameters from request
// Returns serviceName and serviceType separately
// Falls back to legacy "host" parameter for backward compatibility
func (h *RealtimeHandler) getServiceFilter(c *gin.Context) (string, string) {
	// Try new parameters first
	service := c.Query("service")
	serviceType := c.Query("service_type")

	// Fallback to legacy "host" parameter
	if service == "" {
		service = c.Query("host")
	}

	// Default service type to "auto" if not specified
	if serviceType == "" {
		serviceType = "auto"
	}

	// Return combined format for new filter system
	if service != "" {
		return service, serviceType
	}

	return "", "auto"
}

// StreamMetrics streams real-time metrics via Server-Sent Events
func (h *RealtimeHandler) StreamMetrics(c *gin.Context) {
	// Get optional serviceName filter
	serviceName, _ := h.getServiceFilter(c)

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	// Create a ticker for sending updates
	ticker := time.NewTicker(2 * time.Second) // Send updates every 2 seconds
	defer ticker.Stop()

	// Channel to detect client disconnect
	clientGone := c.Writer.CloseNotify()

	h.logger.Debug("Client connected to real-time metrics stream",
		h.logger.Args("client_ip", c.ClientIP(), "host_filter", serviceName))

	for {
		select {
		case <-c.Request.Context().Done():
			// Server is shutting down or request context cancelled
			h.logger.Debug("Request context cancelled (server shutdown or timeout)",
				h.logger.Args("client_ip", c.ClientIP()))
			return

		case <-clientGone:
			h.logger.Debug("Client disconnected from real-time stream",
				h.logger.Args("client_ip", c.ClientIP()))
			return

		case <-ticker.C:
			// Get current metrics (with optional serviceName filter)
			metrics := h.collector.GetMetricsWithHost(serviceName)

			// Marshal to JSON
			data, err := json.Marshal(metrics)
			if err != nil {
				h.logger.Error("Failed to marshal metrics", h.logger.Args("error", err))
				continue
			}

			// Send SSE event
			_, err = fmt.Fprintf(c.Writer, "data: %s\n\n", data)
			if err != nil {
				h.logger.Debug("Failed to write SSE data", h.logger.Args("error", err))
				return
			}

			// Flush the data immediately
			c.Writer.Flush()
		}
	}
}

// GetCurrentMetrics returns a single snapshot of current metrics
func (h *RealtimeHandler) GetCurrentMetrics(c *gin.Context) {
	serviceName, _ := h.getServiceFilter(c) // Optional serviceName filter
	metrics := h.collector.GetMetricsWithHost(serviceName)
	c.JSON(200, metrics)
}

// GetPerServiceMetrics returns current metrics for each service
func (h *RealtimeHandler) GetPerServiceMetrics(c *gin.Context) {
	metrics := h.collector.GetPerServiceMetrics()
	c.JSON(200, metrics)
}

/**
 * LogLynx Utilities
 * Common helper functions and UI utilities
 */

const LogLynxUtils = {
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.innerHTML = `
            <i class="notification-icon fas ${this.getNotificationIcon(type)}"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    },

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show loading overlay
     */
    showLoading(text = 'Loading...') {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner-large"></div>
                    <div class="loading-text">${text}</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.classList.add('show');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    /**
     * Format number with locale
     */
    formatNumber(num) {
        return num.toLocaleString();
    },

    /**
     * Format bytes to human readable
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Format milliseconds
     */
    formatMs(ms) {
        if (ms < 1000) return ms.toFixed(1) + 'ms';
        return (ms / 1000).toFixed(2) + 's';
    },

    /**
     * Format duration (milliseconds) to human readable
     */
    formatDuration(ms) {
        if (!ms || ms === 0) return '0ms';
        if (ms < 1) return ms.toFixed(3) + 'ms';
        if (ms < 1000) return ms.toFixed(1) + 'ms';
        if (ms < 60000) return (ms / 1000).toFixed(2) + 's';
        return (ms / 60000).toFixed(2) + 'm';
    },

    /**
     * Format percentage
     */
    formatPercentage(value, total, decimals = 1) {
        if (total === 0) return '0%';
        return ((value / total) * 100).toFixed(decimals) + '%';
    },

    /**
     * Format date/time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * Format relative time (e.g., "2 minutes ago")
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(statusCode) {
        let badgeClass = 'badge-success';
        if (statusCode >= 400 && statusCode < 500) badgeClass = 'badge-warning';
        if (statusCode >= 500) badgeClass = 'badge-danger';
        if (statusCode >= 300 && statusCode < 400) badgeClass = 'badge-info';

        return `<span class="badge ${badgeClass}">${statusCode}</span>`;
    },

    /**
     * Get method badge HTML
     */
    getMethodBadge(method) {
        const colors = {
            'GET': 'badge-primary',
            'POST': 'badge-success',
            'PUT': 'badge-warning',
            'DELETE': 'badge-danger',
            'PATCH': 'badge-info'
        };
        const badgeClass = colors[method] || 'badge-secondary';
        return `<span class="badge ${badgeClass}">${method}</span>`;
    },

    /**
     * Truncate string
     */
    truncate(str, maxLength = 50) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit = 1000) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Get query parameter from URL
     */
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Set query parameter in URL
     */
    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Set active navigation item
     */
    setActiveNavItem(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });
    },

    /**
     * Toggle sidebar (mobile)
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        }
    },

    /**
     * Initialize sidebar events
     */
    initSidebar() {
        const toggle = document.querySelector('.sidebar-toggle');
        const overlay = document.querySelector('.sidebar-overlay');
        const navItems = document.querySelectorAll('.nav-item');

        if (toggle) {
            toggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.toggleSidebar());
        }

        // Close sidebar on navigation (mobile)
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    this.toggleSidebar();
                }
            });
        });
    },

    /**
     * Initialize service filter with type selector
     */
    initServiceFilter(onChangeCallback) {
        const filterSelect = document.getElementById('serviceFilter');
        const filterTypeSelect = document.getElementById('filterType');
        if (!filterSelect || !filterTypeSelect) return;

        // Restore from sessionStorage
        const savedService = sessionStorage.getItem('selectedService');
        const savedType = sessionStorage.getItem('selectedServiceType') || 'auto';

        if (savedService) {
            filterSelect.value = savedService;
            filterTypeSelect.value = savedType;
            LogLynxAPI.setServiceFilter(savedService, savedType);
        }

        // Handle filter type changes
        filterTypeSelect.addEventListener('change', (e) => {
            const serviceType = e.target.value;
            const service = filterSelect.value;

            LogLynxAPI.setServiceFilter(service, serviceType);
            sessionStorage.setItem('selectedServiceType', serviceType);

            // Reload service list based on new type
            this.loadServiceFilter();

            if (onChangeCallback && service) {
                onChangeCallback(service, serviceType);
            }
        });

        // Handle service selection changes
        filterSelect.addEventListener('change', (e) => {
            const service = e.target.value;
            const serviceType = filterTypeSelect.value;

            LogLynxAPI.setServiceFilter(service, serviceType);

            if (service) {
                sessionStorage.setItem('selectedService', service);
            } else {
                sessionStorage.removeItem('selectedService');
            }

            if (onChangeCallback) {
                onChangeCallback(service, serviceType);
            }
        });
    },

    /**
     * Load services into filter with type information
     */
    async loadServiceFilter() {
        const filterSelect = document.getElementById('serviceFilter');
        const filterTypeSelect = document.getElementById('filterType');
        if (!filterSelect) return;

        const result = await LogLynxAPI.getServices();
        if (result.success && result.data) {
            // Get current filter type
            const currentType = filterTypeSelect ? filterTypeSelect.value : 'auto';

            // Clear existing options except "All Traffic"
            filterSelect.innerHTML = '<option value="">All Traffic</option>';

            // Filter services based on selected type
            let services = result.data;
            if (currentType !== 'auto') {
                services = services.filter(s => s.type === currentType);
            }

            // Add service options with type labels
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.name;
                option.setAttribute('data-type', service.type);

                // Create a row object for formatHostDisplay based on service type
                let rowObj = {};
                if (service.type === 'backend_name') {
                    rowObj.backend_name = service.name;
                } else if (service.type === 'backend_url') {
                    rowObj.backend_url = service.name;
                } else if (service.type === 'host') {
                    rowObj.host = service.name;
                } else {
                    // Auto - try to determine which field it is
                    rowObj.backend_name = service.name;
                }

                // Format display using formatHostDisplay
                const displayName = this.formatHostDisplay(rowObj, service.name);
                const typeLabel = this.formatServiceType(service.type);
                option.textContent = `${displayName} (${typeLabel}) - ${this.formatNumber(service.count)}`;

                filterSelect.appendChild(option);
            });

            // Restore selection
            const savedService = sessionStorage.getItem('selectedService');
            if (savedService) {
                filterSelect.value = savedService;
            }
        }
    },

    /**
     * Format service type for display
     */
    formatServiceType(type) {
        const typeMap = {
            'backend_name': 'Backend',
            'backend_url': 'URL',
            'host': 'Host',
            'auto': 'Auto'
        };
        return typeMap[type] || type;
    },

    /**
     * Initialize refresh controls
     */
    initRefreshControls(loadDataCallback, defaultInterval = 30) {
        let refreshTimer = null;
        let lastRefreshTimer = null;
        let isAutoRefreshEnabled = false;
        let refreshInterval = defaultInterval * 1000;
        let lastRefreshTime = null;

        const intervalSelect = document.getElementById('refreshInterval');
        const playBtn = document.getElementById('playRefresh');
        const pauseBtn = document.getElementById('pauseRefresh');
        const statusSpan = document.getElementById('refreshStatus');

        const updateLastRefreshDisplay = () => {
            if (!statusSpan || !lastRefreshTime) return;

            const now = Date.now();
            const secondsAgo = Math.floor((now - lastRefreshTime) / 1000);

            let timeText;
            if (secondsAgo < 60) {
                timeText = `${secondsAgo}s ago`;
            } else if (secondsAgo < 3600) {
                const minutes = Math.floor(secondsAgo / 60);
                timeText = `${minutes}m ago`;
            } else {
                const hours = Math.floor(secondsAgo / 3600);
                timeText = `${hours}h ago`;
            }

            const lastRefreshElement = statusSpan.querySelector('.last-refresh');
            if (lastRefreshElement) {
                lastRefreshElement.textContent = `Last: ${timeText}`;
            }
        };

        const updateStatus = () => {
            if (!statusSpan) return;

            const intervalText = intervalSelect ? intervalSelect.options[intervalSelect.selectedIndex].text : '30s';
            const icon = isAutoRefreshEnabled ?
                '<i class="fas fa-sync-alt fa-spin"></i>' :
                '<i class="fas fa-pause"></i>';
            const text = isAutoRefreshEnabled ?
                `Auto-refresh: ${intervalText}` :
                `Paused: ${intervalText}`;

            const lastRefreshText = lastRefreshTime ? 
                `<span class="last-refresh" style="margin-left: 10px; color: #999; font-size: 0.9em;">Last: ${Math.floor((Date.now() - lastRefreshTime) / 1000)}s ago</span>` : 
                '';

            statusSpan.innerHTML = `${icon} <span>${text}</span>${lastRefreshText}`;
        };

        const updateButtons = () => {
            if (playBtn) playBtn.disabled = isAutoRefreshEnabled;
            if (pauseBtn) pauseBtn.disabled = !isAutoRefreshEnabled;
        };

        const wrappedLoadCallback = async () => {
            await loadDataCallback();
            lastRefreshTime = Date.now();
            updateStatus();
        };

        const startRefresh = () => {
            if (isAutoRefreshEnabled) return;
            isAutoRefreshEnabled = true;
            refreshTimer = setInterval(wrappedLoadCallback, refreshInterval);
            // Update last refresh time display every second
            lastRefreshTimer = setInterval(updateLastRefreshDisplay, 1000);
            updateStatus();
            updateButtons();
        };

        const stopRefresh = () => {
            if (!isAutoRefreshEnabled) return;
            isAutoRefreshEnabled = false;
            if (refreshTimer) {
                clearInterval(refreshTimer);
                refreshTimer = null;
            }
            if (lastRefreshTimer) {
                clearInterval(lastRefreshTimer);
                lastRefreshTimer = null;
            }
            updateStatus();
            updateButtons();
        };

        // Interval change
        if (intervalSelect) {
            intervalSelect.addEventListener('change', (e) => {
                refreshInterval = parseInt(e.target.value) * 1000;
                updateStatus();
                if (isAutoRefreshEnabled) {
                    stopRefresh();
                    wrappedLoadCallback(); // Immediate refresh on interval change
                    startRefresh();
                }
            });
        }

        // Play/Pause buttons
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                wrappedLoadCallback(); // Immediate refresh when starting
                startRefresh();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', stopRefresh);
        }

        // Initialize UI state
        updateStatus();
        updateButtons();

        // Start auto-refresh by default with initial load
        wrappedLoadCallback();
        startRefresh();

        // Return control functions
        return {
            start: startRefresh,
            stop: stopRefresh,
            isRunning: () => isAutoRefreshEnabled
        };
    },

    /**
     * Create table from data
     */
    createTable(data, columns) {
        if (!data || data.length === 0) {
            return '<tr><td colspan="' + columns.length + '" class="text-center text-muted">No data available</td></tr>';
        }

        let html = '';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                let value = row[col.field];

                // Apply formatter if provided
                if (col.formatter) {
                    value = col.formatter(value, row);
                }

                html += `<td>${value !== null && value !== undefined ? value : '-'}</td>`;
            });
            html += '</tr>';
        });

        return html;
    },

    /**
     * Export chart as image
     */
    exportChartAsImage(chartCanvas, filename = 'chart.png') {
        const url = chartCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    },

    /**
     * Export data as CSV
     */
    exportAsCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header =>
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.click();
    },

    /**
     * Copy text to clipboard
     */
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copied to clipboard', 'success', 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.showNotification('Failed to copy', 'error', 2000);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                this.showNotification('Copied to clipboard', 'success', 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                this.showNotification('Failed to copy', 'error', 2000);
            }
            document.body.removeChild(textarea);
        }
    },

    /**
     * Initialize tooltips (if using Bootstrap tooltips)
     */
    initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },


    extractBackendName(backendName) {
        if (!backendName || backendName === '') {
            return '';
        }

        // Remove protocol suffix (e.g., @file, @docker, @http)
        let name = backendName.split('@')[0];

        // Remove -service suffix if present
        name = name.replace(/-service$/, '');

        // Split by dash
        const parts = name.split('-');

        // If first part is a number (ID), skip it
        let startIndex = 0;
        if (parts.length > 1 && /^\d+$/.test(parts[0])) {
            startIndex = 1;
        }

        // Join remaining parts with spaces
        const result = parts.slice(startIndex).join(' ');

        return result || backendName; // Fallback to original if empty
    },

    /**
     * Format host/backend display with intelligent fallbacks
     * Priority: Host → BackendName (formatted) → BackendURL (hostname) → fallback
     */
    formatHostDisplay(row, fallback = '-') {
        // Priority 1: Host field (check both capitalized and lowercase)
        const host = row.Host || row.host;
        if (host && host !== '') {
            return this.extractBackendName(host);
        }

        // Priority 2: BackendName (formatted) (check both capitalized and lowercase)
        const backendName = row.BackendName || row.backend_name;
        if (backendName && backendName !== '') {
            return this.extractBackendName(backendName);
        }

        // Priority 3: BackendURL (extract hostname) (check both capitalized and lowercase)
        const backendURL = row.BackendURL || row.backend_url;
        if (backendURL && backendURL !== '') {
            try {
                const url = new URL(backendURL);
                return url.hostname || backendURL;
            } catch (e) {
                // Not a valid URL, return as-is
                return this.extractBackendName(backendURL);
            }
        }

        // Priority 4: fallback
        return fallback;
    }
};

// Export for use in other scripts
window.LogLynxUtils = LogLynxUtils;

// ============================================
// Global IP Search Functionality
// ============================================

let globalIPSearchDebounce = null;

// Initialize IP search trigger
function initIPSearch() {
    const trigger = document.getElementById('ipSearchTrigger');
    if (trigger) {
        trigger.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('ipSearchModal'));
            modal.show();
            // Focus on input after modal is shown
            setTimeout(() => {
                document.getElementById('globalIPSearchInput').focus();
            }, 300);
        });
    }

    // Setup autocomplete
    const input = document.getElementById('globalIPSearchInput');
    if (input) {
        input.addEventListener('input', function() {
            const query = this.value.trim();
            
            if (globalIPSearchDebounce) {
                clearTimeout(globalIPSearchDebounce);
            }

            if (query.length < 2) {
                document.getElementById('globalIPSearchResults').innerHTML = '';
                return;
            }

            globalIPSearchDebounce = setTimeout(async () => {
                const results = await LogLynxAPI.searchIPs(query, 10);
                displayGlobalIPSearchResults(results.data || []);
            }, 300);
        });

        // Enter key to search
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalIPSearch();
            }
        });
    }
}

// Display search results
function displayGlobalIPSearchResults(results) {
    const container = document.getElementById('globalIPSearchResults');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No results found</p>';
        return;
    }

    let html = '<div class="list-group">';
    results.forEach(result => {
        html += `
            <a href="/ip/${result.ip_address}" class="list-group-item list-group-item-action" 
               style="background: var(--loglynx-card); border-color: var(--border-color); color: #FFFFFF;">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong style="color: #F46319;">${result.ip_address}</strong>
                        <br>
                        <small class="text-muted">${result.city || 'Unknown'}, ${result.country || 'Unknown'}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge badge-primary">${LogLynxUtils.formatNumber(result.hits)} hits</span>
                        <br>
                        <small class="text-muted">${LogLynxUtils.formatDateTime(result.last_seen)}</small>
                    </div>
                </div>
            </a>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Perform IP search and navigate
function performGlobalIPSearch() {
    const ip = document.getElementById('globalIPSearchInput').value.trim();
    if (ip) {
        window.location.href = `/ip/${ip}`;
    }
}

// Initialize common features on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    LogLynxUtils.initSidebar();
    LogLynxUtils.loadServiceFilter();
    initIPSearch();
});

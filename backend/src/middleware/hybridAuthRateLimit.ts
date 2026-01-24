/**
 * Hybrid Authentication Rate Limiter
 * 
 * Two-tier rate limiting for authentication endpoints:
 * - Tier 1 (IP-based): 20 failures per IP per 15 minutes (anti-bot)
 * - Tier 2 (User-based): 5 failures per user per 15 minutes (anti-credential stuffing)
 * 
 * Solves the NAT/proxy problem where multiple users share an IP address.
 * 
 * @module hybridAuthRateLimit
 */

/** Configuration for rate limiting windows and thresholds */
interface RateLimitConfig {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum attempts allowed in window */
    maxAttempts: number;
    /** Cleanup interval in milliseconds */
    cleanupIntervalMs: number;
}

/** Statistics for monitoring memory usage */
interface RateLimitStats {
    /** Number of tracked IP addresses */
    ipTracked: number;
    /** Number of tracked user identifiers */
    usersTracked: number;
    /** Estimated total memory usage in KB */
    totalMemoryKB: number;
}

/** Attempt record with timestamps */
interface AttemptRecord {
    /** Array of failure timestamps */
    timestamps: number[];
    /** When this record was last updated */
    lastUpdated: number;
}

/**
 * Hybrid rate limiter class with dual IP + User tracking.
 * Uses in-memory Maps for O(1) lookups and automatic cleanup.
 */
class HybridAuthRateLimiter {
    /** Map of IP addresses to attempt records */
    private ipAttempts: Map<string, AttemptRecord> = new Map();

    /** Map of user identifiers to attempt records */
    private userAttempts: Map<string, AttemptRecord> = new Map();

    /** Cleanup interval timer reference */
    private cleanupTimer: NodeJS.Timeout | null = null;

    /** IP rate limit: 20 attempts per 15 minutes */
    private readonly ipConfig: RateLimitConfig = {
        windowMs: 15 * 60 * 1000,  // 15 minutes
        maxAttempts: 20,           // 20 attempts per IP
        cleanupIntervalMs: 5 * 60 * 1000,  // Cleanup every 5 minutes
    };

    /** User rate limit: 5 attempts per 15 minutes */
    private readonly userConfig: RateLimitConfig = {
        windowMs: 15 * 60 * 1000,  // 15 minutes
        maxAttempts: 5,            // 5 attempts per user
        cleanupIntervalMs: 5 * 60 * 1000,  // Cleanup every 5 minutes
    };

    constructor() {
        this.startCleanupInterval();
        console.log('[HybridRateLimit] Initialized with IP limit: 20/15min, User limit: 5/15min');
    }

    /**
     * Normalize an IP address for consistent tracking.
     * Handles IPv6 localhost, strips zone identifiers.
     * 
     * @param ip - Raw IP address from request
     * @returns Normalized IP string
     */
    private normalizeIP(ip: string | undefined): string {
        if (!ip) return 'unknown';

        let normalized = ip.trim().toLowerCase();

        // Handle IPv6 localhost
        if (normalized === '::1' || normalized === '::ffff:127.0.0.1') {
            normalized = '127.0.0.1';
        }

        // Remove IPv6 zone identifier (e.g., %eth0)
        const zoneIndex = normalized.indexOf('%');
        if (zoneIndex !== -1) {
            normalized = normalized.substring(0, zoneIndex);
        }

        // Handle IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
        if (normalized.startsWith('::ffff:')) {
            normalized = normalized.substring(7);
        }

        return normalized;
    }

    /**
     * Normalize a user identifier for consistent tracking.
     * Lowercases username/email and trims whitespace.
     * 
     * @param identifier - Username or email
     * @returns Normalized identifier string
     */
    private normalizeIdentifier(identifier: string | undefined): string {
        if (!identifier || typeof identifier !== 'string') return '';
        return identifier.trim().toLowerCase();
    }

    /**
     * Get valid timestamps within the current window.
     * 
     * @param timestamps - Array of attempt timestamps
     * @param windowMs - Window size in milliseconds
     * @returns Filtered array of valid timestamps
     */
    private getValidTimestamps(timestamps: number[], windowMs: number): number[] {
        const now = Date.now();
        return timestamps.filter(ts => now - ts < windowMs);
    }

    /**
     * Check if an IP address has exceeded the rate limit.
     * 
     * @param ip - Client IP address
     * @returns true if allowed, false if rate limited
     */
    checkIPLimit(ip: string | undefined): boolean {
        const normalizedIP = this.normalizeIP(ip);
        const record = this.ipAttempts.get(normalizedIP);

        if (!record) {
            return true; // No attempts recorded, allow
        }

        const validTimestamps = this.getValidTimestamps(
            record.timestamps,
            this.ipConfig.windowMs
        );

        return validTimestamps.length < this.ipConfig.maxAttempts;
    }

    /**
     * Check if a user identifier has exceeded the rate limit.
     * 
     * @param identifier - Username or email
     * @returns true if allowed, false if rate limited
     */
    checkUserLimit(identifier: string | undefined): boolean {
        const normalizedId = this.normalizeIdentifier(identifier);

        if (!normalizedId) {
            return true; // No identifier provided, allow (auth will fail anyway)
        }

        const record = this.userAttempts.get(normalizedId);

        if (!record) {
            return true; // No attempts recorded, allow
        }

        const validTimestamps = this.getValidTimestamps(
            record.timestamps,
            this.userConfig.windowMs
        );

        return validTimestamps.length < this.userConfig.maxAttempts;
    }

    /**
     * Record a failed authentication attempt for both IP and user.
     * Call this after a failed login attempt.
     * 
     * @param ip - Client IP address
     * @param identifier - Username or email
     */
    recordFailure(ip: string | undefined, identifier: string | undefined): void {
        const now = Date.now();
        const normalizedIP = this.normalizeIP(ip);
        const normalizedId = this.normalizeIdentifier(identifier);

        // Record IP failure
        const ipRecord = this.ipAttempts.get(normalizedIP) || { timestamps: [], lastUpdated: 0 };
        const validIPTimestamps = this.getValidTimestamps(ipRecord.timestamps, this.ipConfig.windowMs);
        validIPTimestamps.push(now);
        this.ipAttempts.set(normalizedIP, { timestamps: validIPTimestamps, lastUpdated: now });

        // Record user failure (only if identifier provided)
        if (normalizedId) {
            const userRecord = this.userAttempts.get(normalizedId) || { timestamps: [], lastUpdated: 0 };
            const validUserTimestamps = this.getValidTimestamps(userRecord.timestamps, this.userConfig.windowMs);
            validUserTimestamps.push(now);
            this.userAttempts.set(normalizedId, { timestamps: validUserTimestamps, lastUpdated: now });
        }

        // Log suspicious activity (potential brute force)
        const currentIPAttempts = this.ipAttempts.get(normalizedIP)?.timestamps.length || 0;
        if (currentIPAttempts >= 15) {
            console.warn(`[HybridRateLimit] ⚠️ Suspicious: ${currentIPAttempts} failures from IP ${normalizedIP}`);
        }
    }

    /**
     * Clear attempt counters for a user after successful login.
     * Only clears user-based counters; IP counters persist to prevent bots.
     * 
     * @param identifier - Username or email
     */
    clearAttempts(identifier: string | undefined): void {
        const normalizedId = this.normalizeIdentifier(identifier);

        if (normalizedId) {
            this.userAttempts.delete(normalizedId);
        }
    }

    /**
     * Get current rate limiter statistics for monitoring.
     * 
     * @returns Statistics object with tracked counts and memory usage
     */
    getStats(): RateLimitStats {
        const ipTracked = this.ipAttempts.size;
        const usersTracked = this.userAttempts.size;

        // Estimate memory usage:
        // - Average key length: ~30 chars = ~60 bytes (UTF-16)
        // - AttemptRecord object overhead: ~50 bytes
        // - Average timestamps array: 5 entries × 8 bytes = 40 bytes
        // - Map entry overhead: ~50 bytes
        // Total per entry: ~200 bytes
        const bytesPerEntry = 200;
        const totalBytes = (ipTracked + usersTracked) * bytesPerEntry;
        const totalMemoryKB = Math.round(totalBytes / 1024);

        return {
            ipTracked,
            usersTracked,
            totalMemoryKB,
        };
    }

    /**
     * Clean up expired entries from both Maps.
     * Runs automatically every 5 minutes.
     */
    private cleanup(): void {
        const now = Date.now();
        let ipCleaned = 0;
        let userCleaned = 0;

        // Clean IP attempts
        for (const [ip, record] of this.ipAttempts.entries()) {
            const validTimestamps = this.getValidTimestamps(record.timestamps, this.ipConfig.windowMs);
            if (validTimestamps.length === 0) {
                this.ipAttempts.delete(ip);
                ipCleaned++;
            } else {
                this.ipAttempts.set(ip, { timestamps: validTimestamps, lastUpdated: now });
            }
        }

        // Clean user attempts
        for (const [userId, record] of this.userAttempts.entries()) {
            const validTimestamps = this.getValidTimestamps(record.timestamps, this.userConfig.windowMs);
            if (validTimestamps.length === 0) {
                this.userAttempts.delete(userId);
                userCleaned++;
            } else {
                this.userAttempts.set(userId, { timestamps: validTimestamps, lastUpdated: now });
            }
        }

        if (ipCleaned > 0 || userCleaned > 0) {
            console.log(`[HybridRateLimit] Cleanup: removed ${ipCleaned} IPs, ${userCleaned} users`);
        }
    }

    /**
     * Start the automatic cleanup interval.
     */
    private startCleanupInterval(): void {
        // Avoid duplicate intervals
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.ipConfig.cleanupIntervalMs);

        // Don't prevent process exit
        this.cleanupTimer.unref();
    }

    /**
     * Stop the cleanup interval (for testing/shutdown).
     */
    stopCleanup(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    /**
     * Reset all rate limiting data (for testing only).
     */
    reset(): void {
        this.ipAttempts.clear();
        this.userAttempts.clear();
    }

    /**
     * Get remaining attempts for an IP (for debugging/testing).
     * 
     * @param ip - IP address to check
     * @returns Number of remaining attempts
     */
    getRemainingIPAttempts(ip: string | undefined): number {
        const normalizedIP = this.normalizeIP(ip);
        const record = this.ipAttempts.get(normalizedIP);

        if (!record) {
            return this.ipConfig.maxAttempts;
        }

        const validTimestamps = this.getValidTimestamps(record.timestamps, this.ipConfig.windowMs);
        return Math.max(0, this.ipConfig.maxAttempts - validTimestamps.length);
    }

    /**
     * Get remaining attempts for a user (for debugging/testing).
     * 
     * @param identifier - Username or email to check
     * @returns Number of remaining attempts
     */
    getRemainingUserAttempts(identifier: string | undefined): number {
        const normalizedId = this.normalizeIdentifier(identifier);

        if (!normalizedId) {
            return this.userConfig.maxAttempts;
        }

        const record = this.userAttempts.get(normalizedId);

        if (!record) {
            return this.userConfig.maxAttempts;
        }

        const validTimestamps = this.getValidTimestamps(record.timestamps, this.userConfig.windowMs);
        return Math.max(0, this.userConfig.maxAttempts - validTimestamps.length);
    }
}

/** Singleton instance for application-wide rate limiting */
export const hybridAuthLimiter = new HybridAuthRateLimiter();

/** Export the class for testing purposes */
export { HybridAuthRateLimiter };

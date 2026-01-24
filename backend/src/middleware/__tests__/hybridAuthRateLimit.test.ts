/**
 * Tests for Hybrid Authentication Rate Limiter
 * 
 * Test cases:
 * 1. Single user blocks after 5 failures
 * 2. Multiple users on same IP - IP blocks after 20 total failures
 * 3. Users on different IPs have isolated limits
 * 4. Memory cleanup after window expires
 * 5. Concurrent access handling
 * 6. IPv6 address handling
 * 7. Edge cases (empty strings, undefined)
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HybridAuthRateLimiter } from '../hybridAuthRateLimit.js';

describe('HybridAuthRateLimiter', () => {
    let limiter: HybridAuthRateLimiter;

    beforeEach(() => {
        limiter = new HybridAuthRateLimiter();
    });

    afterEach(() => {
        limiter.stopCleanup();
        limiter.reset();
    });

    describe('User-based rate limiting (5 failures/15min)', () => {
        it('should allow first 5 login attempts for a user', () => {
            const ip = '192.168.1.1';
            const user = 'testuser@example.com';

            // First 5 failures should pass
            for (let i = 0; i < 5; i++) {
                expect(limiter.checkUserLimit(user)).toBe(true);
                limiter.recordFailure(ip, user);
            }

            // 6th attempt should be blocked
            expect(limiter.checkUserLimit(user)).toBe(false);
        });

        it('should block user after 5 failures', () => {
            const ip = '192.168.1.1';
            const user = 'blocked@example.com';

            // Record 5 failures
            for (let i = 0; i < 5; i++) {
                limiter.recordFailure(ip, user);
            }

            // Should be blocked
            expect(limiter.checkUserLimit(user)).toBe(false);
            expect(limiter.getRemainingUserAttempts(user)).toBe(0);
        });

        it('should clear user counter on successful login', () => {
            const ip = '192.168.1.1';
            const user = 'testuser@example.com';

            // Record 4 failures
            for (let i = 0; i < 4; i++) {
                limiter.recordFailure(ip, user);
            }

            expect(limiter.getRemainingUserAttempts(user)).toBe(1);

            // Simulate successful login - clear attempts
            limiter.clearAttempts(user);

            // Should have full attempts again
            expect(limiter.checkUserLimit(user)).toBe(true);
            expect(limiter.getRemainingUserAttempts(user)).toBe(5);
        });

        it('should treat different users independently', () => {
            const ip = '192.168.1.1';
            const user1 = 'user1@example.com';
            const user2 = 'user2@example.com';

            // Block user1
            for (let i = 0; i < 5; i++) {
                limiter.recordFailure(ip, user1);
            }

            // user1 should be blocked, user2 should be allowed
            expect(limiter.checkUserLimit(user1)).toBe(false);
            expect(limiter.checkUserLimit(user2)).toBe(true);
        });
    });

    describe('IP-based rate limiting (20 failures/15min)', () => {
        it('should allow first 20 login attempts from an IP', () => {
            const ip = '10.0.0.1';

            // First 20 failures should pass
            for (let i = 0; i < 20; i++) {
                expect(limiter.checkIPLimit(ip)).toBe(true);
                limiter.recordFailure(ip, `user${i}@example.com`);
            }

            // 21st attempt should be blocked
            expect(limiter.checkIPLimit(ip)).toBe(false);
        });

        it('should block IP after 20 total failures across different users', () => {
            const ip = '10.0.0.1';

            // 20 different users fail from same IP
            for (let i = 0; i < 20; i++) {
                limiter.recordFailure(ip, `user${i}@test.com`);
            }

            // IP should be blocked for all users
            expect(limiter.checkIPLimit(ip)).toBe(false);
            expect(limiter.getRemainingIPAttempts(ip)).toBe(0);
        });

        it('should NOT clear IP counter on successful login', () => {
            const ip = '10.0.0.1';
            const user = 'testuser@example.com';

            // Record 15 failures
            for (let i = 0; i < 15; i++) {
                limiter.recordFailure(ip, `user${i}@test.com`);
            }

            // Successful login clears USER counter, not IP counter
            limiter.clearAttempts(user);

            // IP should still have tracked failures
            expect(limiter.getRemainingIPAttempts(ip)).toBe(5);
        });
    });

    describe('Hybrid behavior: Multiple users behind same NAT', () => {
        it('should block individual user at 5 failures while allowing others on same IP', () => {
            const sharedIP = '203.0.113.1'; // Office NAT IP
            const user1 = 'alice@company.com';
            const user2 = 'bob@company.com';

            // Alice fails 5 times
            for (let i = 0; i < 5; i++) {
                limiter.recordFailure(sharedIP, user1);
            }

            // Alice is blocked
            expect(limiter.checkUserLimit(user1)).toBe(false);

            // Bob can still login from same IP
            expect(limiter.checkIPLimit(sharedIP)).toBe(true);
            expect(limiter.checkUserLimit(user2)).toBe(true);

            // IP has only 5 failures (within 20 limit)
            expect(limiter.getRemainingIPAttempts(sharedIP)).toBe(15);
        });

        it('should block entire IP when 20 failures occur across different users', () => {
            const sharedIP = '203.0.113.1';

            // 4 users each fail 5 times = 20 failures
            for (let userIdx = 0; userIdx < 4; userIdx++) {
                for (let attemptIdx = 0; attemptIdx < 5; attemptIdx++) {
                    limiter.recordFailure(sharedIP, `user${userIdx}@company.com`);
                }
            }

            // IP should be blocked for everyone
            expect(limiter.checkIPLimit(sharedIP)).toBe(false);

            // New user on same IP should also be blocked
            expect(limiter.checkIPLimit(sharedIP)).toBe(false);
        });
    });

    describe('IPv6 support', () => {
        it('should handle IPv6 addresses', () => {
            const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
            const user = 'ipv6user@example.com';

            expect(limiter.checkIPLimit(ipv6)).toBe(true);
            limiter.recordFailure(ipv6, user);
            expect(limiter.getRemainingIPAttempts(ipv6)).toBe(19);
        });

        it('should normalize IPv6 localhost to IPv4', () => {
            const ipv6Localhost = '::1';
            const user = 'localuser@example.com';

            limiter.recordFailure(ipv6Localhost, user);

            // Should be tracked as 127.0.0.1
            expect(limiter.getRemainingIPAttempts('127.0.0.1')).toBe(19);
        });

        it('should handle IPv4-mapped IPv6 addresses', () => {
            const mappedIPv6 = '::ffff:192.168.1.1';
            const normalIPv4 = '192.168.1.1';
            const user = 'mappeduser@example.com';

            limiter.recordFailure(mappedIPv6, user);

            // Should be tracked as the IPv4 address
            expect(limiter.getRemainingIPAttempts(normalIPv4)).toBe(19);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined IP address', () => {
            expect(limiter.checkIPLimit(undefined)).toBe(true);
            limiter.recordFailure(undefined, 'user@test.com');
            expect(limiter.getRemainingIPAttempts(undefined)).toBe(19);
        });

        it('should handle undefined user identifier', () => {
            // undefined identifier should always be allowed (auth will fail anyway)
            expect(limiter.checkUserLimit(undefined)).toBe(true);

            // Recording with undefined identifier should not throw
            expect(() => limiter.recordFailure('1.2.3.4', undefined)).not.toThrow();
        });

        it('should handle empty string identifier', () => {
            expect(limiter.checkUserLimit('')).toBe(true);
            expect(limiter.checkUserLimit('   ')).toBe(true);
        });

        it('should normalize user identifier to lowercase', () => {
            const ip = '1.2.3.4';
            const user1 = 'TestUser@Example.COM';
            const user2 = 'testuser@example.com';

            limiter.recordFailure(ip, user1);

            // Should be tracked as same user
            expect(limiter.getRemainingUserAttempts(user2)).toBe(4);
        });

        it('should trim whitespace from identifiers', () => {
            const ip = '1.2.3.4';
            const user1 = '  user@test.com  ';
            const user2 = 'user@test.com';

            limiter.recordFailure(ip, user1);

            expect(limiter.getRemainingUserAttempts(user2)).toBe(4);
        });
    });

    describe('Concurrent access', () => {
        it('should handle 10 simultaneous requests without race conditions', async () => {
            const ip = '10.10.10.10';
            const user = 'concurrent@test.com';

            // Simulate 10 concurrent failure recordings
            const promises = Array.from({ length: 10 }, () =>
                Promise.resolve().then(() => {
                    limiter.recordFailure(ip, user);
                })
            );

            await Promise.all(promises);

            // User should have 0 remaining (5 limit hit)
            expect(limiter.getRemainingUserAttempts(user)).toBe(0);

            // IP should have 10 remaining (10 used of 20 limit)
            expect(limiter.getRemainingIPAttempts(ip)).toBe(10);
        });
    });

    describe('Statistics and monitoring', () => {
        it('should return accurate statistics', () => {
            limiter.recordFailure('1.1.1.1', 'user1@test.com');
            limiter.recordFailure('2.2.2.2', 'user2@test.com');
            limiter.recordFailure('1.1.1.1', 'user3@test.com');

            const stats = limiter.getStats();

            expect(stats.ipTracked).toBe(2);  // 2 unique IPs
            expect(stats.usersTracked).toBe(3);  // 3 unique users
            expect(stats.totalMemoryKB).toBeGreaterThan(0);
        });

        it('should estimate memory usage correctly', () => {
            // Add 100 entries
            for (let i = 0; i < 100; i++) {
                limiter.recordFailure(`10.0.0.${i % 256}`, `user${i}@test.com`);
            }

            const stats = limiter.getStats();

            // ~200 bytes per entry × 200 entries = ~40KB
            expect(stats.totalMemoryKB).toBeLessThan(100); // Should be well under 100KB
            expect(stats.totalMemoryKB).toBeGreaterThan(10); // But more than 10KB
        });
    });

    describe('Reset functionality', () => {
        it('should completely reset all tracking data', () => {
            limiter.recordFailure('1.1.1.1', 'user@test.com');
            limiter.recordFailure('2.2.2.2', 'user2@test.com');

            limiter.reset();

            const stats = limiter.getStats();
            expect(stats.ipTracked).toBe(0);
            expect(stats.usersTracked).toBe(0);
        });
    });
});

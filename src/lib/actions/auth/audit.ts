'use server';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import { AUDIT_CONFIG, RISK_SCORES } from '@/lib/config/auth';

// Security: Calculate risk score based on action and context
export async function calculateRiskScore(
  action: string | (typeof AUDIT_CONFIG.HIGH_RISK_ACTIONS)[number],
  metadata: Record<string, any> = {}
): Promise<1 | 2 | 3 | 4> {
  let score: 1 | 2 | 3 | 4 = RISK_SCORES.LOW;

  // Security: High-risk actions
  if (typeof action === 'string' && AUDIT_CONFIG.HIGH_RISK_ACTIONS.includes(action as any)) {
    score = RISK_SCORES.HIGH;
  }

  // Security: Failed authentication attempts
  if (typeof action === 'string' && (action.includes('failed') || action.includes('invalid'))) {
    score = Math.max(score, RISK_SCORES.MEDIUM) as 1 | 2 | 3 | 4;
  }

  // Security: Multiple failed attempts
  if (metadata.failedAttempts && metadata.failedAttempts > 3) {
    score = Math.max(score, RISK_SCORES.HIGH) as 1 | 2 | 3 | 4;
  }

  // Security: Suspicious IP or location
  if (metadata.suspiciousIP || metadata.unusualLocation) {
    score = Math.max(score, RISK_SCORES.HIGH) as 1 | 2 | 3 | 4;
  }

  // Security: Device mismatch
  if (metadata.deviceMismatch) {
    score = Math.max(score, RISK_SCORES.MEDIUM) as 1 | 2 | 3 | 4;
  }

  // Security: Admin actions
  if ((typeof action === 'string' && action.includes('admin')) || metadata.isAdminAction) {
    score = Math.max(score, RISK_SCORES.HIGH) as 1 | 2 | 3 | 4;
  }

  // Security: Critical security events
  if (typeof action === 'string' && (action.includes('breach') || action.includes('compromise'))) {
    score = RISK_SCORES.CRITICAL;
  }

  return score;
}

// Security: Enhanced audit logging with detailed metadata
export async function logAudit(
  userId: string | null,
  action: string | (typeof AUDIT_CONFIG.HIGH_RISK_ACTIONS)[number],
  metadata: {
    ip?: string;
    userAgent?: string;
    location?: string;
    sessionId?: string;
    deviceFingerprint?: string;
    suspiciousIP?: boolean;
    unusualLocation?: boolean;
    deviceMismatch?: boolean;
    failedAttempts?: number;
    isAdminAction?: boolean;
    passwordStrength?: number;
    passwordEntropy?: number;
    riskScore?: number;
    [key: string]: any;
  } = {}
) {
  try {
    // Offload to Redis queue to avoid blocking auth/login path
    const redis = getRedis();
    const job = {
      userId,
      action,
      metadata,
      createdAt: Date.now(),
    };
    // Use simple LPUSH-based queue; background worker will drain it
    // Use fire-and-forget pattern; ignore errors
    // Key name: audit:queue
    // Store as JSON string
    await (async () => {
      try {
        // Upstash has no LPUSH multi by default via our minimal client; emulate via SET with unique key + list index in real impl.
        // For now, write to a time-bucketed key; a cron/worker can drain these keys.
        const bucketKey = `audit:bucket:${Math.floor(Date.now() / 60000)}`; // per-minute bucket
        const existing = await redis.get(bucketKey);
        const arr = existing ? JSON.parse(existing) as any[] : [];
        arr.push(job);
        await redis.set(bucketKey, JSON.stringify(arr), { ex: 60 * 10 }); // keep 10 minutes
      } catch {
        // fallback: direct write (may block slightly but avoids data loss)
        const riskScore = metadata.riskScore || await calculateRiskScore(action, metadata);
        const suspicious = riskScore >= RISK_SCORES.HIGH;
        let location: string | undefined = metadata.location;
        if (!location && metadata.ip) {
          const ipLocation = await getLocationFromIP(metadata.ip);
          location = ipLocation || undefined;
        }
        await prisma.auditLog.create({
          data: {
            userId,
            action,
            ip: metadata.ip,
            userAgent: metadata.userAgent,
            metadata: {
              ...metadata,
              riskScore,
              suspicious,
              location,
              timestamp: new Date().toISOString(),
              sessionId: metadata.sessionId,
              deviceFingerprint: metadata.deviceFingerprint,
            },
          },
        });
        if (suspicious) {
          await triggerSecurityAlert(userId, action, metadata, riskScore);
        }
      }
    })();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT-ENQUEUE] ${action} - User: ${userId} - IP: ${metadata.ip}`);
    }
  } catch (error) {
    // Swallow errors to not block auth
    if (process.env.NODE_ENV === 'development') {
      console.warn('Audit enqueue failed:', error);
    }
  }
}

// Security: Log failed authentication attempts
export async function logFailedAttempt(
  userId: string | null,
  action: string,
  ip?: string,
  userAgent?: string
) {
  try {
    const metadata: any = {
      ip,
      userAgent,
      failedAttempt: true,
    };

    // Security: Track failed attempts count
    if (userId) {
      try {
        const recentFailures = await prisma.auditLog.count({
          where: {
            userId,
            action: { contains: 'failed' },
            createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
          },
        });
        metadata.failedAttempts = recentFailures + 1;
      } catch (err) {
        // Silently handle audit database count failure
      }
    }

    await logAudit(userId, action, metadata);
  } catch (error) {
    console.warn('[AUTH_AUDIT_WARNING] Failed to log failed attempt:', error);
  }
}

// Security: Log successful authentication
export async function logLogin(
  userId: string,
  action: string,
  metadata: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    deviceFingerprint?: string;
  } = {}
) {
  await logAudit(userId, action, {
    ...metadata,
    successfulAuth: true,
  });
}

// Security: Get location from IP address (placeholder implementation)
async function getLocationFromIP(ip: string): Promise<string | null> {
  try {
    // Security: Skip localhost and private IPs
    if (ip === 'localhost' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return 'Local';
    }

    // Security: In production, use a proper IP geolocation service
    // For now, return a placeholder
    return 'Unknown';
  } catch (error) {
    return null;
  }
}

// Security: Trigger security alerts for suspicious activity
async function triggerSecurityAlert(
  userId: string | null,
  action: string,
  metadata: Record<string, any>,
  riskScore: number
) {
  try {
    // Security: Log security alert
    console.warn(`[SECURITY ALERT] High-risk action detected:`, {
      userId,
      action,
      riskScore,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Security: In production, send notifications to security team
    // await sendSecurityNotification(userId, action, metadata, riskScore);

    // Security: Optionally lock account for critical events
    if (riskScore === RISK_SCORES.CRITICAL && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          disabled: true,
          canLogin: false,
        },
      });
    }
  } catch (error) {
    console.error('Failed to trigger security alert:', error);
  }
}

// Security: Clean up old audit logs
export async function cleanupOldAuditLogs(): Promise<void> {
  // Skip cleanup during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  try {
    const cutoffDate = new Date(Date.now() - AUDIT_CONFIG.MAX_LOG_AGE);
    
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  } catch (error) {
    // Silently fail during build - database may not be available
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }
}

// Security: Get audit logs for a user
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      action: true,
      ip: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
    },
  });
}

// Security: Get suspicious activity logs
export async function getSuspiciousActivityLogs(limit: number = 100) {
  return prisma.auditLog.findMany({
    where: {
      metadata: {
        path: ['suspicious'],
        equals: true,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      action: true,
      ip: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
    },
  });
}

// Security: Schedule audit log cleanup
export async function scheduleAuditCleanup() {
  setInterval(async () => {
    await cleanupOldAuditLogs();
  }, AUDIT_CONFIG.CLEANUP_INTERVAL);
}

// Security: Initialize audit cleanup on module load
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  // Only run on server side, not during build
  scheduleAuditCleanup();
}

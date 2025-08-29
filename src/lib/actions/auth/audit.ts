'use server';
import { prisma } from '@/lib/prisma';

// Security: Audit log configuration
export const AUDIT_CONFIG = {
  MAX_LOG_AGE: 90 * 24 * 60 * 60 * 1000, // 90 days
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  HIGH_RISK_ACTIONS: [
    'login_failed',
    'password_changed',
    '2fa_enabled',
    '2fa_disabled',
    'account_locked',
    'suspicious_activity',
    'admin_action',
  ],
} as const;

// Security: Risk scoring configuration
export const RISK_SCORES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

// Security: Calculate risk score based on action and context
export async function calculateRiskScore(
  action: string | (typeof AUDIT_CONFIG.HIGH_RISK_ACTIONS)[number],
  metadata: Record<string, any> = {}
): Promise<(typeof RISK_SCORES)[keyof typeof RISK_SCORES]> {
  let score: (typeof RISK_SCORES)[keyof typeof RISK_SCORES] = RISK_SCORES.LOW;

  // Security: High-risk actions
  if (AUDIT_CONFIG.HIGH_RISK_ACTIONS.includes(action)) {
    score = RISK_SCORES.HIGH;
  }

  // Security: Failed authentication attempts
  if (typeof action === 'string' && (action.includes('failed') || action.includes('invalid'))) {
    score = Math.max(score, RISK_SCORES.MEDIUM);
  }

  // Security: Multiple failed attempts
  if (metadata.failedAttempts && metadata.failedAttempts > 3) {
    score = Math.max(score, RISK_SCORES.HIGH);
  }

  // Security: Suspicious IP or location
  if (metadata.suspiciousIP || metadata.unusualLocation) {
    score = Math.max(score, RISK_SCORES.HIGH);
  }

  // Security: Device mismatch
  if (metadata.deviceMismatch) {
    score = Math.max(score, RISK_SCORES.MEDIUM);
  }

  // Security: Admin actions
  if ((typeof action === 'string' && action.includes('admin')) || metadata.isAdminAction) {
    score = Math.max(score, RISK_SCORES.HIGH);
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
    // Security: Calculate risk score
    const riskScore = metadata.riskScore || await calculateRiskScore(action, metadata);

    // Security: Determine if action is suspicious
    const suspicious = riskScore >= RISK_SCORES.HIGH;

    // Security: Get location information if not provided
    let location = metadata.location;
    if (!location && metadata.ip) {
      location = await getLocationFromIP(metadata.ip);
    }

    // Security: Create audit log entry
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

    // Security: Trigger alerts for high-risk events
    if (suspicious) {
      await triggerSecurityAlert(userId, action, metadata, riskScore);
    }

    // Security: Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${action} - User: ${userId} - Risk: ${riskScore} - IP: ${metadata.ip}`);
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Security: Log failed authentication attempts
export async function logFailedAttempt(
  userId: string | null,
  action: string,
  ip?: string,
  userAgent?: string
) {
  const metadata: any = {
    ip,
    userAgent,
    failedAttempt: true,
  };

  // Security: Track failed attempts count
  if (userId) {
    const recentFailures = await prisma.auditLog.count({
      where: {
        userId,
        action: { contains: 'failed' },
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
      },
    });
    metadata.failedAttempts = recentFailures + 1;
  }

  await logAudit(userId, action, metadata);
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
    console.error('Failed to cleanup old audit logs:', error);
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
if (typeof window === 'undefined') {
  // Only run on server side
  scheduleAuditCleanup();
}

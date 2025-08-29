// Security: Session management configuration
export const SESSION_CONFIG = {
  MAX_SESSIONS_PER_USER: 5,
  SESSION_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  DEVICE_FINGERPRINT_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

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
  LOW: 1 as const,
  MEDIUM: 2 as const,
  HIGH: 3 as const,
  CRITICAL: 4 as const,
} as const;

// Security: Device fingerprint interface
export interface DeviceFingerprint {
  userAgent: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  ip?: string;
}

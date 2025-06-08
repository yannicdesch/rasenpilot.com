
// Audit logging utilities for security monitoring

import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  action: string;
  category: 'security' | 'admin' | 'user' | 'system';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Security-focused audit logger
export const auditLogger = {
  // Log security events
  security: async (action: string, details?: Record<string, any>) => {
    await logAuditEvent({
      action,
      category: 'security',
      severity: 'high',
      details
    });
  },

  // Log admin actions
  admin: async (action: string, details?: Record<string, any>) => {
    await logAuditEvent({
      action,
      category: 'admin',
      severity: 'medium',
      details
    });
  },

  // Log user actions
  user: async (action: string, details?: Record<string, any>) => {
    await logAuditEvent({
      action,
      category: 'user',
      severity: 'low',
      details
    });
  },

  // Log critical system events
  critical: async (action: string, details?: Record<string, any>) => {
    await logAuditEvent({
      action,
      category: 'system',
      severity: 'critical',
      details
    });
  }
};

// Internal function to log audit events
const logAuditEvent = async (entry: AuditLogEntry) => {
  try {
    // Get current user info if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare the log entry
    const logEntry = {
      category: entry.category,
      action: entry.action,
      label: user?.email || entry.userEmail || 'anonymous',
      value: JSON.stringify({
        userId: user?.id || entry.userId,
        severity: entry.severity,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...entry.details
      })
    };

    // Log to events table
    const { error } = await supabase
      .from('events')
      .insert(logEntry);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

// Failed login attempt tracker
export const trackFailedLogin = async (email: string, reason: string) => {
  await auditLogger.security('login_attempt_failed', {
    email,
    reason,
    timestamp: new Date().toISOString()
  });
};

// Successful login tracker
export const trackSuccessfulLogin = async (email: string) => {
  await auditLogger.security('login_successful', {
    email,
    timestamp: new Date().toISOString()
  });
};

// Admin action tracker
export const trackAdminAction = async (action: string, target?: string, details?: Record<string, any>) => {
  await auditLogger.admin(`admin_${action}`, {
    target,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Data modification tracker
export const trackDataModification = async (table: string, operation: 'create' | 'update' | 'delete', recordId?: string) => {
  await auditLogger.admin('data_modification', {
    table,
    operation,
    recordId,
    timestamp: new Date().toISOString()
  });
};

// Security policy violation tracker
export const trackSecurityViolation = async (violation: string, details?: Record<string, any>) => {
  await auditLogger.critical('security_violation', {
    violation,
    timestamp: new Date().toISOString(),
    ...details
  });
};

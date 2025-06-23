
import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  category: string;
  action: string;
  label?: string;
  value?: string | number | null;
  timestamp?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(category: string, action: string, label?: string, details?: Record<string, any>): Promise<void> {
    try {
      const event: AuditEvent = {
        category,
        action,
        label,
        value: null, // Always set to null for complex data
        timestamp: new Date().toISOString()
      };

      // Log details separately if needed
      if (details) {
        console.log(`Audit [${category}/${action}]:`, details);
      }

      const { error } = await supabase
        .from('events')
        .insert([event]);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async security(action: string, details?: Record<string, any>): Promise<void> {
    await this.log('security', action, details?.email || details?.userId, undefined);
  }

  async userAction(action: string, details?: Record<string, any>): Promise<void> {
    await this.log('user_action', action, details?.resource, undefined);
  }

  async systemEvent(action: string, details?: Record<string, any>): Promise<void> {
    await this.log('system', action, details?.component, undefined);
  }
}

export const auditLogger = AuditLogger.getInstance();

export const trackSecurityViolation = async (action: string, details?: Record<string, any>): Promise<void> => {
  await auditLogger.security(`violation_${action}`, details);
};

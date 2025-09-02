"use client";

import { db } from '../config/firebaseconfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface SecurityEvent {
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'file_upload' | 'data_access' | 'rate_limit_exceeded' | 'csp_violation' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;

  private constructor() {}

  public static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  // Log security events
  public async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date()
      };

      // Log to Firestore
      await addDoc(collection(db, 'security_logs'), {
        ...securityEvent,
        timestamp: serverTimestamp()
      });

      // Log to console for immediate visibility
      const logLevel = this.getLogLevel(event.severity);
      console[logLevel]('Security Event:', securityEvent);

      // Check for patterns that require immediate attention
      await this.analyzeSecurityPattern(event);

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Analyze security patterns for threats
  private async analyzeSecurityPattern(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    if (!event.ip) return;

    try {
      // Check for multiple failed login attempts
      if (event.type === 'failed_login') {
        const recentFailures = await this.getRecentEventsByIP(event.ip, 'failed_login', 15); // Last 15 minutes
        if (recentFailures.length >= 5) {
          await this.logSecurityEvent({
            type: 'suspicious_activity',
            severity: 'high',
            ip: event.ip,
            details: {
              pattern: 'multiple_failed_logins',
              count: recentFailures.length,
              timeframe: '15_minutes'
            }
          });
        }
      }

      // Check for suspicious file upload patterns
      if (event.type === 'file_upload') {
        const recentUploads = await this.getRecentEventsByIP(event.ip, 'file_upload', 5); // Last 5 minutes
        if (recentUploads.length >= 10) {
          await this.logSecurityEvent({
            type: 'suspicious_activity',
            severity: 'medium',
            ip: event.ip,
            details: {
              pattern: 'rapid_file_uploads',
              count: recentUploads.length,
              timeframe: '5_minutes'
            }
          });
        }
      }

    } catch (error) {
      console.error('Failed to analyze security pattern:', error);
    }
  }

  // Get recent events by IP
  private async getRecentEventsByIP(ip: string, eventType: string, minutesAgo: number): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - (minutesAgo * 60 * 1000));
    
    const q = query(
      collection(db, 'security_logs'),
      where('ip', '==', ip),
      where('type', '==', eventType),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  // Get log level for console output
  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  // Convenience methods for common security events
  public async logLoginAttempt(email: string, ip?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'login_attempt',
      severity: 'low',
      email,
      ip,
      userAgent
    });
  }

  public async logFailedLogin(email: string, reason: string, ip?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'failed_login',
      severity: 'medium',
      email,
      ip,
      userAgent,
      details: { reason }
    });
  }

  public async logSuspiciousActivity(description: string, ip?: string, url?: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip,
      url,
      details: { description, ...details }
    });
  }

  public async logFileUpload(userId: string, filename: string, fileSize: number, ip?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'file_upload',
      severity: 'low',
      userId,
      ip,
      details: { filename, fileSize }
    });
  }

  public async logUnauthorizedAccess(userId?: string, url?: string, ip?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'unauthorized_access',
      severity: 'high',
      userId,
      url,
      ip,
      userAgent
    });
  }

  public async logRateLimitExceeded(ip: string, endpoint?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      ip,
      details: { endpoint }
    });
  }

  public async logCSPViolation(violation: any, ip?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'csp_violation',
      severity: 'medium',
      ip,
      details: violation
    });
  }
}

export default SecurityMonitoringService;

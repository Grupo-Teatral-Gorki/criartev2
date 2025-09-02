"use client";

import DOMPurify from 'isomorphic-dompurify';

export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Input sanitization
  public sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  public sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // SQL injection prevention
  public validateInput(input: string, type: 'email' | 'text' | 'number' | 'phone'): boolean {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      text: /^[a-zA-Z0-9\s\-_.,!?áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+$/,
      number: /^\d+$/,
      phone: /^[\d\s\-\(\)\+]+$/
    };

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /('|('')|;|--|\/\*|\*\/)/i,
      /(OR|AND)\s+\d+\s*=\s*\d+/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    return patterns[type].test(input);
  }

  // XSS prevention
  public escapeHtml(input: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  // File upload security
  public validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Check MIME type
    if (!allowedTypes.includes(fileType)) {
      return false;
    }

    // Check file extension
    const extension = fileName.split('.').pop();
    const allowedExtensions = allowedTypes.map(type => {
      const extensionMap: { [key: string]: string[] } = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'application/pdf': ['pdf'],
        'application/msword': ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
        'application/vnd.ms-excel': ['xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx']
      };
      return extensionMap[type] || [];
    }).flat();

    return extension ? allowedExtensions.includes(extension) : false;
  }

  public validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  // Password security
  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '12345678'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting helper
  public checkRateLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
      return true;
    }

    const data = JSON.parse(stored);
    
    // Reset if window has passed
    if (now - data.firstAttempt > windowMs) {
      localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
      return true;
    }

    // Check if limit exceeded
    if (data.count >= maxAttempts) {
      return false;
    }

    // Increment counter
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }

  // Session security
  public generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Content Security Policy violation reporting
  public reportCSPViolation(violation: any): void {
    console.warn('CSP Violation:', violation);
    // In production, send to security monitoring service
  }

  // Security event logging
  public logSecurityEvent(event: {
    type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'file_upload' | 'data_access';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
  }): void {
    const securityLog = {
      timestamp: new Date().toISOString(),
      ...event
    };
    
    console.warn('Security Event:', securityLog);
    // In production, send to security monitoring service
  }
}

export default SecurityService;

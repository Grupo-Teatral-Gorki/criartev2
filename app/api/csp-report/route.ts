import { NextRequest, NextResponse } from 'next/server';
import SecurityMonitoringService from '../../services/securityMonitoringService';

export async function POST(request: NextRequest) {
  try {
    const securityMonitoring = SecurityMonitoringService.getInstance();
    const violation = await request.json();
    
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    
    // Log CSP violation
    await securityMonitoring.logCSPViolation(violation, ip);
    
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('CSP violation report error:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}

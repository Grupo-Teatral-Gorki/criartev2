import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Security configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const SUSPICIOUS_PATTERNS = [
  /(\<script\>|\<\/script\>)/i,
  /(union.*select|select.*from|insert.*into|delete.*from|drop.*table)/i,
  /(\.\.\/|\.\.\\)/g, // Path traversal
  /(\%3C|\%3E|\%22|\%27)/i, // URL encoded XSS attempts
];

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

function detectSuspiciousActivity(req: NextRequest): boolean {
  const url = req.url.toLowerCase();
  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
  
  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // Check for suspicious user agents
  const suspiciousAgents = ["sqlmap", "nmap", "nikto", "burp", "zap"];
  if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
    return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Get client IP
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com; frame-src 'self' https://accounts.google.com;"
  );

  // Rate limiting check
  if (!checkRateLimit(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Suspicious activity detection
  if (detectSuspiciousActivity(req)) {
    console.warn(`Suspicious activity detected from IP: ${ip}, URL: ${req.url}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Authentication check
  const token = req.cookies.get("token")?.value;
  const isPublicPage = req.nextUrl.pathname === "/";
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return response;
  }

  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!$).*)"],
};

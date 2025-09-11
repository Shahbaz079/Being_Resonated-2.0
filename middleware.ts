import { RateLimiterMemory } from 'rate-limiter-flexible';
import arcjet, { shield } from "@arcjet/next";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Configuration for rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of requests allowed
  duration: 1, // Per second
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

// Helper function to extract IP
const getClientIp = (req: NextRequest) => {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/aboutus',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-email',
  '/api/auth/magic-login',
  '/api/auth/session',
  // Keep some existing routes for transition
  '/sign-in',
  '/sign-up'
];

// System routes that should always be protected
const protectedSystemRoutes = [
  '/.env',
  '/.json',
  '/config.yml',
  '/.git',
  '/.htaccess',
  '/.htpasswd',
  '/node_modules',
  '/package-lock.json',
  '/package.json',
  '/Dockerfile',
  '/docker-compose.yml',
  '/.DS_Store',
  '/.idea',
  '/.vscode',
  '/backup/',
  '/logs/',
  '/.ssh',
  '/credentials'
];

const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

const isProtectedSystemRoute = (pathname: string): boolean => {
  return protectedSystemRoutes.some(route => 
    pathname.startsWith(route)
  )
}

export default async function middleware(req: NextRequest) {
  const clientIp = getClientIp(req);
  const { pathname } = req.nextUrl;

  // Rate limiting
  try {
    await rateLimiter.consume(clientIp);
  } catch (rateLimiterRes) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
  }

  // Arcjet protection
  const decision = await aj.protect(req);

  // Always block access to system files
  if (isProtectedSystemRoute(pathname) || decision.isDenied()) {
    // Get current user for logging
    const currentUser = await getCurrentUser(req);
    
    console.error(`Unauthorized access attempt:
      - IP: ${clientIp}
      - User ID: ${currentUser?.id || "Unauthenticated"}
      - Email: ${currentUser?.email || "Unknown"}
      - URL: ${req.url}`);

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const currentUser = await getCurrentUser(req);
  
  // Debug logging
  console.log('Middleware check:', {
    pathname,
    currentUser: currentUser ? 'Authenticated' : 'Not authenticated',
    authTokenCookie: req.cookies.get('auth-token')?.value ? 'Present' : 'Missing'
  });
  
  if (!currentUser) {
    // Debug logging
    console.log('Redirecting to login - no current user');
    
    // Redirect to login for page routes
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Return 401 for API routes
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // User is authenticated, allow access
  console.log('Allowing access - user authenticated');
  return NextResponse.next();
}
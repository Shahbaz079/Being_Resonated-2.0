import { RateLimiterMemory } from 'rate-limiter-flexible';
import arcjet, { shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Configuration for rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of requests allowed
  duration: 1, // Per second
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

// Helper function to extract IP
const getClientIp = (req:any) => {
  // Try to retrieve the IP from headers or connection info
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] || // Use X-Forwarded-For if behind a proxy
    req.headers.get("cf-connecting-ip") ||              // For Cloudflare
    req.ip ||                                           // Fallback (if supported by host)
    "127.0.0.1"                                         // Default to localhost in dev
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

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api/webhooks(.*)', '/sign-up(.*)', '/', '/login', '/register', '/aboutus']);


const isProtectedRoute = createRouteMatcher([
  '/.env(.*)',               // Environment files
  '/.json(.*)',              // JSON configuration files
  '/config.yml',         // YAML configuration files
  '/.git',               // Git metadata
  '/.htaccess',          // Apache configuration
  '/.htpasswd',          // Authentication details
  '/node_modules',       // Dependencies
  '/package-lock.json',  // Package manager lock file
  '/package.json',       // Package manager file
  '/Dockerfile',         // Docker configuration
  '/docker-compose.yml', // Docker Compose configuration
  '/.DS_Store',          // macOS directory metadata
  '/.idea',              // JetBrains IDE configuration
  '/.vscode',            // Visual Studio Code configuration
  '/backup/',            // Backups
  '/logs/',              // Log files
  '/.ssh(.*)',               // SSH keys
  '/credentials'         // AWS credentials or similar files
]);


export default clerkMiddleware(async (auth, req) => {
  const clientIp = getClientIp(req); // Extract client IP
  // Rate Limiter 


  try {
    await rateLimiter.consume(clientIp); // req.ip should provide the client's IP address
  } catch (rateLimiterRes) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
  }

  const decision = await aj.protect(req);

  if(isProtectedRoute(req) || decision.isDenied()) {
  const { userId } =await auth();
    
    // Get email if available

    console.error(`Unauthorized access attempt:
      - IP: ${clientIp}
      - User ID: ${userId || "Unauthenticated"}
      
      - URL: ${req.url}`);

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

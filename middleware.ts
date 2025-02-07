import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

// Define public routes
const isPublicRoute = (path: string): boolean => {
  const publicRoutes = [
    /^\/sign-in(.*)$/,
    /^\/api\/webhooks(.*)$/,
    /^\/sign-up(.*)$/,
    /^\/$/,
    /^\/login$/,
    /^\/register$/,
    /^\/aboutus$/
  ];
  return publicRoutes.some((route) => route.test(path));
};

// Define a regex to match sensitive file extensions
const isSensitiveFile = (path: string): boolean => {
  const sensitiveFiles = [
    /\.json$/,
    /\.env$/,
    /\.ssh\/id_ecdsa$/,
    /\.ssh\/id_ecdsa\.pub$/,
    /\.ssh\/id_ed255$/,
    /\/server\.key$/,
    /\.backup$/,
    /\/\.kube\/config$/,
    /\.pem$/,              // Private keys
    /\.crt$/,              // SSL certificates
    /\.key$/,              // Private keys
    /\/config\/secrets\.yml$/, // Custom secrets files
    /\/docker-compose\.yml$/,  // Docker configurations
    /\/\.git\/config$/,        // Git configurations
    /\/\.aws\/credentials$/,   // AWS credentials
    /\.p12$/,              // PKCS12 certificates
    /\.jks$/,              // Java KeyStore files
    /\/\.gcloud\/config$/,     // Google Cloud SDK configurations
    /\/\.netrc$/,              // Netrc files for stored credentials
    /\/wp-admin\/setup-config\.php$/, // WordPress setup config file
    /\.php$/                // Any PHP files
  ];
  return sensitiveFiles.some((pattern) => pattern.test(path));
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const url = request.nextUrl.pathname;

  // Block access to sensitive files
  if (isSensitiveFile(url)) {
    return NextResponse.rewrite(new URL('/403', request.url)); // Redirect to a 403 Forbidden page
  }

  // Protect routes that are not public
  if (!isPublicRoute(url)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

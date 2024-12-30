import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/login', '/register']);

export default clerkMiddleware(async (auth, request) => {
 {/* const userid = request.nextUrl.searchParams.get('uid');
  const { pathname, origin } = request.nextUrl;

  if (pathname.startsWith('/event/')) {
    const eventId = pathname.split('/')[2];

    // Ensure the full URL is used in the fetch request
    const response = await fetch(`${origin}/api/event?id=${eventId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const event = await response.json();

    const isMember = event?.members.some((member: { _id: string }) => member._id.toString() === userid);
    if (!isMember) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }
*/}
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
   // '/event/:eventId*',
  ],
};

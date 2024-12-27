import arcjet, { detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const   isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/account(.*)",
    "/transcation(.*)",
]);

const aj = arcjet({
  key: process.env.ARCJET_KEY,  // Your Arcjet API key from environment variables
  rules: [
    // Rule 1: Shield protection
    shield({
      mode: "LIVE"  // Running in live mode (as opposed to test/development)
    }),
    
    // Rule 2: Bot detection
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",  // Allows search engine bots (like Google, Bing)
        "GO_HTTP"                  // Allows Go HTTP client (used by Inngest)
      ]
    })
  ]
});

const clerk = clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    if (!userId && isProtectedRoute(req)) {
      const { redirectToSignIn } = await auth();
      
      return redirectToSignIn();
    }
  
});

export default clerkMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
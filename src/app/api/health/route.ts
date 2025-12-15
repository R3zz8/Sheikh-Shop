import { NextResponse } from 'next/server';

/**
 * Provides a lightweight health check endpoint for monitoring systems.
 *
 * @endpoint GET /api/health
 * @description This endpoint is designed to be a simple, fast, and reliable indicator
 * that the Next.js server process is running and able to respond to requests.
 * It intentionally avoids any external dependencies like database or cache connections
 * to ensure its response time is minimal and not affected by downstream service health.
 *
 * A 200 OK response from this endpoint signals that the application is "alive".
 * For deeper dependency checks (e.g., database connectivity), a separate, less frequently polled
 * endpoint (e.g., /api/status) should be used.
 */
export async function GET() {
  try {
    // PPS-FIX: Removed database queries from the primary health check.
    // A health check should be lightweight and only confirm the server process is responsive.
    // It should not depend on external services like the database.
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // This catch block will now only handle errors from Next.js server itself
    // rather than database connection errors.
    console.error('Health check failed unexpectedly:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'An unknown server error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
  }
)

export default async function captureException(error: Error | unknown, distinctId: string = 'server'): Promise<void> {
  try {
    // Extract error properties safely
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    await posthog.capture({
      distinctId: distinctId,
      event: 'server_error',
      properties: {
        error_name: errorObj.name || 'Error',
        error_message: errorObj.message || 'Unknown error',
        error_stack: errorObj.stack || '',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
      }
    });
  } catch (captureError) {
    console.error('Error capturing exception:', captureError)
  }
}
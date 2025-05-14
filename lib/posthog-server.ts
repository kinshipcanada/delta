import { PostHog } from 'posthog-node'

let posthogInstance: PostHog | null = null

export default function getPostHogServer(): PostHog {
  if (!posthogInstance) {
    posthogInstance = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
        flushAt: 1,
        flushInterval: 0
      }
    )
  }
  return posthogInstance
}

export async function posthogLogger(error: Error | unknown, distinctId: string = 'server'): Promise<void> {
  const posthog = getPostHogServer()
  
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
    console.error('Error capturing server exception:', captureError)
  }
}
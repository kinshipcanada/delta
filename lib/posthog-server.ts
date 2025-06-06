import { PostHog } from 'posthog-node'

// Initialize PostHog with your server-side key
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com' }
)

export const posthogLogger = async (error: Error, context: any = {}) => {
  try {
    await posthog.capture({
      distinctId: 'server',
      event: 'server_error',
      properties: {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        ...context
      }
    })
    
    // Flush the event to ensure it's sent
    await posthog.shutdown()
  } catch (e) {
    console.error('Failed to send error to PostHog:', e)
  }
}
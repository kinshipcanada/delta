import { PostHog } from 'posthog-node'
import type { NextApiRequest, NextApiResponse } from 'next'

const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com' }
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { error, context } = req.body

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

    await posthog.shutdown()
    res.status(200).json({ success: true })
  } catch (e) {
    console.error('Failed to log error:', e)
    res.status(500).json({ error: 'Failed to log error' })
  }
}

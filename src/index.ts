import { Hono } from 'hono'

// Type definition to make type inference
type Variables = {
  GITHUB_APP_ID: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', (c) => {
  return c.text('Hello there!')
})

app.post('/api/handle/form', async c => {
  const { req, env } = c
  const currentUrl = req.url
  const matches = currentUrl.match(/^(https?:\/\/[^/]+)/)
  if (matches !== null) {
    const baseUrl = matches[1]
  }

  const appId = env.GITHUB_APP_ID
  return c.text('Created', 201)
})

app.all('*', () => new Response('These are not the droids you are looking for', { status: 404 }))

export default app

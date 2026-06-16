import { Hono } from 'hono'

const app = new Hono()

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

  return c.text('Created', 201)
})

app.all('*', () => new Response('These are not the droids you are looking for', { status: 404 }))

export default app

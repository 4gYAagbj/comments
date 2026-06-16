import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello there!')
})

app.all('*', () => new Response('These are not the droids you are looking for', { status: 404 }));

export default app

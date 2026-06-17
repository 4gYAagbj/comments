import { Hono } from 'hono'
import { cors } from 'hono/cors'
import yaml from 'yaml'
import { Base64 } from 'js-base64'
import GitHub from './github'
import { convertFormDataToObject } from './util'

// Type definition to make type inference
type Variables = {
  GITHUB_APP_ID: string,
  GITHUB_APP_PRIVATE_KEY: string,
  GITHUB_ORGANIZATION_SLUG: string,
  GITHUB_REPOSITORY_SLUG: string,
  GITHUB_REPOSITORY_BRANCH: string,
  CW_DEBUG: boolean
}

const app = new Hono<{ Variables: Variables }>()

// CORS should be called before the route
// app.use('/api/*', cors())
app.use(
  '/api2/*',
  cors({
    origin: 'http://example.com',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
)

app.use(
  '/api3/*',
  cors({
    origin: ['https://example.com', 'https://example.org'],
  })
)

// Or you can use "function"
app.use(
  '/api4/*',
  cors({
    // `c` is a `Context` object
    origin: (origin, c) => {
      return origin.endsWith('.example.com')
        ? origin
        : 'http://knurra.com'
    },
  })
)

app.get('/api/hello',c=>c.text('hello stupid'))
app.get('/api2/hello',c=>c.text('hello stupid#2'))
app.get('/api3/hello',c=>c.text('hello stupid#3'))
app.get('/api4/hello',c=>c.text('hello stupid#4'))

app.get('/korv', async (c) => {
  const { req, env } = c
  const currentUrl = req.url
  const matches = currentUrl.match(/^(https?:\/\/[^/]+)/)
  if (matches !== null) {
    const baseUrl = matches[1]
  }

  const appId = env.GITHUB_APP_ID
  // We need to format the private key to handle the line breaks accordingly
  const formattedPrivateKey = env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n')
  const organizationSlug = env.GITHUB_ORGANIZATION_SLUG
  const repositorySlug = env.GITHUB_REPOSITORY_SLUG
  const repositoryBranch = env.GITHUB_REPOSITORY_BRANCH
  const shouldDebug = env.CW_DEBUG === 'true'
  const gh = await GitHub.initialize(appId, formattedPrivateKey, organizationSlug, repositorySlug)
  const staticmanFile = await gh.getFileFromRepository('staticman.yml', repositoryBranch)
  if (!staticmanFile?.content) {
    return c.text('Missing staticman.yml', 500)
  }

  const staticmanConfigJson = yaml.parse(Base64.decode(staticmanFile.content))
  const staticmanCommentsConfig = staticmanConfigJson.comments

  let body;
  const contentTypeHeader = req.header('Content-Type');

  if (contentTypeHeader === 'application/x-www-form-urlencoded') {
    body = convertFormDataToObject(await req.parseBody())
  } else if (contentTypeHeader === 'application/json') {
    body = await req.json()
  } else {
    return c.text('Unsupported Content-Type', 400)
  }

  // Handle the fields and options
  const fieldValues = body.fields || {}
  const optionValues = body.options || {}
  if (shouldDebug) console.log(fieldValues)

// Handle the default config from the yml file
  const allowedFields = staticmanCommentsConfig?.allowedFields || []

  return c.text('Hello you there!')
})

app.post('/api/handle/form', async c => {
  const { req, env } = c
  const currentUrl = req.url
  const matches = currentUrl.match(/^(https?:\/\/[^/]+)/)
  if (matches !== null) {
    const baseUrl = matches[1]
  }

  const appId = env.GITHUB_APP_ID
  // We need to format the private key to handle the line breaks accordingly
  const formattedPrivateKey = env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n')
  const organizationSlug = env.GITHUB_ORGANIZATION_SLUG
  const repositorySlug = env.GITHUB_REPOSITORY_SLUG
  // const gh = await GitHub.initialize(appId, formattedPrivateKey, organizationSlug, repositorySlug)
  return c.text('Created', 201)
})

app.all('*', () => new Response('These are not the droids you are looking for', { status: 404 }))

export default app

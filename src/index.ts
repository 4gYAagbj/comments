import { Hono } from 'hono'
import GitHub from './github'

// Type definition to make type inference
type Variables = {
  GITHUB_APP_ID: string,
  GITHUB_APP_PRIVATE_KEY: string,
  GITHUB_ORGANIZATION_SLUG: string,
  GITHUB_REPOSITORY_SLUG: string,
  GITHUB_REPOSITORY_BRANCH: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
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
  const gh = await GitHub.initialize(appId, formattedPrivateKey, organizationSlug, repositorySlug)
  const staticmanFile = await gh.getFileFromRepository('staticman.yml', repositoryBranch)
  if (!staticmanFile?.content) {
    console.log('organizationSlug: '+organizationSlug)
    console.log('repositorySlug: '+repositorySlug)
    console.log('repositoryBranch: '+repositoryBranch)
    return c.text('Missing staticman.yml', 500);
  }

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

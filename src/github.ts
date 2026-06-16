import githubAppJwt from 'universal-github-app-jwt'
import { gatherResponse } from './util'

const shouldFakeUserAgent = false

const defaultHeaders = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}

class GitHub {
    static async initialize(appId, privateKey, organizationSlug, repositorySlug) {
        const { token } = await githubAppJwt({
            id: appId,
            privateKey
        })

        const { token: installationToken } = await this.getInstallationTokenByOrgName(
            appId,
            token,
            organizationSlug
        )

        return null
    }

    static async getInstallationTokenByOrgName(appId, appBearerToken, organizationSlug) {
        const headers = {
            ...defaultHeaders,
            'User-Agent': shouldFakeUserAgent
                ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.200'
                : `comment-worker-${appId}`,
            Authorization: `Bearer ${appBearerToken}`
        };

        const appInstallationsResponse = await fetch('https://api.github.com/app/installations', {
            headers
        })

        const appInstallations = await gatherResponse(appInstallationsResponse)
        const installation = appInstallations.find(item => item.account.login === organizationSlug)
        const installationTokenResponse = await fetch(installation.access_tokens_url, {
            method: 'POST',
            headers
        })

        const installationToken = await gatherResponse(installationTokenResponse)
        return installationToken
    }
}

export default GitHub
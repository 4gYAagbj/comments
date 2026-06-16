import githubAppJwt from 'universal-github-app-jwt'

class GitHub {
    static async initialize(appId, privateKey, organizationSlug, repositorySlug) {
        const { token } = await githubAppJwt({
            id: appId,
            privateKey
        })

        return null
    }
}

export default GitHub
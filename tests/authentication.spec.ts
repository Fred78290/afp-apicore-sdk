import dotenv from 'dotenv'
import ApiCore from '../src/afp-apicore-sdk'
import ApiCoreAuth from '../src/apicore/authentication'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

const {
  APICORE_PROD_URL: baseUrl,
  APICORE_API_KEY: apiKey,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password,
  APICORE_CUSTOM_AUTH_URL: customAuthUrl
} = process.env

describe('AFP ApiCore Auth', () => {
  describe('Initialization', () => {
    test('should return true when apicore is instance of ApiCore', () => {
      const apicore = new ApiCore()
      expect(apicore instanceof ApiCore).toBeTruthy()
      const auth = new ApiCoreAuth()
      expect(auth instanceof ApiCoreAuth).toBeTruthy()
    })

    test('should reset token on init', () => {
      const apicore = new ApiCore()
      expect(apicore.token).toBeUndefined()
    })

    test('should allow to change base url in constructor', () => {
      const apicore = new ApiCore({ baseUrl: 'http://customBase' })
      expect(apicore.authUrl.includes('http://customBase')).toBeTruthy()
    })
  })

  describe('Authentication', () => {
    test(
      'should return an anonymous token when called without api key',
      async () => {
        const apicore = new ApiCore({ baseUrl })
        const token = await apicore.authenticate()

        expect(typeof token.accessToken).toBe('string')
        expect(typeof token.refreshToken).toBe('string')
        expect(typeof token.tokenExpires).toBe('number')
        expect(token.authType).toBe('anonymous')
        expect(token).toEqual(apicore.token)

        const newToken = await apicore.authenticate()

        expect(newToken).toEqual(token)
      }
    )

    test(
      'should throw if called with api key but without credentials',
      () => {
        const apicore = new ApiCore({ baseUrl, apiKey })

        return expect(apicore.authenticate()).rejects.toEqual(new Error('You need to authenticate with credentials once'))
      }
    )

    test(
      'should throw if called with credentials but without api key',
      () => {
        const apicore = new ApiCore({ baseUrl })

        return expect(apicore.authenticate({ username: 'TEST', password: 'TEST' })).rejects.toEqual(new Error('You need an api key to make authenticated requests'))
      }
    )

    test(
      'should throw if called with api key and wrong credentials',
      async () => {
        const apicore = new ApiCore({ baseUrl, apiKey })

        return expect(apicore.authenticate({ username: 'TEST', password: 'TEST' })).rejects.toEqual(new Error('Invalid basic authentication token'))
      }
    )

//    test(
//      'should return an authenticated token when called with api key and credentials',
//      async () => {
//        const apicore = new ApiCore({ baseUrl, apiKey })
//        const token = await apicore.authenticate({ username, password })
//
//        expect(typeof token.accessToken).toBe('string')
//        expect(typeof token.refreshToken).toBe('string')
//        expect(typeof token.tokenExpires).toBe('number')
//        expect(token.authType).toBe('credentials')
//        expect(token).toEqual(apicore.token)
//      }
//    )

    test(
      'should return an authenticated token when called with client id and client secret',
      async () => {
        const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
        const token = await apicore.authenticate({ username, password })

        expect(typeof token.accessToken).toBe('string')
        expect(typeof token.refreshToken).toBe('string')
        expect(typeof token.tokenExpires).toBe('number')
        expect(token.authType).toBe('credentials')
        expect(token).toEqual(apicore.token)
      }
    )

    test('should authorization headers be an empty object when token is not set and use customAuthUrl', () => {
      const apicore = new ApiCore({ baseUrl, customAuthUrl })

      expect(apicore.authorizationBearerHeaders).toEqual({})
    })

    test('should return an authenticated token when called without apiKey but credentials and a custom auth url', async () => {
      const apicore = new ApiCore({ baseUrl, customAuthUrl })

      expect(apicore.authUrl).toBe(customAuthUrl)

      const token = await apicore.authenticate({ username, password })

      expect(typeof token.accessToken).toBe('string')
      expect(typeof token.refreshToken).toBe('string')
      expect(typeof token.tokenExpires).toBe('number')
      expect(token.authType).toBe('credentials')
      expect(token).toEqual(apicore.token)
    })

    test('should refresh token when token expires with api key', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      const token = await apicore.authenticate({ username, password })

      expect(token.authType).toBe('credentials')
      apicore.token = { ...token, tokenExpires: 0 }

      const newToken = await apicore.authenticate()

      expect(newToken.accessToken).not.toEqual(token.accessToken)
      expect(newToken.authType).toBe('credentials')
    })

    test('should refresh token when token expires with custom auth url', async () => {
      const apicore = new ApiCore({ baseUrl, customAuthUrl })
      const token = await apicore.authenticate({ username, password })

      expect(token.authType).toBe('credentials')

      apicore.token = { ...token, tokenExpires: 0 }

      const newToken = await apicore.authenticate()

      expect(newToken.accessToken).not.toEqual(token.accessToken)
      expect(newToken.authType).toBe('credentials')
    })

    test('should not refresh token when token is valid', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      const token = await apicore.authenticate({ username, password })
      const newToken = await apicore.authenticate()

      expect(token.accessToken).toEqual(newToken.accessToken)
      expect(token.authType).toBe('credentials')
    })

    test('should not refresh token when token is valid with custom auth url', async () => {
      const apicore = new ApiCore({ baseUrl, customAuthUrl })
      const token = await apicore.authenticate({ username, password })
      const newToken = await apicore.authenticate()

      expect(token.accessToken).toEqual(newToken.accessToken)
      expect(token.authType).toBe('credentials')
    })

    test('should allow to delete token', async () => {
      const apicore = new ApiCore({ baseUrl })
      await apicore.authenticate()

      apicore.resetToken()

      expect(apicore.token).toBeUndefined()
    })

    test('should throw if sending an incorrect access token', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      const token = await apicore.authenticate({ username, password })

      token.accessToken = 'false'
      apicore.token = token

      return expect(apicore.search()).rejects.toEqual(new Error('Invalid access token: false'))
    })

    test('should allow to save token', done => {
      const apicore = new ApiCore({
        baseUrl,
        saveToken: token => {
          expect(token).toEqual(apicore.token)
          done()
        }
      })

      apicore.authenticate()
    })
  })

  // describe('User', () => {
  //   test('should get info about user', async () => {
  //     const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
  //     await apicore.authenticate({ username, password })
  //     const info = await apicore.me()
  //     expect(info.username).toEqual(username)
  //     expect(typeof info.email).toBe('string')
  //   })
  // })
})

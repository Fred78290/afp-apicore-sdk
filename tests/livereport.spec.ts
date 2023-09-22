import dotenv from 'dotenv'
import ApiCoreLiveReport from '../src/apicore/livereport'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

const {
  APICORE_BASE_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password
} = process.env

describe('AFP ApiCore Livereport', () => {
  test('should return true when livereport is instance of ApiCoreLiveReport', () => {
    const livereport = new ApiCoreLiveReport()
    expect(livereport instanceof ApiCoreLiveReport).toBeTruthy()
  })

  describe('OnAir', () => {
    test('should return livereport onair', async () => {
      const livereport = new ApiCoreLiveReport({ baseUrl, clientId, clientSecret })
      await livereport.authenticate({ username, password })

      const result = await livereport.onair('fr')

      if (result === null) {
        expect(result).toBeTruthy()
      } else {
        expect(typeof result).toBe('object')
      }
    })
  })

  describe('List', () => {
    test('should return all livereport', async () => {
      const livereport = new ApiCoreLiveReport({ baseUrl, clientId, clientSecret })

      await livereport.authenticate({ username, password })

      const result = await livereport.livereports('fr')

      if (result === null) {
        expect(result).toBeTruthy()
      } else {
        expect(typeof result).toBe('object')
        expect(Array.isArray(result.livereports)).toBeTruthy()
        expect(result.livereports.length).toBeGreaterThanOrEqual(1)
        expect(typeof result.livereports[0]).toBe('object')
      }
    })
  })

  describe('List', () => {
    test('should return one livereport', async () => {
      const livereportID = 'newsml.afp.com.20230809.a7835268-d966-4ca4-8dec-11607a87a1ff'
      const livereport = new ApiCoreLiveReport({ baseUrl, clientId, clientSecret })

      await livereport.authenticate({ username, password })

      const result = await livereport.get(livereportID, 'fr')

      if (result === null) {
        expect(result).toBeTruthy()
      } else {
        expect(typeof result).toBe('object')
        expect(result.livereport.liveReportID).toEqual(livereportID)
      }
    })
  })

})

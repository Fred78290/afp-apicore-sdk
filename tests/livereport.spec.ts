import dotenv from 'dotenv'
import ApiCoreLiveReport from '../src/apicore/livereport'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH
const livereportID = 'newsml.afp.com.20230809.a7835268-d966-4ca4-8dec-11607a87a1ff'

dotenv.config({ path: configPath })

const {
  APICORE_BASE_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password
} = process.env

describe('AFP ApiCore Livereport', () => {
  const livereport = new ApiCoreLiveReport({ baseUrl, clientId, clientSecret })

  test('should return true when livereport is instance of ApiCoreLiveReport', () => {
    const livereport = new ApiCoreLiveReport()
    expect(livereport instanceof ApiCoreLiveReport).toBeTruthy()
  })

  test('should return livereport onair', async () => {
    await livereport.authenticate({ username, password })

    const result = await livereport.onair('fr')

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  test('should return all livereport', async () => {
    await livereport.authenticate({ username, password })

    const result = await livereport.livereports('fr')

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(Array.isArray(result.livereports)).toBeTruthy()
    expect(result.livereports.length).toBeGreaterThanOrEqual(1)
    expect(typeof result.livereports[0]).toBe('object')
  })

  test('should return one livereport', async () => {
    await livereport.authenticate({ username, password })

    const result = await livereport.livereport(livereportID, 'fr')

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result.livereport.liveReportID).toEqual(livereportID)
  })

})

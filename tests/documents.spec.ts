import dotenv from 'dotenv'
import ApiCore from '../src/apicore/api'
import { Params } from '../src/types'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

const {
  APICORE_BASE_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password
} = process.env

describe('AFP ApiCore Search', () => {
  test('should return true when apicore is instance of ApiCore', () => {
    const apicore = new ApiCore()
    expect(apicore instanceof ApiCore).toBeTruthy()
  })

  describe('Search', () => {
    test('should return the default search params', () => {
      const apicore = new ApiCore({ baseUrl })

      expect(Object.keys(apicore.defaultSearchParams).sort()).toEqual([
        'langs',
        'urgencies',
        'query',
        'size',
        'dateFrom',
        'dateTo',
        'sortField',
        'sortOrder',
        'products',
        'sources',
        'topics'
      ].sort())
    })

    test(
      'should return a news array with anonymous token, without explicit call to authenticate',
      async () => {
        const apicore = new ApiCore({ baseUrl })
        const news = await apicore.search()

        expect(Array.isArray(news.documents)).toBeTruthy()
        expect(typeof news.count).toBe('number')
      }
    )

    test('should return a news array with authenticated token', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })

      await apicore.authenticate({ username, password })

      const news = await apicore.search()

      expect(news.documents.length).toBeLessThanOrEqual(apicore.defaultSearchParams.size as number)
      expect(news.documents.length).toBeGreaterThanOrEqual(1)
      expect(news.count).toBeGreaterThanOrEqual(news.documents.length)
    })

    test('should react to custom params', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })

      await apicore.authenticate({ username, password })

      const customParams: Params = {
        dateFrom: 'now-1M',
        dateTo: 'now-1d',
        langs: 'fr',
        urgencies: 3,
        size: 15,
        sortField: 'published',
        sortOrder: 'asc',
        classes: 'text',
        sources: ['afp'],
        topics: []
      }

      const news = await apicore.search(customParams)

      expect(news.documents.length).toBeGreaterThanOrEqual(1)
      expect(news.documents.length).toBeLessThanOrEqual(customParams.size as number)
      expect(news.count).toBeGreaterThanOrEqual(news.documents.length)

      const firstDocument = news.documents[0]

      expect(typeof firstDocument).toBe('object')
      expect(firstDocument.lang).toBe(customParams.langs)
      expect(firstDocument.urgency).toBe(customParams.urgencies)

      const lastDocument = news.documents[news.documents.length - 1]

      expect(+new Date(firstDocument.published)).toBeLessThan(+new Date(lastDocument.published))
      expect(+new Date(firstDocument.published)).toBeLessThan(+new Date(Date.now() - 2419200)) // now-1M
      expect(+new Date(lastDocument.published)).toBeLessThan(+new Date(Date.now() - 86400)) // now-1d
    })

    test('should react to custom fields', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })

      await apicore.authenticate({ username, password })

      const news = await apicore.search(null, ['title'])

      expect(Array.isArray(news.documents)).toBeTruthy()
      expect(news.documents.length).toBeGreaterThanOrEqual(1)

      const firstDocument = news.documents[0]

      expect(typeof firstDocument).toBe('object')
      expect(Object.keys(firstDocument).sort()).toEqual(['class', 'uno', 'title', 'published'].sort())
    })

    test('should work with multiple languages', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      await apicore.authenticate({ username, password })
      const news = await apicore.search({ langs: ['fr', 'en'], size: 100, classes: 'text' }, ['lang'])

      expect(news.documents.length).toBeGreaterThanOrEqual(1)

      const langs = news.documents.map(doc => doc.lang)

      console.log(langs)

      expect(langs.includes('fr')).toBeTruthy()
      expect(langs.includes('en')).toBeTruthy()
    })
  })

  describe('Get', () => {
    test('should return a document when authenticated', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })

      await apicore.authenticate({ username, password })

      const { documents } = await apicore.search({
        dateTo: 'now-1d'
      })
      const uno = documents[0].uno
      const doc = await apicore.get(uno)

      if (doc === null) {
        expect(doc).toBeTruthy()
      } else {
        expect(typeof doc).toBe('object')
        expect(doc.uno).toEqual(uno)
      }
    })

    test('should return an error when document doesn\'t exist', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })

      await apicore.authenticate({ username, password })

      return expect(apicore.get('unknown document')).rejects.toEqual(new Error('Document "unknown document" not found'))
    })
  })

  describe('Mlt', () => {
    test('should return some documents when authenticated', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      await apicore.authenticate({ username, password })
      const news = await apicore.mlt('newsmlmmd.afp.com.20230831T104539Z.doc-33ty2en', 'fr')

      expect(Array.isArray(news.documents)).toBeTruthy()
      expect(news.count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('List', () => {
    test('should return some slugs', async () => {
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      await apicore.authenticate({ username, password })
      const news = await apicore.list('slug')

      expect(Array.isArray(news.keywords)).toBeTruthy()
      expect(typeof news.keywords[0]).toBe('object')
      expect(typeof news.keywords[0].name).toBe('string')
      expect(news.keywords[0].count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Social story', () => {
    test('should return webstory href', async () => {
      const uno = 'newsml.afp.com.20230901T150953Z.doc-33u64eh'
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      await apicore.authenticate({ username, password })
      const story = await apicore.story('newsml.afp.com.20230901T150953Z.doc-33u64eh')

      if (story === null) {
        expect(story).toBeTruthy()
      } else {
        expect(typeof story).toBe('object')
        expect(story.uno).toEqual(uno)
      }
    })
    test('should return webstory content', async () => {
      const uno = 'newsml.afp.com.20230901T150953Z.doc-33u64eh'
      const apicore = new ApiCore({ baseUrl, clientId, clientSecret })
      await apicore.authenticate({ username, password })
      const story = await apicore.storycontent('newsml.afp.com.20230901T150953Z.doc-33u64eh')

      if (story === null) {
        expect(story).toBeTruthy()
      } else {
        expect(typeof story).toBe('object')
        expect(story.uno).toEqual(uno)
      }
    })
  })
})

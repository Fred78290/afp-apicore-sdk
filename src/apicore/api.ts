import ApiCoreLiveReport from './livereport'
import ApiCoreNotificationCenter from './notification'
import defaultSearchParams from '../default-search-params'
import buildQueryFromParams from '../utils/parametizer'
import { ApiCoreResponseDocuments, ApiCoreResponseTopics, ClientCredentials, Lang, Params, Token, SortField, SortOrder, ApiCoreDocument } from '../types'
import { get, gettext, post } from '../utils/request'

interface ApiCoreSocialStoryResponse {
  expires: string
  clientID: string
  role: string
  cost: string
  serial: string
  uno: string
  link: string
  available: string
  href: string
  userID: string
  queryID: string
}

export default class ApiCoreSearch extends ApiCoreLiveReport {

  constructor (credentials: ClientCredentials & {
    baseUrl?: string
    saveToken?: (token: Token | null) => void
   } = {}
  ) {
    super(credentials)
  }

  get defaultSearchParams (): Params {
    return defaultSearchParams as Params
  }

  public async search (params?: Params | null, fields?: string[]) {
    const {
      size: maxRows,
      sortField,
      sortOrder
    } = Object.assign({}, this.defaultSearchParams, params)

    await this.authenticate()

    const query = buildQueryFromParams(this.defaultSearchParams, {
      params: params,
      options: {
        maxRows: maxRows as number,
        sortField: sortField as SortField,
        sortOrder: sortOrder as SortOrder,
        fields: fields
      }
    })

    const data: ApiCoreResponseDocuments = await post(`${this.baseUrl}/v1/api/search`, query, {
      headers: this.authorizationBearerHeaders
    })

    const { docs: documents, numFound: count } = data.response

    return {
      count,
      documents
    }
  }

  public async get (uno: string) {
    await this.authenticate()

    const data: ApiCoreResponseDocuments = await get(`${this.baseUrl}/v1/api/get/${uno}`, {
      headers: this.authorizationBearerHeaders
    })

    if (data.response.docs && data.response.docs.length > 0) {
      const docs = data.response.docs
      return docs[0]
    }

    return null
  }

  public async mlt (uno: string, lang: Lang, size: number = 10) {
    await this.authenticate()

    const data: ApiCoreResponseDocuments = await get(`${this.baseUrl}/v1/api/mlt`, {
      headers: this.authorizationBearerHeaders,
      params: {
        uno,
        lang,
        size
      }
    })

    let count = 0
    let documents: ApiCoreDocument[] = []

    if (data.response.numFound) {
      count = data.response.numFound
    }

    if (data.response.docs) {
      documents = data.response.docs
    }

    return {
      count,
      documents
    }
  }

  public async list (facet: string, params?: Params, minDocCount = 1) {
    await this.authenticate()

    const query = buildQueryFromParams(this.defaultSearchParams, {params})

    const data: ApiCoreResponseTopics = await post(`${this.baseUrl}/v1/api/list/${facet}`, query, {
      headers: this.authorizationBearerHeaders,
      params: {
        minDocCount
      }
    })

    const { topics: keywords, numFound: count } = data.response

    return {
      count,
      keywords
    }
  }

  private insert (mainString: string, insString: string, pos: number) {
    return mainString.slice(0, pos) + insString + mainString.slice(pos)
  }

  public async story (uno: string) {

    const doc = await this.get(uno)

    if (doc !== null) {
      if (doc.class === 'webstory') {
        const data: ApiCoreSocialStoryResponse = await get(doc.href.replace('xml', 'webstory'), {
          headers: this.authorizationBearerHeaders
        })

        let href: string = ''
        let proxified: boolean
        const uno = data.uno
        const serial = data.serial
        const cost = data.cost ? parseInt(data.cost, 10) : 0
        const link = `${this.baseUrl}${data.href}`

        href = `${this.baseUrl}${data.href}`
        proxified = false

        return {
          uno,
          serial,
          href,
          link,
          proxified,
          cost
        }
      }
    }

    return null
  }

  public async storycontent (uno: string) {

    const doc = await this.story(uno)

    if (doc !== null) {
      const uno = doc.uno
      const serial = doc.serial
      const href = doc.link
      const docbase = `<base href="${href}" />`
      const head = '<head>'

      let content: string = await gettext(doc.link, {})

      content = this.insert(content, docbase, content.indexOf(head) + head.length)

      return {
        uno,
        serial,
        href,
        content
      }
    }

    return null
  }

  public createNotificationCenter (sharedServiceUsername?: string, sharedServicePassword?: string): ApiCoreNotificationCenter {
    return new ApiCoreNotificationCenter(this, sharedServiceUsername, sharedServicePassword)
  }
}

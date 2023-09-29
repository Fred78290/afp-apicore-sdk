import ApiCoreLiveReport from './livereport'
import defaultSearchParams from '../default-search-params'
import { ApiCoreResponseDocuments, ApiCoreResponseTopics, ClientCredentials, Lang, Params, Query, Request, Token, SortField, SortOrder, ApiCoreDocument } from '../types'
import buildQuery from '../utils/query-builder'
import { get, gettext, post } from '../utils/request'

const mapSearchParams = new Map([
  ['advisories', 'advisory'],
  ['afpshortids', 'afpshortid'],
  ['associatedWiths', 'associatedWith'],
  ['bagUnos', 'bagUno'],
  ['channels', 'channel'],
  ['cities', 'city'],
  ['citycodes', 'citycode'],
  ['classes', 'class'],
  ['comments', 'comment'],
  ['contains_videos', 'contains_video'],
  ['contributors', 'contributor'],
  ['countries', 'country'],
  ['country_onlys', 'country_only'],
  ['country_outs', 'country_out'],
  ['countrycodes', 'countrycode'],
  ['countrynames', 'countryname'],
  ['creators', 'creator'],
  ['depts', 'dept'],
  ['entity_companies', 'entity_company'],
  ['entity_departements', 'entity_departement'],
  ['entity_events', 'entity_event'],
  ['entity_functions', 'entity_function'],
  ['entity_locations', 'entity_location'],
  ['entity_medias', 'entity_media'],
  ['entity_organisations', 'entity_organisation'],
  ['entity_persons', 'entity_person'],
  ['entity_regions', 'entity_region'],
  ['entity_templates', 'entity_template'],
  ['entity_themes', 'entity_theme'],
  ['entity_works', 'entity_work'],
  ['events', 'event'],
  ['genres', 'genre'],
  ['genreids', 'genreid'],
  ['guids', 'guid'],
  ['headlines', 'headline'],
  ['hrefs', 'href'],
  ['introduceds', 'introduced'],
  ['iptcs', 'iptc'],
  ['keywords', 'keyword'],
  ['livereportids', 'livereportid'],
  ['mediatopics', 'mediatopic'],
  ['montageTypes', 'montageType'],
  ['news', 'news'],
  ['newsItemIDs', 'newsItemID'],
  ['objectNames', 'objectName'],
  ['ofinterestofs', 'ofinterestof'],
  ['products', 'product'],
  ['providers', 'provider'],
  ['providerids', 'providerid.qcode'],
  ['publicIdentifiers', 'publicIdentifier'],
  ['regions', 'region'],
  ['revisions', 'revision'],
  ['rules', 'rule'],
  ['scripts', 'script'],
  ['serials', 'serial'],
  ['signals', 'signal'],
  ['slugs', 'slug'],
  ['sources', 'source'],
  ['status', 'status'],
  ['subheadlines', 'subheadline'],
  ['thematics', 'thematic'],
  ['titles', 'title'],
  ['topics', 'topic'],
  ['unos', 'uno'],
  ['urgencies', 'urgency']
])

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
    webStoryProxy?: string
    webStoryProxyKey?: string
   } = {}
  ) {
    super(credentials)
  }

  get defaultSearchParams (): Params {
    return defaultSearchParams as Params
  }

  private appendRequest (params?: Params | null): [any?] {
    const optionnalRequest: [any?] = []
    const search = Object.assign({}, this.defaultSearchParams, params)

    if (params?.native) {
      optionnalRequest.push(params?.native)
    }

    for (const [key, value] of Object.entries(search)) {
      if (mapSearchParams.has(key)) {
        const field = mapSearchParams.get(key)

        if (value) {
          if (Array.isArray(value)) {
            if (value.length === 1) {
              optionnalRequest.push({
                value: value[0],
                name: field
              })
            } else if (value.length > 1) {
              optionnalRequest.push({
                in: value,
                name: field
              })
            }
          } else {
            optionnalRequest.push({
              value: value,
              name: field
            })
          }
        }
      }
    }

    return optionnalRequest
  }

  public async search (params?: Params | null, fields?: string[]) {
    const {
      size: maxRows,
      dateFrom,
      dateTo,
      query,
      langs,
      sortField,
      sortOrder
    } = Object.assign({}, this.defaultSearchParams, params)

    await this.authenticate()

    const optionnalParams: any = {}
    const optionnalRequest = this.appendRequest(params)

    if (langs && langs.length > 0) {
      if (langs.length === 1) {
        optionnalParams.lang = langs[0]
      } else {
        optionnalRequest.push({
          in: langs,
          name: 'lang'
        })
      }
    }

    const request: Request = {
      and: [
        ...optionnalRequest,
        ...buildQuery(query)
      ]
    }

    const body: Query = {
      dateRange: {
        from: dateFrom as string,
        to: dateTo as string
      },
      maxRows: maxRows as number,
      query: request,
      ...optionnalParams,
      fields,
      sortField: sortField as SortField,
      sortOrder: sortOrder as SortOrder
    }

    const data: ApiCoreResponseDocuments = await post(`${this.baseUrl}/v1/api/search`, body, {
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
    const {
      dateFrom,
      dateTo,
      query,
      langs
    } = Object.assign({}, this.defaultSearchParams, { dateFrom: 'now-2d' }, params)

    await this.authenticate()

    const optionnalParams: any = {}
    const optionnalRequest = this.appendRequest(params)

    if (langs) {
      if (langs.length === 1) {
        optionnalParams.lang = langs[0]
      } else if (langs.length > 1) {
        optionnalRequest.push({
          in: langs,
          name: 'lang'
        })
      }
    }

    const request: Request = {
      and: [
        ...optionnalRequest,
        ...buildQuery(query)
      ]
    }

    const body: any = {
      dateRange: {
        from: dateFrom,
        to: dateTo
      },
      query: request,
      ...optionnalParams
    }

    const data: ApiCoreResponseTopics = await post(`${this.baseUrl}/v1/api/list/${facet}`, body, {
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

        if (cost > 0 || ! this.webStoryProxy) {
          href = `${this.baseUrl}${data.href}`
          proxified = false
        } else {
          href = `${this.webStoryProxy}${data.href.substring('/objects/api/webstory'.length)}`
          proxified = true
        }

        return {
          uno,
          serial,
          href,
          link,
          proxified
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
}

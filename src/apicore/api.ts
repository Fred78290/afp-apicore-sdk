import ApiCoreAuth from './authentication'
import defaultSearchParams from '../default-search-params'
import { ApiCoreResponseDocuments, ApiCoreResponseTopics, ClientCredentials, Lang, Params, Query, Request, Token, SortField, SortOrder, ApiCoreDocument } from '../types'
import buildQuery from '../utils/query-builder'
import { get, post } from '../utils/request'

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

export default class ApiCoreSearch extends ApiCoreAuth {
  constructor (credentials: ClientCredentials & { baseUrl?: string; saveToken?: (token: Token | null) => void } = {}) {
    super(credentials)
  }

  get defaultSearchParams (): Params {
    return defaultSearchParams as Params
  }

  private appendRequest (params?: Params | null): [any?] {
    const optionnalRequest: [any?] = []
    const search = Object.assign({}, this.defaultSearchParams, params)

    for (const [key, value] of Object.entries(search)) {
      if (mapSearchParams.has(key)) {
        const field = mapSearchParams.get(key)

        if (value && value.length > 0) {
          if (value.length === 1) {
            optionnalRequest.push({
              value: value[0],
              name: field
            })
          } else {
            optionnalRequest.push({
              in: value,
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
    const docs = data.response.docs
    return docs[0]
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
}

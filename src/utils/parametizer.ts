import { Params, Query, Request, SortField, SortOrder } from '../types'
import buildQuery from '../utils/query-builder'

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

function appendParams (search: Params, optionnalRequest: [any?]) {
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
}

export default function buildQueryFromParams (defaultSearchParams: Params, searchOptions: {
  params?: Params | null
  options?: {
    maxRows?: number
    sortField?: SortField
    sortOrder?: SortOrder
    fields?: string[]
  }
} = {}): Query {
  const {
    dateFrom,
    dateTo,
    query,
    langs
  } = Object.assign({}, defaultSearchParams, searchOptions.params)

  const optionnalParams: any = {}
  const optionnalRequest: [any?] = []
  const search = Object.assign({}, defaultSearchParams, searchOptions.params)

  if (searchOptions.params?.native) {
    optionnalRequest.push(searchOptions.params?.native)
  }

  appendParams(search, optionnalRequest)

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

  const result: Query = {
    dateRange: {
      from: dateFrom,
      to: dateTo
    },
    query: request,
    ...optionnalParams,
    ...searchOptions.options
  }

  return result
}


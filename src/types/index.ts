/* eslint-disable @typescript-eslint/naming-convention */
export type Field =
  'advisory' |
  'afpshortid' |
  'associatedWith' |
  'bagUno' |
  'caption' |
  'channel' |
  'city' |
  'citycode' |
  'class' |
  'comment' |
  'contains_video' |
  'contentCreated' |
  'contentModified' |
  'contributor' |
  'country' |
  'country_only' |
  'country_out' |
  'countrycode' |
  'countryname' |
  'created' |
  'creator' |
  'dept' |
  'doc_creator_name' |
  'embargoed' |
  'entity_company' |
  'entity_departement' |
  'entity_event' |
  'entity_function' |
  'entity_location' |
  'entity_media' |
  'entity_organisation' |
  'entity_person' |
  'entity_region' |
  'entity_template' |
  'entity_theme' |
  'entity_work' |
  'event' |
  'expires' |
  'genre' |
  'genreid' |
  'guid' |
  'headline' |
  'href' |
  'introduced' |
  'iptc' |
  'keyword' |
  'lang' |
  'livereportid' |
  'mediatopic' |
  'montageType' |
  'news' |
  'newsItemID' |
  'objectName' |
  'ofinterestof' |
  'product' |
  'provider' |
  'publicIdentifier' |
  'published' |
  'region' |
  'revision' |
  'rules' |
  'script' |
  'sent' |
  'serial' |
  'signal' |
  'slug' |
  'source' |
  'status' |
  'subheadline' |
  'thematic' |
  'timestamp' |
  'title' |
  'topic' |
  'uno' |
  'urgency' |
  'version' |
  'versionModified'

export interface Request {
  and?: Request[]
  or?: Request[]
  name?: Field
  in?: Array<string | number>
  exclude?: Array<string | number>
}

export type Lang =
  'fr' |
  'en' |
  'de' |
  'es' |
  'pt' |
  'ar' |
  'zh-tw' |
  'zh-cn'

export type DocumentClass =  'picture' | 'text' | 'multimedia' | 'video' | 'graphic' | 'webstory' | 'videography' | 'livereport'
export type Urgency = 1 | 2 | 3 | 4 | 5
export type SortField = 'published'
export type SortOrder = 'asc' | 'desc'

export interface Params {
  sortOrder?: SortOrder
  sortField?: SortField
  query?: string
  langs?: Lang[]|Lang
  dateTo?: string
  dateFrom?: string
  size?: number

  advisories?: string[]|string
  afpshortids?: string[]|string
  associatedWiths?: string[]|string
  bagUnos?: string[]|string
  channels?: string[]|string
  cities?: string[]|string
  citycodes?: string[]|string
  classes?: DocumentClass[]|DocumentClass
  comments?: string[]|string
  contains_videos?: string[]|string
  contributors?: string[]|string
  countries?: string[]|string
  country_onlys?: string[]|string
  country_outs?: string[]|string
  countrycodes?: string[]|string
  countrynames?: string[]|string
  creators?: string[]|string
  depts?: string[]|string
  entity_companies?: string[]|string
  entity_departements?: string[]|string
  entity_events?: string[]|string
  entity_functions?: string[]|string
  entity_locations?: string[]|string
  entity_medias?: string[]|string
  entity_organisations?: string[]|string
  entity_persons?: string[]|string
  entity_regions?: string[]|string
  entity_templates?: string[]|string
  entity_themes?: string[]|string
  entity_works?: string[]|string
  events?: string[]|string
  genres?: string[]|string
  genreids?: string[]|string
  guids?: string[]|string
  headlines?: string[]|string
  hrefs?: string[]|string
  introduceds?: string[]|string
  iptcs?: string[]|string
  keywords?: string[]|string
  livereportids?: string[]|string
  mediatopics?: string[]|string
  montageTypes?: string[]|string
  news?: string[]|string
  newsItemIDs?: string[]|string
  objectNames?: string[]|string
  ofinterestofs?: string[]|string
  products?: string[]|string
  providers?: string[]|string
  publicIdentifiers?: string[]|string
  regions?: string[]|string
  revisions?: string[]|string
  rules?: string[]|string
  scripts?: string[]|string
  serials?: string[]|string
  signals?: string[]|string
  slugs?: string[]|string
  sources?: string[]|string
  status?: string[]|string
  subheadlines?: string[]|string
  thematics?: string[]|string
  titles?: string[]|string
  topics?: string[]|string
  unos?: string[]|string
  urgencies?: Urgency[]|Urgency
}

export type AuthType = 'anonymous' | 'credentials'

export interface AuthorizationHeaders {
  Authorization?: string
}

export interface Form {
  [key: string]: string
}

export interface Token {
  accessToken: string
  refreshToken: string
  tokenExpires: number
  authType: AuthType
}

export interface Query {
  maxRows: number
  sortField: SortField
  sortOrder: SortOrder
  dateRange: {
    from: string
    to: string
  }
  query: Request
  uno?: string
}

export interface ClientCredentials {
  apiKey?: string
  clientId?: string
  clientSecret?: string
  customAuthUrl?: string
}

export interface BagItemSourceOrProvider {
  name: string
  definition: string
  text: string
  qcode: string
  broader: string
}

export interface BagItemNewslines {
  byline: string
  copyright: string
  dateline: string
  headline: string
  subheadline: string
  advisory: string
  slug: string
}
export interface MediaItem {
  duration: number
  height: number
  href: string
  role: string
  rendition: string
  sizeInBytes: number
  type: string
  width: number
}
export interface BagItem {
  afpshortid: string
  uno: string
  originOfCopy: string
  caption: string
  creator: string
  provider: BagItemSourceOrProvider
  source: BagItemSourceOrProvider
  newslines: BagItemNewslines
  medias: MediaItem[]
}
export interface HopHistory {
  party: {
    qcode: string
    uri: string
    literal: string
    type: string
    typeuri: string
    name: string
  }
  hop: {
    sequence: number
    timestamp: string
    action: {
      qcode: string
      uri: string
      name: string
      target: string
      targeturi: string
      timestamp: string
    }
  }
}

export interface ContributorID {
  name: string
  role: string
  position: string
  broader: string
}

export interface SourceOrProviderID {
  name: string
  definition: string
  text: string
  qcode: string

}
export interface ExcludeAudience {
  text: string
  confidence: number
  relevance: number
  significance: number
  literal: string
  qcode: string
  uri: string
  type: string
  typeuri: string
  why: string
  whyuri: string
}

export interface ExcludeAudiences {
  qcode: string
  text: string
}

export interface Exclusion {
  name: string
  scheme: string
  type: string
  untilDate: string
  uri: string
}
export interface Rating {
  value: number
  ratingtype: string
  scalemin: number
  scalemax: number
  scaleunit: string
}
export type Status = 'Canceled' | 'Usable' | 'Embargoed'

export interface GeoLoc {
  lon: number
  lat: number
}

export interface UsageRight {
  name: string
  phrase: string
}
export interface AfpEntity {
  text: string
  role: string
  keyword: string
  qcode: string
  confidence: number
  location: GeoLoc
  related: {
    qcode: string
    rel: string
    literal: string
    name: string
  }
}

export interface FaceItem {
  height: number
  href: string
  offsetX: number
  offsetY: number
  width: number
}
export interface Faces {
  src: string
  items: FaceItem[]
}


export interface ApiCoreDocument {
  advisory: string
  afpentity: {
    album: AfpEntity[]
    city: AfpEntity[]
    country: AfpEntity[]
    ednote: AfpEntity[]
    event: AfpEntity[]
    geoarea: AfpEntity[]
    keyword: AfpEntity[]
    organisation: AfpEntity[]
    person: AfpEntity[]
    poi: AfpEntity[]
    role: AfpEntity[]
  }
  afpshortid: string
  associatedWith: string
  bagItem: BagItem[]
  bagUno: string[]
  caption: string[]
  channel: string[]
  city: string
  citycode: string
  class: DocumentClass
  comment: string[]
  contains_video: string
  contentCreated: string
  contentModified: string
  contributor: string
  contributorid: ContributorID[]
  copyright: string
  country: string
  countryname: string
  country_only: string[]
  country_out: string[]
  created: string
  creator: string
  dept: string
  disclaimer: string
  doc_creator_name: string
  embargoed: string
  entity_company: string[]
  entity_department: string[]
  entity_event: string[]
  entity_function: string[]
  entity_keyword: string[]
  entity_location: string[]
  entity_media: string[]
  entity_organisation: string[]
  entity_person: string[]
  entity_region: string[]
  entity_template: string[]
  entity_theme: string[]
  entity_work: string[]
  event: string[]
  excludeAudience: ExcludeAudience[]
  excludeAudiences: ExcludeAudiences[]
  exclusion: Exclusion[]
  expires: string
  faces: Faces
  genre: string[]
  genreid: string[]
  guid: string
  headline: string
  hopHistory: HopHistory[]
  href: string
  initialStatus: Status
  introduced: string
  iptc: string[]
  is_translated: boolean
  keyword: string[]
  lang: Lang
  language: string
  livereportid: string
  location: GeoLoc
  mediatopic: string[]
  montageType: string
  news: string[]
  newsItemID: string
  objectName: string
  ofinterestof: string[]
  patch_number: number
  product: string
  provider: string
  providerid: SourceOrProviderID
  publicIdentifier: string
  published: string
  rating: Rating
  refslug: string[]
  region: string
  revision: number
  rules: string[]
  script: string[]
  sent: string
  serial: string
  signal: string
  slug: string[]
  source: string
  sourceid: SourceOrProviderID
  status: Status
  summary: string[]
  subheadline: string
  thematic: string[]
  title: string
  topic: string[]
  uno: string
  urgency: Urgency
  usageRight: UsageRight
  versionModified: string
  wordCount: number
}

export interface ApiCoreResponseDocuments {
  response: {
    docs: ApiCoreDocument[]
    numFound: number
  }
}

export interface Topic {
  name: string
  count: number
}

export interface ApiCoreResponseTopics {
  response: {
    topics: Topic[]
    numFound: number
  }
}

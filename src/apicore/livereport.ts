import ApiCoreAuth from './authentication'
import { ApiCoreLiveReportIndex, ApiCoreLiveReportDocument, ClientCredentials, Lang, Token } from '../types'
import { get } from '../utils/request'

interface ApiCoreLiveReportsResponse {
  response: {
    took: number
    numFound: number
    liveReports: ApiCoreLiveReportIndex[]
  }
}

interface ApiCoreLiveReportResponse {
  response: {
    took: number
    numFound: number
    liveReport: ApiCoreLiveReportDocument
  }
}

export default class ApiCoreLiveReport extends ApiCoreAuth {
  constructor (credentials: ClientCredentials & { baseUrl?: string; saveToken?: (token: Token | null) => void } = {}) {
    super(credentials)
  }

  public async onair (lang: Lang) {
    await this.authenticate()

    const data: ApiCoreLiveReportsResponse = await get(`${this.baseUrl}/livereport/api/onair`, {
      headers: this.authorizationBearerHeaders,
      params: {
        lang: lang
      }
    })

    const { liveReports: livereports, numFound: count} = data.response

    return {
      count,
      livereports
    }
  }

  public async livereports (lang: Lang) {
    await this.authenticate()

    const data: ApiCoreLiveReportsResponse = await get(`${this.baseUrl}/livereport/api/list`, {
      headers: this.authorizationBearerHeaders,
      params: {
        lang: lang
      }
    })

    const { liveReports: livereports, numFound: count} = data.response

    return {
      count,
      livereports
    }
  }

  public async livereport (livereportID: string, lang: Lang) {
    await this.authenticate()

    const data: ApiCoreLiveReportResponse = await get(`${this.baseUrl}/livereport/api/get`, {
      headers: this.authorizationBearerHeaders,
      params: {
        id: livereportID,
        lang: lang
      }
    })

    const { liveReport: livereport, numFound: count} = data.response

    return {
      count,
      livereport
    }
  }
}

import ApiCoreAuth from './authentication'
import buildQueryFromParams from '../utils/parametizer'
import { Subscription, RegisteredSubscription, SubscriptionsIdentifier, RegisteredService, RegisterService, SubscriptionsInService, Params, QuietTime } from '../types'
import defaultSubscriptionParams from '../default-notification-params'
import { HttpHeaders, get, post, del } from '../utils/request'
import moment from 'moment-timezone'

const timeFormat = 'HH:mm:ss'
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const utc = 'UTC'

interface Status {
  code: number
  reason: string
}

interface CommonNotificationCenterResponse {
  response: {
    names: string
    uno: string
    status: Status
  }
}

interface ListServiceResponse {
  response: {
    services?: RegisteredService[]
    status: Status
  }
}

interface SubscriptionsInServiceResponse {
  response: {
    subscriptions?: SubscriptionsInService[]
    status: Status
  }
}

interface GetNotificationSubscriptionResponse {
  response: {
    subscription: RegisteredSubscription
    status: Status
  }
}

interface ListNotificationSubscriptionResponse {
  response: {
    subscriptions: RegisteredSubscription[]
    status: Status
  }
}

type AddNotificationSubscriptionToServiceResponse = CommonNotificationCenterResponse
type UpdateNotificationSubscriptionResponse = CommonNotificationCenterResponse
type DeleteServiceResponse = CommonNotificationCenterResponse
type RegisteredServiceResponse = CommonNotificationCenterResponse
type AddNotificationSubscriptionResponse = CommonNotificationCenterResponse
type DeleteNotificationSubscriptionResponse = CommonNotificationCenterResponse
type SetQuietTimeResponse = CommonNotificationCenterResponse

export class ApiCoreNotificationCenter {
  private auth: ApiCoreAuth

  constructor (auth: ApiCoreAuth) {
    this.auth = auth
  }

  get httpHeaders (): HttpHeaders {
    return {
      ...this.auth.authorizationBearerHeaders,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    }
  }
  private adjustTime (time: string, tz: string = timeZone): string {
    return moment.tz(time, timeFormat, tz).tz(utc).format(timeFormat)
  }

  get defaultSubscriptionParams (): Subscription {
    const defaultSubscription = {
      ...defaultSubscriptionParams as Subscription
    }

    // Set to local time the quiet périod
    if (defaultSubscription.quietTime) {
      defaultSubscription.quietTime.tz = utc
      defaultSubscription.quietTime.startTime = this.adjustTime(defaultSubscription.quietTime.startTime)
      defaultSubscription.quietTime.endTime = this.adjustTime(defaultSubscription.quietTime.endTime)
    }

    return defaultSubscription
  }

  get defaultSearchParams (): Params {
    return {
      langs: []
    }
  }

  get baseUrl (): string {
    return `${this.auth.apiUrl}/notification/api`
  }

  public async authenticate (options: { username?: string; password?: string } = {}) {
    return this.auth.authenticate(options)
  }

  public async addSubscriptionToService (service: string, subscriptions: SubscriptionsIdentifier) {
    await this.authenticate()

    const data: AddNotificationSubscriptionToServiceResponse = await post(`${this.baseUrl}/service/add`, subscriptions, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service
      }
    })

    return data.response.names
  }

  public async deleteService (service: string) {
    await this.authenticate()

    const data: DeleteServiceResponse = await del(`${this.baseUrl}/service/delete`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service
      }
    })

    return data.response.uno
  }

  public async listServices () {
    await this.authenticate()

    const data: ListServiceResponse = await get(`${this.baseUrl}/service/list`, {
      headers: this.httpHeaders
    })

    return data.response.services
  }

  public async registerService (service: RegisterService) {
    await this.authenticate()

    const data: RegisteredServiceResponse = await post(`${this.baseUrl}/service/register`, service, {
      headers: this.auth.authorizationBearerHeaders
    })

    return data.response.uno
  }

  public async removeSubscriptionsFromService (service: string, subscriptions: SubscriptionsIdentifier) {
    await this.authenticate()

    const data: DeleteNotificationSubscriptionResponse = await del(`${this.baseUrl}/service/remove`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service
      }
    }, subscriptions)

    return data.response.names
  }

  public async subscriptionsInService (service: string) {
    await this.authenticate()

    const data: SubscriptionsInServiceResponse = await get(`${this.baseUrl}/service/subscriptions`, {
      headers: this.httpHeaders,
      params: {
        service: service
      }
    })

    return data.response.subscriptions
  }

  public async addSubscription (name: string, service: string, query: Subscription) {
    await this.authenticate()

    const data: AddNotificationSubscriptionResponse = await post(`${this.baseUrl}/subscription/add`, query, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        service: service
      }
    })

    return data.response.uno
  }

  public async deleteSubscription (name: string, service: string) {
    await this.authenticate()

    const data: DeleteNotificationSubscriptionResponse = await del(`${this.baseUrl}/subscription/delete`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        service: service
      }
    })

    // empty response from apicore
    if (data.response.status.code === 204) {
      return name
    }

    return data.response.uno
  }

  public async getSubscription (name: string) {
    await this.authenticate()

    const data: GetNotificationSubscriptionResponse = await get(`${this.baseUrl}/subscription/get`, {
      headers: this.httpHeaders,
      params: {
        name: name
      }
    })

    return data.response.subscription
  }

  public async listSubscriptions () {
    await this.authenticate()

    const data: ListNotificationSubscriptionResponse = await get(`${this.baseUrl}/subscription/list`, {
      headers: this.httpHeaders
    })

    return data.response.subscriptions
  }

  public async setQuietTime (name: string, enabled: boolean, quietTime: QuietTime) {
    await this.authenticate()

    const data: SetQuietTimeResponse = await post(`${this.baseUrl}/subscription/quiettime`, quietTime, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        quiet: enabled
      }
    })

    return data.response.uno
  }

  //  public async updateSubscription (name: string, service: string, query: Subscription) {
  //    await this.authenticate()
  //
  //    const data: UpdateNotificationSubscriptionResponse = await post(`${this.baseUrl}/subscription/update`, query, {
  //      headers: this.auth.authorizationBearerHeaders,
  //      params: {
  //        name: name,
  //        service: service
  //      }
  //    })
  //
  //    return data.response.uno
  //  }

  public buildSubscription (params: Params, dontDisturb?: boolean, quietTime?: QuietTime): Subscription {
    const {
      langs
    } = Object.assign({}, this.defaultSearchParams, params)

    const optionnalParams: any = {}

    if (params.langs) {
      if (Array.isArray(params.langs)) {
        if (params.langs.length > 0) {
          optionnalParams.langues = params.langs
        }
      } else if (params.langs.length > 0) {
        optionnalParams.langues = [params.langs]
      }
    } else if (langs) {
      if (Array.isArray(langs)) {
        optionnalParams.langues = langs
      } else if (langs.length > 0) {
        optionnalParams.langues = [langs]
      }
    }

    if (dontDisturb) {
      optionnalParams.dontDisturb = dontDisturb
    }

    if (quietTime) {
      optionnalParams.quietTime = {
        ...quietTime
      }

      // Translate it to UTC
      if (quietTime.tz.toUpperCase() !== utc) {
        optionnalParams.quietTime.startTime = this.adjustTime(quietTime.startTime, quietTime.tz)
        optionnalParams.quietTime.endTime = this.adjustTime(quietTime.endTime, quietTime.tz)
        optionnalParams.quietTime.tz = timeZone
      }
    }

    const result: Subscription = {
      ...this.defaultSubscriptionParams,
      ...optionnalParams,
      query: buildQueryFromParams(this.defaultSearchParams, {
        params: params
      }).query
    }

    return result
  }
}

export default ApiCoreNotificationCenter

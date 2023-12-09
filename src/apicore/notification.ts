import ApiCoreAuth, { btoa } from './authentication'
import buildQueryFromParams from '../utils/parametizer'
import { Subscription, RegisteredSubscription, SubscriptionsIdentifier, RegisteredService, RegisterService, SubscriptionsInService, Params, QuietTime, AuthorizationHeaders } from '../types'
import defaultSubscriptionParams from '../default-notification-params'
import { HttpHeaders, get, post, del } from '../utils/request'
import moment from 'moment-timezone'

const timeFormat = 'HH:mm:ss'
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const utc = 'UTC'
const withoutcreditRate = '_withoutcreditRate'

interface Status {
  code: number
  reason: string
}

interface CommonNotificationCenterResponse {
  response: {
    names: string[]
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
    subscriptions?: RegisteredSubscription[]
    status: Status
  }
}

interface Name {
  name: string
  status: string
}

interface AddNotificationSubscriptionToServiceResponse {
  response: {
    status: Status
    names?: Name[]
  }
}

type RemoveNotificationSubscriptionToServiceResponse = AddNotificationSubscriptionToServiceResponse
type UpdateNotificationSubscriptionResponse = CommonNotificationCenterResponse
type DeleteServiceResponse = CommonNotificationCenterResponse
type RegisteredServiceResponse = CommonNotificationCenterResponse
type AddNotificationSubscriptionResponse = CommonNotificationCenterResponse
type DeleteNotificationSubscriptionResponse = CommonNotificationCenterResponse
type SetQuietTimeResponse = CommonNotificationCenterResponse

export class ApiCoreNotificationCenter {
  private auth: ApiCoreAuth
  private username?: string
  private password?: string

  constructor (auth: ApiCoreAuth, username?: string, password?: string) {
    this.auth = auth
    this.username = username
    this.password = password
  }

  get authorizationBasicHeaders (): AuthorizationHeaders {
    if (this.username && this.password) {
      const auth = btoa(`${this.username}:${this.password}`)

      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Basic ${auth}`
      }
    }

    return {

    }
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

  get sharedServiceUserName (): string | undefined {
    return this.username
  }

  set sharedServiceUserName (value: string | undefined) {
    this.username = value
  }

  get sharedServicePassword (): string | undefined {
    return this.password
  }

  set sharedServicePassword (value: string | undefined) {
    this.password = value
  }

  get defaultSearchParams (): Params {
    return {
      langs: []
    }
  }

  get baseUrl (): string {
    return `${this.auth.apiUrl}/notification/api`
  }

  get sharedUrl (): string {
    return `${this.auth.apiUrl}/notification/shared`
  }

  get managerUrl (): string {
    return `${this.auth.apiUrl}/notification/manager`
  }

  public async authenticate (options: { username?: string; password?: string } = {}) {
    return this.auth.authenticate(options)
  }

  public async addSubscriptionToManagedService (service: string, userID: string, subscriptions: SubscriptionsIdentifier) {
    const data: AddNotificationSubscriptionToServiceResponse = await post(`${this.managerUrl}/service/add`, subscriptions, {
      headers: this.authorizationBasicHeaders,
      params: {
        service: service,
        uid: userID
      }
    })

    return data.response.names
  }

  public async addSubscriptionToSharedService (service: string, clientID: string, userID: string, subscriptions: SubscriptionsIdentifier) {
    const data: AddNotificationSubscriptionToServiceResponse = await post(`${this.sharedUrl}/service/add`, subscriptions, {
      headers: this.authorizationBasicHeaders,
      params: {
        service: service,
        cid: clientID,
        uid: userID
      }
    })

    return data.response.names
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

  public async deleteManagedService (service: string, userID: string) {
    const data: DeleteServiceResponse = await del(`${this.managerUrl}/service/delete`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service,
        uid: userID
      }
    })

    return data.response.uno
  }

  public async deleteSharedService (service: string) {
    const data: DeleteServiceResponse = await del(`${this.sharedUrl}/service/delete`, {
      headers: this.authorizationBasicHeaders,
      params: {
        service: service
      }
    })

    return data.response.uno
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

  public async listManagedServices (userID: string) {
    const data: ListServiceResponse = await get(`${this.managerUrl}/service/list`, {
      headers: this.httpHeaders,
      params: {
        uid: userID
      }
    })

    return data.response.services
  }

  public async listSharedServices (clientID: string, userID: string) {
    const data: ListServiceResponse = await get(`${this.sharedUrl}/service/list`, {
      headers: {
        ...this.authorizationBasicHeaders,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json'
      },
      params: {
        cid: clientID,
        uid: userID
      }
    })

    return data.response.services
  }

  public async listServices () {
    await this.authenticate()

    const data: ListServiceResponse = await get(`${this.baseUrl}/service/list`, {
      headers: this.httpHeaders
    })

    return data.response.services
  }

  public async registerManagedService (userID: string, service: RegisterService) {
    const data: RegisteredServiceResponse = await post(`${this.managerUrl}/service/register`, service, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        uid: userID
      }
    })

    return data.response.uno
  }

  public async registerSharedService (service: RegisterService) {
    const data: RegisteredServiceResponse = await post(`${this.sharedUrl}/service/register`, service, {
      headers: this.authorizationBasicHeaders
    })

    return data.response.uno
  }

  public async registerService (service: RegisterService) {
    await this.authenticate()

    const data: RegisteredServiceResponse = await post(`${this.baseUrl}/service/register`, service, {
      headers: this.auth.authorizationBearerHeaders
    })

    return data.response.uno
  }

  public async removeSubscriptionsFromManagedService (service: string, userID: string, subscriptions: SubscriptionsIdentifier) {
    const data: RemoveNotificationSubscriptionToServiceResponse = await del(`${this.managerUrl}/service/remove`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service,
        uid: userID
      }
    }, subscriptions)

    return data.response.names
  }

  public async removeSubscriptionsFromSharedService (service: string, clientID: string, userID: string, subscriptions: SubscriptionsIdentifier) {
    const data: RemoveNotificationSubscriptionToServiceResponse = await del(`${this.sharedUrl}/service/remove`, {
      headers: this.authorizationBasicHeaders,
      params: {
        service: service,
        cid: clientID,
        uid: userID
      }
    }, subscriptions)

    return data.response.names
  }

  public async removeSubscriptionsFromService (service: string, subscriptions: SubscriptionsIdentifier) {
    await this.authenticate()

    const data: RemoveNotificationSubscriptionToServiceResponse = await del(`${this.baseUrl}/service/remove`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        service: service
      }
    }, subscriptions)

    return data.response.names
  }

  public async subscriptionsInManagedService (service: string, userID: string) {
    const data: SubscriptionsInServiceResponse = await get(`${this.managerUrl}/service/subscriptions`, {
      headers: this.httpHeaders,
      params: {
        service: service,
        uid: userID
      }
    })

    return data.response.subscriptions?.filter((subscription) => ! subscription.name.endsWith(withoutcreditRate))
  }

  public async subscriptionsInSharedService (service: string, clientID: string, userID: string) {
    const data: SubscriptionsInServiceResponse = await get(`${this.sharedUrl}/service/subscriptions`, {
      headers: {
        ...this.authorizationBasicHeaders,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json'
      },
      params: {
        service: service,
        cid: clientID,
        uid: userID
      }
    })

    return data.response.subscriptions?.filter((subscription) => ! subscription.name.endsWith(withoutcreditRate))
  }

  public async subscriptionsInService (service: string) {
    await this.authenticate()

    const data: SubscriptionsInServiceResponse = await get(`${this.baseUrl}/service/subscriptions`, {
      headers: this.httpHeaders,
      params: {
        service: service
      }
    })

    return data.response.subscriptions?.filter((subscription) => ! subscription.name.endsWith(withoutcreditRate))
  }

  public async addManagedSubscription (name: string, service: string, userID: string, query: Subscription) {
    await this.authenticate()

    const data: AddNotificationSubscriptionResponse = await post(`${this.managerUrl}/subscription/add`, query, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        uid: userID,
        service: service
      }
    })

    return data.response.uno
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

  public async deleteManagedSubscription (name: string, userID: string) {
    await this.authenticate()

    const data: DeleteNotificationSubscriptionResponse = await del(`${this.managerUrl}/subscription/delete`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        uid: userID,
        service: 'service'
      }
    })

    // empty response from apicore
    if (data.response.status.code === 204) {
      return name
    }

    return data.response.uno
  }

  public async deleteSubscription (name: string) {
    await this.authenticate()

    const data: DeleteNotificationSubscriptionResponse = await del(`${this.baseUrl}/subscription/delete`, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        service: 'service'
      }
    })

    // empty response from apicore
    if (data.response.status.code === 204) {
      return name
    }

    return data.response.uno
  }

  public async getManagedSubscription (name: string, userID: string) {
    await this.authenticate()

    const data: GetNotificationSubscriptionResponse = await get(`${this.managerUrl}/subscription/get`, {
      headers: this.httpHeaders,
      params: {
        name: name,
        uid: userID
      }
    })

    return data.response.subscription
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

  public async listManagedSubscriptions (userID: string) {
    await this.authenticate()

    const data: ListNotificationSubscriptionResponse = await get(`${this.managerUrl}/subscription/list`, {
      headers: this.httpHeaders,
      params: {
        uid: userID
      }
    })

    return data.response.subscriptions
  }

  public async listSubscriptions () {
    await this.authenticate()

    const data: ListNotificationSubscriptionResponse = await get(`${this.baseUrl}/subscription/list`, {
      headers: this.httpHeaders
    })

    return data.response.subscriptions
  }

  public async setManagedQuietTime (name: string, userID: string, enabled: boolean, quietTime: QuietTime) {
    await this.authenticate()

    const data: SetQuietTimeResponse = await post(`${this.managerUrl}/subscription/quiettime`, quietTime, {
      headers: this.auth.authorizationBearerHeaders,
      params: {
        name: name,
        uid: userID,
        quiet: enabled
      }
    })

    return data.response.uno
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

import dotenv from 'dotenv'
import ApiCoreNotificationCenter from '../src/apicore/notification'
import ApiCoreAuth from '../src/apicore/authentication'
import moment from 'moment-timezone'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

const {
  APICORE_UAT_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password,
  APICORE_NOTIFICATION_EMAIL: email,
} = process.env

const testSubscriptionName = 'test-notification-typescript-apicore-sdk'
const testServiceName = 'test-notification-typescript-apicore-sdk'

describe('AFP ApiCore Notification', () => {

  const auth = new ApiCoreAuth({ baseUrl, clientId, clientSecret })
  const notificationCenter = new ApiCoreNotificationCenter(auth)

  expect(baseUrl).toBeDefined()
  expect(clientId).toBeDefined()
  expect(clientSecret).toBeDefined()
  expect(username).toBeDefined()
  expect(password).toBeDefined()
  expect(email).toBeDefined()

  test('should return true when notification is instance of ApiCoreNotificationCenter', () => {
    const test = new ApiCoreNotificationCenter(auth)
    expect(test instanceof ApiCoreNotificationCenter).toBeTruthy()
  })

  describe('Service', () => {

    beforeEach(async () => {
      await notificationCenter.authenticate({username, password})
    })

    test('should register service', async () => {
      if (email) {
        const result = await notificationCenter.registerService({
          name: testServiceName,
          type: 'mail',
          datas: {
            address: email
          }})

          expect(result).toBeDefined()
        }
    })

    test('should contains service', async () => {
      const result = await notificationCenter.listServices()

      expect(result).toBeDefined()

      expect(result?.map(s => s.serviceName)).toContain(testServiceName)
    })

    test('should return no subscriptions in service', async () => {
      const result = await notificationCenter.subscriptionsInService(testServiceName)

      expect(result).toBeUndefined()
    })

    test('should delete service', async () => {
      const result = await notificationCenter.deleteService(testServiceName)

      expect(result).toBeDefined()
    })

  })

  describe('Subscription', () => {
    beforeAll(async () => {
      await notificationCenter.authenticate({username, password})

      if (email) {
        const services = await notificationCenter.listServices()

        if (services?.map(s => s.serviceName).includes(testServiceName)) {
          console.warn(`service ${testServiceName} already exists`)
        } else {
          await notificationCenter.registerService({
            name: testServiceName,
            type: 'mail',
            datas: {
              address: email
            }})
        }
      }
    })

    afterAll(async () => {
      const services = await notificationCenter.listServices()

      if (services?.map(s => s.serviceName).includes(testServiceName)) {
        const subscriptions = await notificationCenter.subscriptionsInService(testServiceName)

        if (subscriptions) {
          await Promise.all(subscriptions.map(subscription => notificationCenter.deleteSubscription(subscription.name, testServiceName)))
          await Promise.all(subscriptions.map(subscription => notificationCenter.deleteSubscription(subscription.name)))
        }

        await notificationCenter.deleteService(testServiceName)
      }
    })

    test('should create a subscription in service', async () => {
      const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text'})
      const services = await notificationCenter.addSubscription(testSubscriptionName, testServiceName, subscription)

      expect(services).toBeDefined()
    })

    test('should get subscription', async () => {
      const subscription = await notificationCenter.getSubscription(testSubscriptionName)

      expect(subscription.name).toEqual(testSubscriptionName)
    })

    test('should list subscription and found', async () => {
      const subscription = await notificationCenter.listSubscriptions()

      expect(subscription?.map(s => s.name)).toContain(testSubscriptionName)
    })

    test('should set quietTime for subscription', async () => {
      const timeFormat = 'HH:mm:ss'
      const timeZone = 'UTC' // Bug in apicore must be UTC Intl.DateTimeFormat().resolvedOptions().timeZone

      const startTime = moment.tz('23:59:59', timeFormat, timeZone)
      const endTime = moment.tz('06:59:59', timeFormat, timeZone)

      const result = await notificationCenter.setQuietTime(testSubscriptionName, true, {
        startTime: startTime.format(timeFormat),
        endTime: endTime.format(timeFormat),
        tz: timeZone
      })

      expect(result).toEqual(testSubscriptionName)

      const subscription = await notificationCenter.getSubscription(testSubscriptionName)

      expect(subscription.quietTime).toBeDefined()

      if (subscription.quietTime) {
        const _startTime = moment.tz(subscription.quietTime.startTime, timeFormat, subscription.quietTime.tz)
        const _endTime = moment.tz(subscription.quietTime.endTime, timeFormat, subscription.quietTime.tz)
        // Bug in apicore must be UTC
        expect(_startTime.tz(timeZone).format(timeFormat)).toEqual(startTime.format(timeFormat))
        expect(_endTime.tz(timeZone).format(timeFormat)).toEqual(endTime.format(timeFormat))
      }

    })

//    test('should update subscription and found', async () => {
//      const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text', products: 'news'})
//      const services = await notificationCenter.updateSubscription(testSubscriptionName, testServiceName, subscription)
//
//      expect(services).toEqual(testSubscriptionName)
//    })

    test('should delete subscription', async () => {
      const subscription = await notificationCenter.deleteSubscription(testSubscriptionName)

      expect(subscription).toEqual(testSubscriptionName)
    })

  })

})

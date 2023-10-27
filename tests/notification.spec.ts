import dotenv from 'dotenv'
import ApiCoreNotificationCenter from '../src/apicore/notification'
import ApiCoreAuth from '../src/apicore/authentication'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

const {
  APICORE_UAT_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password,
  APICORE_NOTIFICATION_EMAIL: email,
  APICORE_NOTIFICATION_SERVICE: testServiceName
} = process.env

describe('AFP ApiCore Notification', () => {

  const auth = new ApiCoreAuth({ baseUrl, clientId, clientSecret })
  const notificationCenter = new ApiCoreNotificationCenter(auth)

  expect(email).toBeDefined()
  expect(testServiceName).toBeDefined()

  test('should return true when notification is instance of ApiCoreNotificationCenter', () => {
    const test = new ApiCoreNotificationCenter(auth)
    expect(test instanceof ApiCoreNotificationCenter).toBeTruthy()
  })

  describe('Service', () => {

    beforeEach(async () => {
      await notificationCenter.authenticate({username, password})
    })

    test('should register service', async () => {
      if (email && testServiceName) {
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
      if (testServiceName) {
        const result = await notificationCenter.subscriptionsInService(testServiceName)

        expect(result).toBeUndefined()
      }
    })

    test('should delete service', async () => {
      if (testServiceName) {
        const result = await notificationCenter.deleteService(testServiceName)

        expect(result).toBeDefined()
      }
    })

  })

  describe('Subscription', () => {
    beforeAll(async () => {
      await notificationCenter.authenticate({username, password})

      if (testServiceName && email) {
        const services = await notificationCenter.listServices()

        if (services && services.map(s => s.serviceName).includes(testServiceName)) {
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
      if (testServiceName) {
        const services = await notificationCenter.listServices()

        if (services && services.map(s => s.serviceName).includes(testServiceName)) {
          const subscriptions = await notificationCenter.subscriptionsInService(testServiceName)

          if (subscriptions) {
            await Promise.all(subscriptions.map(subscription => notificationCenter.deleteSubscription(subscription.name, testServiceName)))
          }

          await notificationCenter.deleteService(testServiceName)
        }
      }
    })

    test('should create a subscription in service', async () => {
      if (testServiceName) {
        const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text'})
        const services = await notificationCenter.addSubscription(testServiceName, testServiceName, subscription)

        expect(services).toEqual(testServiceName)
      }
    })

    test(`should get subscription ${testServiceName}`, async () => {
      if (testServiceName) {
        const subscription = await notificationCenter.getSubscription(testServiceName)

        expect(subscription.name).toEqual(testServiceName)
      }
    })

    test('should list subscription and found', async () => {
      if (testServiceName) {
        const subscription = await notificationCenter.listSubscriptions()

        expect(subscription.map(s => s.name)).toContain(testServiceName)
      }
    })

    test('should set quietTime for subscription', async () => {
      if (testServiceName) {
        const result = await notificationCenter.setQuietTime(testServiceName, {
          startTime: '23:59:59',
          endTime: '06:59:59',
          tz: 'Europe/Paris'
        })

        expect(result).toEqual(testServiceName)

        const subscription = await notificationCenter.getSubscription(testServiceName)

        expect(subscription.quietTime).toBeDefined()
        expect(subscription.quietTime?.startTime).toEqual('23:59:59')
        expect(subscription.quietTime?.endTime).toEqual('06:59:59')
      }
    })

    test('should update subscription and found', async () => {
      if (testServiceName) {
        const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text', products: 'news'})
        const services = await notificationCenter.updateSubscription(testServiceName, testServiceName, subscription)

        expect(services).toEqual(testServiceName)
      }
    })

    test('should delete subscription', async () => {
      if (testServiceName) {
        const subscription = await notificationCenter.deleteSubscription(testServiceName, testServiceName)

        expect(subscription).toEqual(testServiceName)
      }
    })

  })

})

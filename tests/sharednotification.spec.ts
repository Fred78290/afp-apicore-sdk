import dotenv from 'dotenv'
import ApiCoreNotificationCenter from '../src/apicore/notification'
import ApiCoreAuth from '../src/apicore/authentication'

const configPath = process.env.DOTENV_CONFIG_PATH === undefined && 'apicore.env' || process.env.DOTENV_CONFIG_PATH

dotenv.config({ path: configPath })

jest.setTimeout(1000 * 360)

const {
  APICORE_UAT_URL: baseUrl,
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password,
  APICORE_SERVICE_USERNAME: serviceUsername,
  APICORE_SERVICE_PASSWORD: servicePassword,
  APICORE_NOTIFICATION_EMAIL: email,
} = process.env

const testSubscriptionName = 'test-shared-notification-apicore'
const testServiceName = 'test-shared-notification-typescript-apicore-sdk'

describe('AFP ApiCore Shared Notification', () => {

  expect(baseUrl).toBeDefined()
  expect(clientId).toBeDefined()
  expect(clientSecret).toBeDefined()
  expect(username).toBeDefined()
  expect(password).toBeDefined()
  expect(serviceUsername).toBeDefined()
  expect(servicePassword).toBeDefined()
  expect(email).toBeDefined()

  const auth = new ApiCoreAuth({ baseUrl, clientId, clientSecret })
  const notificationCenter = new ApiCoreNotificationCenter(auth, serviceUsername, servicePassword)

  describe('Shared Service', () => {

    beforeEach(async () => {
      await notificationCenter.authenticate({username, password})
    })

    test('should register shared service', async () => {
      if (email) {
        const result = await notificationCenter.registerSharedService({
          name: testServiceName,
          type: 'mail',
          datas: {
            address: email
          }})

          expect(result).toBeDefined()
        }
    })

    test('should return no subscriptions in shared service', async () => {
      if (clientId && username) {
        const result = await notificationCenter.subscriptionsInSharedService(testServiceName, clientId, username)

        expect(result).toBeUndefined()
      }
    })

    test('should delete shared service', async () => {
      const result = await notificationCenter.deleteSharedService(testServiceName)

      expect(result).toBeDefined()
    })

  })

  describe('Subscription with shared service', () => {
    beforeAll(() => {

      if (email) {
        return new Promise(done => {
          console.log('Will authenticate user')

          notificationCenter.authenticate({username, password})
            .then(() => {
              console.log('Will create shared service')

              notificationCenter.registerSharedService({
                name: testServiceName,
                type: 'mail',
                datas: {
                  address: email
                }
              }).then(() => {
                console.log('Shared service created')
              }).catch(() => {
                console.log('Shared service already exists')
              })
            .catch(e => {
              console.error('Authentication failed: %v', e)
            })
          }).finally(() => {
            console.log('Did create shared service')
            done(undefined);
          })
        })
      }
    })

    test('should create a subscription in service', async () => {
      const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text'})
      const services = await notificationCenter.addSubscription(testSubscriptionName, testServiceName, subscription)

      expect(services).toBeDefined()
    })

    test('should get subscription in shared service', async () => {
      const subscription = await notificationCenter.getSubscription(testSubscriptionName)

      expect(subscription.name).toEqual(testSubscriptionName)
    })

    test('should list subscription and found in shared service', async () => {
      if (clientId && username) {
        const subscription = await notificationCenter.subscriptionsInSharedService(testServiceName, clientId, username)

        expect(subscription).toBeDefined()
        expect(subscription?.map(s => s.name)).toContain(testSubscriptionName)
      }
    })

//    test('should remove subscription in shared service', async () => {
//      if (clientId && username) {
//        const subscription = await notificationCenter.removeSubscriptionsFromSharedService(testServiceName, clientId, username, [ testSubscriptionName ])
//
//        expect(subscription).toContain(testSubscriptionName)
//      }
//    })

    test('should delete subscription in shared service', async () => {
      const subscription = await notificationCenter.deleteSubscription(testSubscriptionName, testServiceName)

      expect(subscription).toEqual(testSubscriptionName)
    })

    test('should return no subscriptions in shared service', async () => {
      if (clientId && username) {
        const result = await notificationCenter.subscriptionsInSharedService(testServiceName, clientId, username)

        expect(result).toBeUndefined()
      }
    })
  })

  /*afterAll(() => {
    console.log('Will delete shared service')
    if (clientId && username) {
      return new Promise(done => {
        notificationCenter.subscriptionsInSharedService(testServiceName, clientId, username).then((subscriptions) => {
          if (subscriptions && subscriptions.length > 0) {
            Promise.all(subscriptions.map(subscription => notificationCenter.deleteSubscription(subscription.name, testServiceName)))
              .then(() => console.log('All registered subscription in shared service deleted'))
          }
        }).finally(() => {
          notificationCenter.deleteSharedService(testServiceName)
            .then(() => console.log('Shared service deleted'))
            .catch((e) => console.error(e))
            .finally(() => done(null))
        })
      })
    }
  })*/
})

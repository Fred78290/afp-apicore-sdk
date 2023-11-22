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
  APICORE_MANAGER_USERNAME: managerUserName,
  APICORE_MANAGER_PASSWORD: managerPassword,
  APICORE_USERNAME: managedUserName,
  APICORE_NOTIFICATION_EMAIL: email,
} = process.env

const testSubscriptionName = 'test-notification-typescript-apicore-sdk'
const testServiceName = 'test-notification-typescript-apicore-sdk'

describe('AFP ApiCore User managed Notification', () => {

  const auth = new ApiCoreAuth({ baseUrl, clientId, clientSecret })
  const notificationCenter = new ApiCoreNotificationCenter(auth)

  expect(baseUrl).toBeDefined()
  expect(clientId).toBeDefined()
  expect(clientSecret).toBeDefined()
  expect(managedUserName).toBeDefined()
  expect(managerUserName).toBeDefined()
  expect(managerPassword).toBeDefined()
  expect(email).toBeDefined()

  describe('User managed service', () => {

    beforeEach(async () => {
      await notificationCenter.authenticate({username: managerUserName, password: managerPassword})
    })

    test('should register user managed service', async () => {
      if (email && managedUserName) {
        const result = await notificationCenter.registerManagedService(managedUserName, {
          name: testServiceName,
          type: 'mail',
          datas: {
            address: email
          }})

          expect(result).toBeDefined()
        }
    })

    test('should contains user managed service', async () => {
      if (managedUserName) {
        const result = await notificationCenter.listManagedServices(managedUserName)

        expect(result).toBeDefined()

        expect(result?.map(s => s.serviceName)).toContain(testServiceName)
      }
    })

    test('should return no subscriptions in user managed service', async () => {
      if (managedUserName) {
        const result = await notificationCenter.subscriptionsInManagedService(testServiceName, managedUserName)

        expect(result).toBeUndefined()
      }
    })

    test('should delete user managed service', async () => {
      if (managedUserName) {
        const result = await notificationCenter.deleteManagedService(testServiceName, managedUserName)

        expect(result).toBeDefined()
      }
    })

  })

  describe('User managed subscription', () => {
    beforeAll(() => {
      if (email && managedUserName) {
        return new Promise(done => {
          console.log('Will authenticate managed')

          notificationCenter.authenticate({username: managerUserName, password: managerPassword})
            .then(() => {
              console.log('Will create user managed service')

              notificationCenter.registerManagedService(managedUserName, {
                name: testServiceName,
                type: 'mail',
                datas: {
                  address: email
                }
              }).then(() => {
                console.log('User managed service created')
              }).catch(() => {
                console.log('User managed service already exists')
              })
            .catch(e => {
              console.error('Authentication failed: %v', e)
            })
          }).finally(() => {
            console.log('Did create User managed service')
            done(undefined);
          })
        })
      }
    })

    test('should create a user managed subscription in service', async () => {
      if (managedUserName) {
        const subscription = notificationCenter.buildSubscription({ langs: 'fr', urgencies: 2, classes: 'text'})
        const services = await notificationCenter.addManagedSubscription(testSubscriptionName, testServiceName, managedUserName, subscription)

        expect(services).toBeDefined()
      }
    })

    test('should get user managed subscription for user', async () => {
      if (managedUserName) {
        const subscription = await notificationCenter.getManagedSubscription(testSubscriptionName, managedUserName)

        expect(subscription.name).toEqual(testSubscriptionName)
      }
    })

    test('should list user managed subscription and found', async () => {
      if (managedUserName) {
        const subscription = await notificationCenter.listManagedSubscriptions(managedUserName)

        expect(subscription?.map(s => s.name)).toContain(testSubscriptionName)
      }
    })

    test('should set quietTime for user managed subscription', async () => {
      if (managedUserName) {
        const timeFormat = 'HH:mm:ss'
        const timeZone = 'UTC' // Bug in apicore must be UTC Intl.DateTimeFormat().resolvedOptions().timeZone

        const startTime = moment.tz('23:59:59', timeFormat, timeZone)
        const endTime = moment.tz('06:59:59', timeFormat, timeZone)

        const result = await notificationCenter.setManagedQuietTime(testSubscriptionName, managedUserName, true, {
          startTime: startTime.format(timeFormat),
          endTime: endTime.format(timeFormat),
          tz: timeZone
        })

        expect(result).toEqual(testSubscriptionName)

        const subscription = await notificationCenter.getManagedSubscription(testSubscriptionName, managedUserName)

        expect(subscription.quietTime).toBeDefined()

        if (subscription.quietTime) {
          const _startTime = moment.tz(subscription.quietTime.startTime, timeFormat, subscription.quietTime.tz)
          const _endTime = moment.tz(subscription.quietTime.endTime, timeFormat, subscription.quietTime.tz)
          // Bug in apicore must be UTC
          expect(_startTime.tz(timeZone).format(timeFormat)).toEqual(startTime.format(timeFormat))
          expect(_endTime.tz(timeZone).format(timeFormat)).toEqual(endTime.format(timeFormat))
        }
      }
    })

    test('should delete user managed subscription', async () => {
      if (managedUserName) {
        const subscription = await notificationCenter.deleteManagedSubscription(testSubscriptionName, managedUserName)

        expect(subscription).toEqual(testSubscriptionName)
      }
    })

    afterAll((done) => {
      console.log('Will delete user managed service')

      if (managedUserName) {
          notificationCenter.subscriptionsInManagedService(testServiceName, managedUserName).then((subscriptions) => {
            const promises: Promise<string>[] = []

            if (subscriptions && subscriptions.length > 0) {
              console.log('Will delete registered subscription in user managed service deleted')

              promises.push(...subscriptions.map(subscription => notificationCenter.deleteManagedSubscription(subscription.name, managedUserName)))
            } else {
              console.log('Any registered subscription in user managed service to delete')
            }

            return Promise.all(promises)
          }).then((deleted) => {
            if (deleted.length > 0) {
              console.log('All registered subscription in user managed service deleted')
            }
          }).finally(() => {
            notificationCenter.deleteManagedService(testServiceName, managedUserName)
              .then(() => console.log('User managed service deleted'))
              .catch((e) => console.error(e))
              .finally(() => done())
          })
      } else {
        done()
      }
    })
  })

})

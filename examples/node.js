const ApiCore = require('../')
require('dotenv').config()

const {
  APICORE_CLIENT_ID: clientId,
  APICORE_CLIENT_SECRET: clientSecret,
  APICORE_USERNAME: username,
  APICORE_PASSWORD: password
} = process.env

// Initialize the API
const apicore = new ApiCore({
  clientId,
  clientSecret,
  saveToken: token => {
    // You can eventually save the token to be used later
    console.log(token)
  }
})

// Search for latest documents
apicore.authenticate({
  username,
  password
})
.then(() => {
  apicore.search().then(console.log)
  apicore.list('slug').then(console.log)
  apicore.topics('fr').then(console.log)
  apicore.topicIndex('Sport', 'fr').then(console.log)
})

# ApiCore API

![Build Status](https://github.com/Fred78290/afp-apicore-sdk/workflows/NodeJS/badge.svg?branch=master)

This project is aimed to help javascript developers use the [AFP API ApiCore](https://afp-apicore-prod.afp.com/).

It provides authentication, searching for documents function, and online news product.

## Getting Started

This package is available both for NodeJS and browsers. That's why two versions are available on the `./dist` directory.

### Prerequisites

Read [the API documentation](https://afp-apicore-prod.afp.com/), and [ask for an API Key and credentials](https://developers.afp.com).

### Installing

#### Node

`npm install --save afp-apicore-sdk`

```js
const ApiCore = require('afp-apicore-sdk')
// OR using import
import ApiCore from 'afp-apicore-sdk'
```

#### Browser

```html
<script src="./dist/afp-apicore-sdk.umd.js"></script>
```

### Let's start using it

```js
// Initialize the API
const apicore = new ApiCore({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  saveToken: token => {
    // You can eventually save the token to be used later
    console.log(token)
  }
})

// Search for latest documents
apicore
  .authenticate({
    username: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD'
  })
  .then(() => apicore.search())
  .then(({ documents }) => {
    console.log(documents)
  })

// Get a specific document
apicore
  .get('A_SPECIFIC_UNO')
  .then(document => {
    console.log(document)
  })

// Look for similar documents
apicore
  .mlt('A_SPECIFIC_UNO')
  .then(({ documents }) => {
    console.log(documents)
  })

// Display the most used slugs
apicore
  .list('slug')
  .then(({ keywords }) => {
    console.log(keywords)
  })
```

### Query parser

The above request use default parameters stored in ./src/default-search-params.js

You can pass your own parameters to the search function, that will overide the defaults : 

```js
apicore.search({
  products: ['news'],
  langs: ['fr'],
  urgencies: [1, 2, 3, 4],
  query: 'french politics',
  size: 10,
  dateFrom: '2012-01-01',
  dateTo: 'now',
  sortField: 'published',
  sortOrder: 'desc'
})
```

The query parameter can be used to look precisely for a field (`title:Macron`) and may include logical parameters (`Macron OR Merkel`, `Macron AND NOT Merkel`, `title:(Macron OR Merkel) AND country:fra`).

## Development

Clone the repository, then `npm install`

Build and minify your work for browsers and node with `npm run build`

## Running the tests

Just `npm test` to execute all tests in `./tests`

You will need some environment variables in a .env file : 

```
APICORE_BASE_URL=
APICORE_API_KEY=
APICORE_CLIENT_ID=
APICORE_CLIENT_SECRET=
APICORE_USERNAME=
APICORE_PASSWORD=
APICORE_CUSTOM_AUTH_URL=https://
```

## Built With

* [Microbundle](https://www.npmjs.com/package/microbundle) - Building machine
* [TypeScript](https://www.typescriptlang.org/) - Typescript

## Authors

* [Jules Bonnard](https://github.com/julesbonnard) - *Initial work*
* [Fred78290](https://github.com/Fred290) - *Apicore integration*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

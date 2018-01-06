const fs = require('fs')
const rp = require('../node_modules/request-promise')

const get = (url, port, path) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `http://${url}:${port}${path}`,
      timeout: 3000,
      json: true
    }
    rp(options)
      .then((data) => { resolve(true) })
      .catch((err) => { resolve(false) })
  })
}

export { get }


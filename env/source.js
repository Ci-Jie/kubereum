const fs = require('fs')
const request = require('request')
const rp = require('request-promise')

module.exports = {
  read: function (fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  },
  write: function (fileName, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, JSON.stringify(data), err => {
        if (err) reject(err)
        else resolve(true)
      })
    })
  },
  post: function (url, method, params) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        url: `http://${url}:8545`,
        body: {
          'jsonrpc': '2.0',
          'method': method,
          'params': params,
          'id': 74
        },
        json: true
      }
      rp(options)
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          resolve(err)
        })
    })
  }
}
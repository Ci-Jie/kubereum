const fs = require('fs')
const rp = require('request-promise')

const filePath = '/kubereum/monitor/env/global.json'

const read = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const write = data => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), err => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

function post (url, method, params) {
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
      .then((data) => { resolve(data) })
      .catch((err) => { resolve(err) })
  })
}

function get (url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `http://${url}:8545`,
      json: true
    }
    rp(options)
      .then((data) => { resolve(true) })
      .catch((err) => { resolve(false) })
  })
}

export { get, post, read, write }
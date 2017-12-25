const fs = require('fs')

const filePath = '/eth-netstats/kubereum/netstat/env/global.json'

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

export { read, write }
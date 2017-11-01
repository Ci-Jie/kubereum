const shell = require('shelljs')
const os = require('os')
const fs = require('fs')

const WS_SECRET = process.env.WS_SECRET

const filePath = '/env/global.json'

function read (fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function write (fileName, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, JSON.stringify(data), err => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

async function main () {
  const env = JSON.parse(await read(filePath))
  if (!env.dashboardAddress) {
    env.dashboardAddress = os.networkInterfaces().eth0[0].address
    await write(filePath, env)
  }
  shell.cd('eth-netstats')
  shell.exec('WS_SECRET=' + WS_SECRET + ' npm start')
}

main()
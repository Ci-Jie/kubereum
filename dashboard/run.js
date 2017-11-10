const shell = require('shelljs')
const fs = require('fs')
const os = require('os')

const filePath = './env/global.json'

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
  shell.cd('../../')
  shell.exec(`WS_SECRET=${process.env.WS_SECRET} npm start`)
}

main()
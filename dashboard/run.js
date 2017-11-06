const shell = require('shelljs')
const os = require('os')
const source = require('/env/source.js')

const WS_SECRET = process.env.WS_SECRET
const filePath = '/env/global.json'

async function main () {
  const env = JSON.parse(await source.read(filePath))
  if (!env.dashboardAddress) {
    env.dashboardAddress = os.networkInterfaces().eth0[0].address
    await source.write(filePath, env)
  }
  shell.cd('eth-netstats')
  shell.exec(`WS_SECRET=${WS_SECRET} npm start`)
}

main()
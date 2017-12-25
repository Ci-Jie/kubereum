const shell = require('shelljs')
const os = require('os')

import { read, write } from './source'

const IP = os.networkInterfaces().eth0[0].address
const WS_SECRET = process.env.WS_SECRET

async function main () {
  const env = JSON.parse(await read())
  if (!env.netstatIP) {
    env.netstatIP = IP
    await write(env)
  }
  shell.cd('/eth-netstats')
  shell.exec(`WS_SECRET=${WS_SECRET} npm start`)
  if (!shell.error()) console.info(`Ethereum netstat started: ok`.green)
  else console.info(`Ethereum netstat started: failed`.red)
}

main()
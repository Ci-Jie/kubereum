const shell = require('../node_modules/shelljs')
const sleep = require('system-sleep')

import * as http from './http'
import * as fs from './fs'

const check = async (MASTER_IP) => {
  console.info('----- Deploy proxy -----'.green)
  const res = await http.get(MASTER_IP, '30002', '/nodes')
  if (res) {
    console.info('* Skip deploy proxy : ok'.green)
    return true
  } else { return false }
}

const deployDP = async () => {
  console.info('* Deploy proxy deployment...'.green)
  await shell.exec('kubectl apply -f kubernetes/proxy-dp.yaml', { silent: true })
  if (!shell.error()) console.info('* Deploy proxy deployment : ok'.green)
  else console.info('* Deploy proxy deployment : failed'.red)
}

const deploySVC = async () => {
  console.info('* Deploy proxy service...'.green)
  await shell.exec('kubectl apply -f kubernetes/proxy-svc.yaml', { silent: true })
  if (!shell.error()) console.info('* Deploy proxy service : ok'.green)
  else console.info('* Deploy proxy service : failed'.red)
}

const test = async (MASTER_IP) => {
  let count = 0
  while (true) {
    const env = JSON.parse(await fs.read())
    const res = await http.get(MASTER_IP, '30002', '/nodes')
    if (res) {
      console.info('* Test proxy service : ok'.green)
      break
    }
    if (count === 36) {
      console.info('* Test netstat service : failed'.red)
      break
    }
    count++
    sleep(5000)
  }
}

export { check, deployDP, deploySVC, test }
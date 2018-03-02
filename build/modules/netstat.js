const shell = require('../node_modules/shelljs')
const sleep = require('system-sleep')

import * as http from './http'
import * as fs from './fs'

const check = async (MASTER_IP) => {
  const res = await http.get(MASTER_IP, '30001', '/')
  if (res) {
    console.info('* Skip deploy Netstat : ok'.green)
    return true
  } else { return false }
}

const deployDP = async () => {
  console.info('----- Deploy netstat -----'.green)
  await shell.exec('kubectl apply -f ./kubernetes/netstat-dp.yaml', { silent: true })
  if (!shell.error()) console.info('* Deploy netstat deployment : ok'.green)
  else console.info('* Deploy netstat deployment : failed'.red)
}

const deploySVC = async () => {
  await shell.exec('kubectl apply -f ./kubernetes/netstat-svc.yaml', { silent: true })
  if (!shell.error()) console.info('* Deploy netstat service : ok'.green)
  else console.info('* Deploy netstat service : failed'.red)
}

const test = async (K8S_MASTER_IP) => {
  let count = 0
  while (true) {
    const env = JSON.parse(await fs.read())
    const res = await http.get(K8S_MASTER_IP, '30001', '/')
    if (res) {
      console.info('* Test netstat service : ok'.green)
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
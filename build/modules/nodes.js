const shell = require('../node_modules/shelljs')
const sleep = require('system-sleep')

import * as http from './http'
import * as fs from './fs'

const test = async (index) => {
  console.info(`* Testing node ${index + 1}...`.green)
  while (true) {
    const env = JSON.parse(await fs.read())
    let count = 0
    if (env.nodes.length >= index + 1) {
      const node = env.nodes[index]
      const res = await http.get(node.IP, '8545', '/')
      if (res) {
        console.info(`* Test node ${index + 1} : ok`.green)
        break
      }
    }
    if (count === 36) {
      console.info(`* Test node ${index + 1} : failed`.red)
      break
    }
    count++
    sleep(5000)
  }
}

const deployDP = async (replicasCount) => {
  console.info(`----- Deploy Ethereum miner nodes -----`.green)
  const env = JSON.parse(await fs.read())
  if (env.nodes.length > replicasCount) {
    await shell.sed('-i', 'replicas: .*', `replicas: ${replicasCount}`, 'kubernetes/node-dp.yaml')
    await shell.exec('kubectl apply -f kubernetes/node-dp.yaml', { silent: true })
    for (let index = 0; index < replicasCount; index ++) await test(index)
  } else if (env.nodes.length < replicasCount) {
    for (let index = env.nodes.length; index < replicasCount; index++) {
      console.info(`* Deploying node-${index + 1} deployment...`.green)
      await shell.sed('-i', 'replicas: .*', `replicas: ${index + 1}`, 'kubernetes/node-dp.yaml')
      await shell.exec('kubectl apply -f kubernetes/node-dp.yaml', { silent: true })
      await test(index)
    }
  } else {
    console.info(`* Skip deploy nodes : ok `.green)
  }
}

export { deployDP }
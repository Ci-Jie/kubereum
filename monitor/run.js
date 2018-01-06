const sleep = require('system-sleep')

import { checkNodesHealthy, checkEnode, checkPeers, checkMining } from './method'

async function main () {
  while(true) {
    await checkEnode()
    await checkPeers()
    await checkMining()
    await checkNodesHealthy()
    sleep(10000)
  }
}

main()
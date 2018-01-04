const sleep = require('system-sleep')

import { checkNodesHealthy, setEnode } from './method'

async function main () {
  while(true) {
    await setEnode()
    await checkNodesHealthy()
    sleep(10000)
  }
}

main()
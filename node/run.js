import { addNode, createNodeName, run, setData } from './method'

const RESTART = process.env.RESTART
const DATA_PATH = '/eth-net-intelligence-api/kubereum/node/env'

import { read, write } from './source'

async function main () {
  const nodeName = createNodeName()
  const nodeData = await setData(DATA_PATH)
  await addNode(nodeName, nodeData)
  await run(nodeName, nodeData)
}

main()
const colors = require('colors')

import { get, post, read, write } from './source'

const setEnode = async () => {
  const env = JSON.parse(await read())
  const firstNodeIP = env.nodes[0].IP
  let enode = ''
  if (Object.keys(env.enode).length === 0 && (env.enode).constructor === Object) {
    enode = await post(firstNodeIP, 'admin_nodeInfo', [])
    console.info(enode)
  }
}

export { setEnode }

const colors = require('colors')

import { get, post, read, write } from './source'

const getEnode = async (nodeIP) => {
  let enode = ''
  try {
    enode = (await post(nodeIP, 'admin_nodeInfo', [])).result.id
    console.info(`* Get enode (${enode}) : ok`.green)
  } catch (e) { console.info(`* Get enode : failed`.red) }
  return enode
}

const setEnode = async () => {
  const env = JSON.parse(await read())
  const firstNodeIP = env.nodes[0].IP
  if (Object.keys(env.enode).length === 0 && (env.enode).constructor === Object) {
    try {
      const enode = await getEnode(firstNodeIP)
      env.enode = { 'IP': firstNodeIP, 'enode': enode }
      await write(env)
      console.info(`* Set enode : ok`.green)
    } catch (e) {
      console.info(`* Set enode : failed`.red)
    }
  }
}

const removeNode = async (nodeIP) => {
  try {
    const env = JSON.parse(await read())
    env.nodes.splice(env.nodes.indexOf(nodeIP), 1)
    await write(env)
    console.info(`* Remove node (${nodeIP}) : ok`.green)
  } catch (e) {
    console.info(`* Remove node (${nodeIP}) : failed`.green)
  }
}

const getAccount = async (nodeIP, index) => {
  const accounts = (await post(nodeIP, 'eth_accounts', [])).result
  let account = ''
  if (accounts.length > 0) {
    account = accounts[index]
  } else {
  	account = (await post(nodeIP, 'personal_newAccount', ['123456'])).result
  }
  console.info(`* Get Account (${account}) : ok`.green)
  return account
}

const unlockAccount = async (nodeIP, account, password) => {
  const result = (await post(nodeIP, 'personal_unlockAccount', [account, password])).result
  if (result) console.info(`* Unlock account (${account}) : ok`.green)
  else console.info(`* Unlock account (${account}) : failed`.red)
  return result
}

const startMining = async (nodeIP) => {
  const env = JSON.parse(await read())
  const account = await getAccount(nodeIP, 0)
  const unlockResult = await unlockAccount(nodeIP, account, '123456')
  if (unlockResult) {
    try {
      await post(nodeIP, 'setEtherbase', account)
      await post(nodeIP, 'miner_start', [4])
      console.info(`* Start mining : ok`.green)
      return true
    } catch (e) {
      console.info(`* Start mining : failed`.red)
      return false
    }
  }
}

const checkNodesHealthy = async () => {
  const env = JSON.parse(await read())
  for( let index in env.nodes ) {
    const nodeIP = env.nodes[index].IP
    if (await get(nodeIP)) {
      console.info(`* Check node (${nodeIP}) : exist`.green)
      if (!(env.nodes[index].mining)) {
        const result = await startMining(nodeIP)
        if (result) {
          env.nodes[index].mining = true
          await write(env)
          console.info(`* Update env : ok`.green)
        }
      }
    } else {
      console.info(`* Check node (${nodeIP}) : leave`.red)
      removeNode(nodeIP)
    }
  }
}

export { checkNodesHealthy, setEnode }

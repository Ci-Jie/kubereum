const colors = require('colors')

import { get, post, read, write } from './source'

const getEnode = async (nodeIP) => {
  let enode = ''
  try {
    enode = `enode://${(await post(nodeIP, 'admin_nodeInfo', [])).result.id}@${nodeIP}:30303`
    console.info(`* Get enode ('${enode}') : ok`.green)
  } catch (e) { console.info(`* Get enode : failed`.red) }
  return enode
}

const checkEnode = async () => {
  const env = JSON.parse(await read())
  for (let index = 0; index < env.nodes.length; index++) {
    let count = 0;
    if (env.nodes[index].enode === "") {
      await setEnode()
      break
    }
    if (count === (env.nodes.length - 1)) console.info('* Check enode : ok'.green)
  }
}

const setEnode = async () => {
  const env = JSON.parse(await read())
  try {
    for (let index = 0; index < env.nodes.length; index++) {
      if (env.nodes[index].enode === "") env.nodes[index].enode = await getEnode(env.nodes[index].IP)
    }
    await write(env)
    console.info('* Set all of enode : ok'.green)
  } catch (e) {
    console.info('$ Set all of enode : failed'.red)
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
      await post(nodeIP, 'miner_start', [])
      console.info(`* Start node (${nodeIP}) mining : ok`.green)
      return true
    } catch (e) {
      console.info(`* Start node (${nodeIP}) mining : failed`.red)
      return false
    }
  }
}

const checkMining = async () => {
  const env = JSON.parse(await read())
  for (let index in env.nodes) {
    if (env.nodes[index].status === 'notReady') {
      const nodeIP = env.nodes[index].IP
      await startMining(nodeIP)
      env.nodes[index].status = 'ready'
      await write(env)
    }
  }
  console.info('* Check all nodes start mining : ok'.green)
}

const checkNodesHealthy = async () => {
  const env = JSON.parse(await read())
  for(let index in env.nodes) {
    const nodeIP = env.nodes[index].IP
    const nodeStatus = env.nodes[index].status
    if (await get(nodeIP)) {
      console.info(`* Check node (${nodeIP}) : ok`.green)
    } else {
      if (nodeStatus === 'ready') removeNode(nodeIP)
      console.info(`* Check node (${nodeIP}) : failed`.red)
    }
  }
}

const checkPeers = async () => {
  const env = JSON.parse(await read())
  const peersCount = (await post(env.nodes[0].IP, 'admin_peers', [])).result.length
  if (peersCount !== env.nodes.length - 1) {
    const enode = env.nodes[0].enode
    for (let index = 1; index < env.nodes.length; index++) {
      try {
        await post(env.nodes[index].IP, 'admin_addPeer', [enode])
        console.info(`* Add node (${env.nodes[index].IP}) to Ethereum : ok`.green)
      } catch (e) { console.info(`* Add node (${env.nodes[index].IP}) to Ethereum : failed`.red) }
    }
  } else {
    console.info(`* Check peers : ok`.green)
  }
}

export { checkNodesHealthy, checkPeers, checkEnode, checkMining }

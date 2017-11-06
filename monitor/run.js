const sleep = require('system-sleep')
const filePath = '/env/global.json'
const source = require('/env/source.js')

async function setEnode (env) {
  if (env.nodes.length > 0) {
    let nodeInfo = (await source.post(env.nodes[0].IP, 'admin_nodeInfo', [])).result.enode
    const enode = nodeInfo.split('[::]')[0]
    const port = nodeInfo.split('[::]')[1]
    env.enode = {
      'IP': env.nodes[0].IP,
      'code': `${enode}${env.nodes[0].IP}${port}`
    }
    await source.write(filePath, env)
  } else {
    console.log('Not any nodes.')
  }
}

async function connectAllNodes (env) {
  for (let index = 0; index < env.nodes.length; index++) {
    await source.post(env.nodes[index].IP, 'admin_addPeer', [env.enode.code])
    console.log(`Add ${env.nodes[index].IP}`)
  }
}

async function removeNode (env) {
  const number = env.nodes.indexOf(env.nodes[index].IP)
  env.nodes.splice(number, 1)
  await source.write(filePath, env)
}

async function monitor () {
  const env = JSON.parse(await source.read(filePath))
  if (!env.enode) await setEnode(env)
  if (env.nodes.length > 0) {
    const peers = (await source.post(env.nodes[0].IP, 'admin_peers', [])).result.length
    console.log(`Peer : ${peers}`)
    console.log(`Nodes : ${env.nodes.length}`)
    if (peers != env.nodes.length - 1) {
      await connectAllNodes(env)
      sleep(3000)
    }
    for (let index = 0; index < env.nodes.length; index++) {
      try {
        (await source.post(env.nodes[index].IP, 'admin_nodeInfo', [])).result.id
      } catch (e) {
        console.log(`Remove ${env.nodes[index].IP}`)
        await removeNode(env)
      }
    }
  } else {
    console.log('Not any nodes.')
  }
}

async function miner () {
  const env = JSON.parse(await source.read(filePath));
  for (let index = 0; index < env.nodes.length; index++) {
    const account = (await source.post(env.nodes[index].IP, 'personal_newAccount', ["password"])).result
    console.log(account)
    await source.post(env.nodes[index].IP, 'personal_unlockAccount', [account, "password", 300])
    await source.post(env.nodes[index].IP, 'miner_setEtherbase', [account])
    console.log(await source.post(env.nodes[index].IP, 'miner_start', []))
  }
}

async function main () {
  const env = JSON.parse(await source.read(filePath))
  if (process.env.CREATE_ACCOUNT === true) miner()
  while (true) {
    await monitor()
    sleep(10000)
  }
}

main()
const sleep = require('system-sleep')
const fs = require('fs')
const request = require('request')
const rp = require('request-promise')
const filePath = './env/global.json'

function read (fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function write (fileName, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, JSON.stringify(data), err => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

function post (url, method, params) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `http://${url}:8545`,
      body: {
        'jsonrpc': '2.0',
        'method': method,
        'params': params,
        'id': 74
      },
      json: true
    }
    rp(options)
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        resolve(err)
      })
  })
}

async function setEnode (env) {
  if (env.nodes.length > 0) {
    let nodeInfo = (await post(env.nodes[0].IP, 'admin_nodeInfo', [])).result.enode
    const enode = nodeInfo.split('[::]')[0]
    const port = nodeInfo.split('[::]')[1]
    env.enode = {
      'IP': env.nodes[0].IP,
      'code': `${enode}${env.nodes[0].IP}${port}`
    }
    await write(filePath, env)
  } else {
    console.log('Not any nodes.')
  }
}

async function connectAllNodes (env) {
  for (let index = 0; index < env.nodes.length; index++) {
    await post(env.nodes[index].IP, 'admin_addPeer', [env.enode.code])
    console.log(`Add ${env.nodes[index].IP}`)
  }
}

async function removeNode (env) {
  const number = env.nodes.indexOf(env.nodes[index].IP)
  env.nodes.splice(number, 1)
  await write(filePath, env)
}

async function monitor () {
  const env = JSON.parse(await read(filePath))
  if (!env.enode) await setEnode(env)
  if (env.nodes.length > 0) {
    const peers = (await post(env.nodes[0].IP, 'admin_peers', [])).result.length
    console.log(`Peer : ${peers}`)
    console.log(`Nodes : ${env.nodes.length}`)
    if (peers != env.nodes.length - 1) {
      await connectAllNodes(env)
      sleep(3000)
    }
    for (let index = 0; index < env.nodes.length; index++) {
      try {
        (await post(env.nodes[index].IP, 'admin_nodeInfo', [])).result.id
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
  const env = JSON.parse(await read(filePath));
  for (let index = 0; index < env.nodes.length; index++) {
    const account = (await post(env.nodes[index].IP, 'personal_newAccount', ["password"])).result
    console.log(account)
    await post(env.nodes[index].IP, 'personal_unlockAccount', [account, "password", 300])
    await post(env.nodes[index].IP, 'miner_setEtherbase', [account])
    console.log(await post(env.nodes[index].IP, 'miner_start', []))
  }
}

async function main () {
  const env = JSON.parse(await read(filePath))
  if (process.env.CREATE_ACCOUNT === 'true') miner()
  while (true) {
    await monitor()
    sleep(10000)
  }
}

main()
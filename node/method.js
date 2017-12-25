const shell = require('shelljs')
const os = require('os')
const colors = require('colors')

import { read, write } from './source'

const IP = os.networkInterfaces().eth0[0].address
const envPath = '/eth-net-intelligence-api/kubereum/node/env'
const WS_SECRET = process.env.WS_SECRET
const RESTART = process.env.RESTART

const addNode = async (nodeName, nodeData) => {
  const env = JSON.parse(await read())
  env.nodes.push({'name': nodeName, 'IP': nodeData.IP, 'dataDir': nodeData.dataDir})
  await write(env)
  console.info(`* Add Node (Name: ${nodeName}, IP: ${nodeData.IP}, DataDir: ${nodeData.dataDir}) in Ethrerum : ok`.green)
}

const createNodeName = () => {
  const nodeName = `node-${Math.floor(Math.random() * (9999 - 1)) + 1}`
  console.info(`* Create new node name (${nodeName}) : ok`.green)
  return nodeName
}

const createDataName = () => {
  const dataName = `data-${Math.floor(Math.random() * (9999 - 1)) + 1}`
  console.info(`* Create new data name (${dataName}) : ok`.green)
  return dataName
}

const createChainID = () => {
  const chainID = `${Math.floor(Math.random() * (9999 - 1)) + 1}`
  console.info(`* Create a new chain ID (${chainID}) : ok`.green)
  return chainID
}

const initData = dataName => {
  shell.exec(`geth --datadir ${envPath}/${dataName} init genesis.json`)
  if (shell.error()) console.info(`* Create data to new node : failed`.red)
  else console.info(`* Create data to new node : ok`.green)
}

const renameData = (oldName, newName) => {
  shell.mv('-n', oldName, newName)
  if (shell.error()) console.info(`* Set data to new node : failed`.red)
  else console.info(`* Set data to new node : ok`.green)
}

const setData = async (dataPath) => {
  const env = JSON.parse(await read())
  const dataName = createDataName()
  if (RESTART === 'false') {
    let filesArray = []
    let nodesArray = []
    shell.cd(dataPath)
    shell.ls('-d', 'data-*').forEach(file => filesArray.push(file))
    for(let index in env.nodes) nodesArray.push(env.nodes[index].dataDir)
    const datas = filesArray.concat(nodesArray).filter(v => !filesArray.includes(v) || !nodesArray.includes(v))
    if (datas.length === 0) initData(dataName)
    else renameData(datas[0], dataName)
  } else {
    initData(dataName)
  }
  return { 'IP': IP, 'dataDir': dataName }
}

const run = async (nodeName, nodeData) => {
  const env = JSON.parse(await read())
  let chainID = ''
  if (env.chainID) {
    chainID = env.chainID
  } else {
    env.chainID = createChainID()
    await write(env)
  }
  shell.sed('-i', '123', env.chainID, '/eth-net-intelligence-api/kubereum/node/env/genesis.json')
  shell.sed('-i', 'localhost', nodeData.IP, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', `"INSTANCE_NAME"   : ""`, `"INSTANCE_NAME"   : "${nodeName}"`, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', 'wss://rpc.ethstats.net', `http://${env.netstatIP}:3000`, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', 'see http://forum.ethereum.org/discussion/2112/how-to-add-yourself-to-the-stats-dashboard-its-not-automatic', `${WS_SECRET}`, '/eth-net-intelligence-api/app.json')
  shell.exec('pm2 start /eth-net-intelligence-api/app.json')
  shell.cd('/eth-net-intelligence-api/kubereum/node')
  shell.exec(`geth --datadir ${envPath}/${nodeData.dataDir} --networkid ${WS_SECRET}  --port 30303 --rpc --rpcapi=db,eth,net,web3,personal,miner --rpcaddr 0.0.0.0 --ws --wsaddr=0.0.0.0`)
}

export { addNode, createNodeName, run, setData }
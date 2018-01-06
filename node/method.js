const shell = require('shelljs')
const os = require('os')
const colors = require('colors')

import { read, write } from './source'

const IP = os.networkInterfaces().eth0[0].address
const envPath = '/eth-net-intelligence-api/kubereum/node/env'
const WS_SECRET = process.env.WS_SECRET

const checkNode = async (nodeData) => {
  const env = JSON.parse(await read())
  for (let index in env.nodes) { if (env.nodes[index].IP === nodeData.IP) return { 'exist': true, 'index': index }}
  return { 'exist': false, 'index': '' }
}

const addNode = async (nodeName, nodeData) => {
  const env = JSON.parse(await read())
  const checkRes = await checkNode(nodeData)
  if (checkRes.exist) {
    env.nodes[checkRes.index] = {'name': nodeName, 'IP': nodeData.IP, 'dataDir': nodeData.dataDir, 'status': 'notReady', 'enode': ''}
    console.info(`* Update Node (Name: ${nodeName}, IP: ${nodeData.IP}, DataDir: ${nodeData.dataDir}, status: 'notReady') in Ethrerum : ok`.green)
  } else {
    env.nodes.push({'name': nodeName, 'IP': nodeData.IP, 'dataDir': nodeData.dataDir, 'status': 'notReady', 'enode': ''})
    console.info(`* Add Node (Name: ${nodeName}, IP: ${nodeData.IP}, DataDir: ${nodeData.dataDir}, status: 'notReady') in Ethrerum : ok`.green)
  }
  await write(env)
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

const initData = async (dataName) => {
  await shell.exec(`geth --datadir ${envPath}/${dataName} init genesis.json`, { silent: true })
  if (!shell.error()) console.info(`* Create data to new node : ok`.green)
  else console.info(`* Create data to new node : failed`.red)
}

const renameData = (oldName, newName) => {
  shell.mv('-n', oldName, newName)
  if (!shell.error()) console.info(`* Rename nodeData from ${oldName} to ${newName} : ok`.green)
  else console.info(`* Rename nodeData from ${oldName} to ${newName} : failed`.red)
}

const setData = async (dataPath) => {
  const env = JSON.parse(await read())
  const dataName = createDataName()
  let filesArray = []
  let nodesArray = []
  shell.cd(dataPath)
  shell.ls('-d', 'data-*').forEach(file => filesArray.push(file))
  for(let index in env.nodes) nodesArray.push(env.nodes[index].dataDir)
  const datas = filesArray.concat(nodesArray).filter(v => !filesArray.includes(v) || !nodesArray.includes(v))
  if (datas.length === 0) initData(dataName)
  else renameData(datas[0], dataName)
  console.info(`* Set nodeData (${dataName}) to new node : ok`.green)
  return { 'IP': IP, 'dataDir': dataName }
}

const run = async (nodeName, nodeData) => {
  const env = JSON.parse(await read())
  shell.sed('-i', 'localhost', nodeData.IP, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', `"INSTANCE_NAME"   : ""`, `"INSTANCE_NAME"   : "${nodeName}"`, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', 'wss://rpc.ethstats.net', `http://${env.netstatIP}:3000`, '/eth-net-intelligence-api/app.json')
  shell.sed('-i', 'see http://forum.ethereum.org/discussion/2112/how-to-add-yourself-to-the-stats-dashboard-its-not-automatic', `${WS_SECRET}`, '/eth-net-intelligence-api/app.json')
  shell.cd('/eth-net-intelligence-api')
  await shell.exec('pm2 start app.json', { silent: true })
  shell.cd('/eth-net-intelligence-api/kubereum/node')
  await shell.exec(`geth --datadir ${envPath}/${nodeData.dataDir} --nodiscover --networkid ${WS_SECRET} --port 30303 --rpc --rpcapi "admin,db,eth,net,web3,personal,miner" --rpcaddr 0.0.0.0 --ws --wsaddr=0.0.0.0`)
}

export { addNode, createNodeName, run, setData }
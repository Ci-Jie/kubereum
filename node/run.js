const shell = require('shelljs');
const os = require('os');
const fs = require('fs');
const sleep = require('system-sleep');

const filePath = '/env/global.json';

const IP = os.networkInterfaces().eth0[0].address

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

function checkNode (node, nodes) {
  for (var index = 0; index < nodes.length; index++) if (node == nodes[index]) return true
  return false
}

function run (env) {
  shell.exec('geth --datadir ./data/00 init genesis.json')
  shell.sed('-i', 'localhost', IP, 'eth-net-intelligence-api/app.json')
  shell.sed('-i', '\"INSTANCE_NAME\"   : \"\"', '\"INSTANCE_NAME\"   : \"' + process.env.INSTANCE_NAME + '\"', 'eth-net-intelligence-api/app.json')
  shell.sed('-i', '\"wss://rpc.ethstats.net\"', '\"http://' + env.dashboardAddress + ':3000\"', 'eth-net-intelligence-api/app.json')
  shell.sed('-i', '\"see http://forum.ethereum.org/discussion/2112/how-to-add-yourself-to-the-stats-dashboard-its-not-automatic\"', '\"' + process.env.WS_SECRET + '\"', 'eth-net-intelligence-api/app.json')
  shell.cd('eth-net-intelligence-api')
  shell.exec('pm2 start app.json')
  shell.cd('..')
  shell.exec('geth --datadir ./data/00 --networkid ' + process.env.WS_SECRET + ' --port 2000 --rpc --rpcapi=db,eth,net,web3,personal,admin,miner --rpcaddr 0.0.0.0')
}

async function main () {
  sleep(3000)
  const env = JSON.parse(await read(filePath))
  if (!checkNode(IP, env.nodes)) env.nodes.push({'IP': IP, 'account': []})
  await write(filePath, env)
  if (!env.chainID) {
    const chainID = Math.floor(Math.random() * (999999999 - 1)) + 1
    env.chainID = chainID
    await write(filePath, env)
  }
  shell.sed('-i', '123', env.chainID, 'genesis.json')
  run(env)
}

main()
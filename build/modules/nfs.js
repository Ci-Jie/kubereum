const shell = require('../node_modules/shelljs')

import * as connect from './connect'

const connected = async (ip) => {
  console.info('----- Test connect to NFS node -----'.green)
  console.info('* Testing connect to NFS node... '.green)
  if (await connect.connected(ip)) console.info(`* Test connect to NFS node (${ip}) : ok`.green)
  else console.info(`* Test connect to NFS node (${ip}) : failed`.red)
}

const mounted = async (NFSURL, NFSPath) => {
  const envPath = `${await shell.pwd()}/env`
  const nfs = await shell.exec(`df -h ${envPath} | grep ${NFSURL}:${NFSPath}`, { silent: true }).stdout
  if (nfs) {
    console.info('----- Test mount NFS Server -----'.green)
    console.info('* Skip mount NFS Server : ok'.green)
    return true
  } else { return false }
}

const mount = async (NFSURL, NFSPath) => {
  console.info('----- Mount NFS Server -----'.green)
  await shell.sed('-i', 'server: .*', `server: '${NFSURL}'`, './kubernetes/nfs-pv.yaml')
  await shell.sed('-i', 'path: .*', `path: '${NFSPath}'`, './kubernetes/nfs-pv.yaml')
  await shell.exec('kubectl apply -f ./kubernetes/nfs-pv.yaml', { silent: true })
  await shell.exec('kubectl apply -f ./kubernetes/nfs-pvc.yaml', { silent: true })
  await shell.exec('mkdir -p ./env', { silent: true })
  await shell.exec(`mount -t nfs ${NFSURL}:${NFSPath} ./env`, { silent: true })
  if(!shell.error()) console.info('* Mount NFS Server : ok'.green)
  else console.info('* Mount NFS Server : failed'.red)
}

const copyFile = async (source, dest) => {
  await shell.cp(source, dest)
  if (!shell.error()) console.info(`* Copy file (${source}) : ok`.green)
  else console.info(`* Copy file (${source}) : failed`.red)
}

export { connected, copyFile, mount, mounted }
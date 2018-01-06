import * as connect from './connect'

const masterConnected = async (ip) => {
  console.info('----- Test connect to Kubernetes master -----'.green)
  console.info('* Testing connect to Kubernetes master...'.green)
  if (await connect.connected(ip)) console.info(`* Test connect to Kubernetes master (${ip}) : ok`.green)
  else console.info(`* Test connect to Kubernetes master (${ip}) : failed`.red)
}

const nodesConnected = async (ips) => {
  console.info('----- Test connect to Kubernetes nodes -----'.green)
  console.info('* Testing connect to Kubernetes nodes...'.green)
  for (let index in ips) {
    if (await connect.connected(ips[index])) console.info(`* Test connect to Kubernetes nodes (${ips[index]}) : ok`.green)
    else console.info(`* Test connect to Kubernetes nodes (${ips[index]}) : failed`.red)
  }
}

export { masterConnected, nodesConnected }
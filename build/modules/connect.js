const shell = require('../node_modules/shelljs')
const colors = require('../node_modules/colors')

const connected = async (ip) => {
  await shell.exec(`ping -c 3 ${ip}`, { silent: true })
  if (!(shell.error())) return true
  else return false
}

export { connected }
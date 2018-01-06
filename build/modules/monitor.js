const shell = require('../node_modules/shelljs')

const deployDP = async () => {
  console.info('----- Deploy monitor -----'.green)
  console.info('* Deploy monitor deployment...'.green)
  await shell.exec('kubectl apply -f kubernetes/monitor-dp.yaml', { silent: true })
  console.info('* Deploy monitor : ok'.green)
}

export { deployDP }
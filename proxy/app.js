const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
const rp = require('request-promise')
const fs = require('fs')

const app = new Koa()
const router = new Router()
app.use(bodyParser())

const filePath = '/kubereum/proxy/env/global.json'

const post = (url, method, params) => {
  const paramsArr = params.split(',')
  let array = []
  for (let index = 0; index < paramsArr.length; index++) {
    if (paramsArr[index] === 'true') array.push(true)
    else if (paramsArr[index] === 'false') array.push(false)
    else array.push(paramsArr[index])
  }
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `http://${url}:8545`,
      body: {
        'jsonrpc': '2.0',
        'method': method,
        'params': array,
        'id': 74
      },
      json: true
    }
    rp(options)
      .then((data) => { resolve(data) })
      .catch((err) => { resolve(err) })
  })
}

const read = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

router.get('/nodes', async (ctx) => {
  const env = JSON.parse(await read())
  ctx.response.status = 200
  ctx.response.body = {
    'result': env.nodes
  }
})

router.post('/proxy', async (ctx) => {
  const env = JSON.parse(await read())
  for (let index = 0; index < env.nodes.length; index++) {
    if (ctx.request.body.node === env.nodes[index].name) {
      ctx.response.status = 200
      const res = await post(env.nodes[index].IP, ctx.request.body.method, ctx.request.body.params)
      ctx.response.body = {
        'result': res
      }
      break
    }
    if (index === env.nodes.length - 1) {
      ctx.response.status = 403
      ctx.response.body = {
        'result': {}
      }
    }
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000)
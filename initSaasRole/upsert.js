const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const request = require('request')

function loadYaml (fileName) {
    let doc
    // Get document, or throw exception on error
    try {
      const pathName = path.resolve(__dirname, `./${fileName}.yml`)
      doc = yaml.safeLoad(fs.readFileSync(pathName, 'utf8'))
    } catch (e) {
      console.log(e)
    }
    return doc
}

let cfg
let myArgs = process.argv.slice(2)
if (myArgs.length > 0) {
  cfg = loadYaml(myArgs[0])
} else {
  cfg = loadYaml('saas')
}
if (!cfg) {
  console.log("load config failed")
  return
}
console.log(cfg, {depth: null})

request.post('http://127.0.0.1:6666/api/v1/sudo/batch-update', {
  json: {
    data: cfg
  }
}, (error, res, body) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(`statusCode: ${res.statusCode}`)
  console.log(body)
})

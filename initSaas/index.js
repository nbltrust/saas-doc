const axios = require('axios')
const _ = require('lodash')
const { config } = require('./config')
const assert = require('assert')

const checkSuperAdminExist = async () => {
  let { data } = await axios.get(`${config.superAdminHost}/api/v1/status`)
  return data
}

const initSuperAdmin = async () => {
  let { superAdminAccount, superAdminPw } = config
  let { data } = await axios.post(`${config.superAdminHost}/api/v1/initialize`, { email: superAdminAccount, password: superAdminPw, pwdrepeat: superAdminPw })
  return data
}

const login = async () => {
  let { superAdminAccount, superAdminPw } = config
  let { data } = await axios.post(`${config.superAdminHost}/api/v1/session`, { email: superAdminAccount, password: superAdminPw })
  return data
}

const addHub = async (jwt) => {
  let headers = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }
  let payload = {
    "name": "Jadepool-01",
    "test_net": "true",
    "ecc_enable": "true",
    "status": "true",
    "description": "",
    "companyID": "",
    "eccPubKey": "03ace32532c90652e1bae916248e427a7ab10aeeea1067949669a3f4da10965ef9",
    "host": `${config.hubHost}`,
    "port": config.hubPort,
    "version": "1.0.0"
  }
  try {
    let { data } = await axios.post(`${config.superAdminHost}/api/v1/jadepool`, payload, headers)
    return data
  } catch (err) {
    console.log(err)
  }

}

const addBlockchain = async (jwt) => {
  let headers = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }
  let payload = {
    "name": config.asset,
    "type": config.asset,
    "description": "",
    "confirmation": 10
  }
  try {
    let { data } = await axios.post(`${config.superAdminHost}/api/v1/blockchain`, payload, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const getBlockchains = async (jwt) => {
  let headers = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }
  try {
    let { data } = await axios.get(`${config.superAdminHost}/api/v1/blockchains`, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const addAsset = async (jwt, id) => {
  let headers = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }
  let payload = {
    "name": config.asset.toLowerCase(),
    "description": "",
    "blockchainID": id,
    "decimal": 10,
    "smartContract": "",
    "withdrawFee": "0",
    "depositFee": "0",
    "withdrawSwitch": true,
    "depositSwitch": true,
    "highLevel": "100",
    "lowLevel": "0",
    "logoURL": "string",
    "addressWithMemo": false,
    "explorerURL": "string"
  }
  try {
    let { data } = await axios.post(`${config.superAdminHost}/api/v1/asset`, payload, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const sleepSeconds = (s) => {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}
const initSaas = async () => {
  let ret = await checkSuperAdminExist()
  if (ret.data.isInit) {
    console.warn('database already has superadmin account')
  } else {
    let init = await initSuperAdmin()
    assert(init.code == 0, 'create super admin failed')
  }

  let status = await login()
  assert(status.data.token, 'super admin login failed')
  let jwt = status.data.token

  let addHubStatus = await addHub(jwt)
  if (addHubStatus.code === 20002) {
    console.warn('hub alreay exist')
  } else {
    assert(addHubStatus.data.ID, 'add hub failed')
  }

  await sleepSeconds(3)

  let addBlockchainStatus = await addBlockchain(jwt)
  await sleepSeconds(3)
  assert(addBlockchainStatus.code == 0, 'add blockchain failed')

  let blockchains = await getBlockchains(jwt)
  assert(blockchains.data.length > 0)

  await sleepSeconds(3)

  let { ID } = _.find(blockchains.data, {name: config.asset})
  let addAssetStatus = await addAsset(jwt, ID)
  assert(addAssetStatus.code == 0, 'add asset failed')
  console.log('init saas success')
}

initSaas()

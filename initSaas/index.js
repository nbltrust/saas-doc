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

const genHeader = (jwt) => {
  return {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }
}

const addHub = async (headers) => {
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

const addBlockchain = async (headers) => {
  let payload = {
    "name": config.asset + "_",
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

const getBlockchains = async (headers) => {
  try {
    let { data } = await axios.get(`${config.superAdminHost}/api/v1/blockchains`, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const addAsset = async (headers, id) => {
  let payload = {
    "name": config.asset,
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
    "logoURL": "",
    "addressWithMemo": false,
    "explorerURL": ""
  }
  try {
    let { data } = await axios.post(`${config.superAdminHost}/api/v1/asset`, payload, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const addCompany = async (headers, companyName) => {
  let payload = {
    "name": companyName,
    "description": "",
    "address": "",
    "contact": "",
    "email": config.companyEmail
  }
  let { data } = await axios.post(`${config.saasHost}/api/v1/company/apply`, payload, headers)
  return data
}

const getAllCompay = async (headers) => {
  try {
    let { data } = await axios.get(`${config.superAdminHost}/api/v1/companies`, headers)
    return data
  } catch (err) {
    console.log(err)
  }
}

const passCompany = async (headers, id) => {
  try {
    let { data } = await axios.put(`${config.superAdminHost}/api/v1/company/${id}/pass`, {}, headers)
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

  let headers = genHeader(jwt)

  let addHubStatus = await addHub(headers)
  if (addHubStatus.code === 20002) {
    console.warn('hub alreay exist')
  } else {
    assert(addHubStatus.data.ID, 'add hub failed')
  }

  await sleepSeconds(3)

  let addBlockchainStatus = await addBlockchain(headers)
  await sleepSeconds(3)
  if (addBlockchainStatus.code == 20002) {
    console.warn('blockchain already exist')
  } else {
    assert(addBlockchainStatus.code == 0, 'add blockchain failed')
  }

  let blockchains = await getBlockchains(headers)
  assert(blockchains.data.length > 0)

  await sleepSeconds(3)

  let { ID } = _.find(blockchains.data, { type: config.asset })
  let addAssetStatus = await addAsset(headers, ID)
  if (addAssetStatus.code === 20002 || addAssetStatus.code === 10003) {
    console.warn(`asset ${config.asset} already exist`)
  } else {
    assert(addAssetStatus.code == 0, 'add asset failed')
  }

  let companyName = new Date().getTime().toString()
  let addCompanyStatus = await addCompany(headers, companyName)
  if (addCompanyStatus.code === 20002) {
    console.warn(`email ${config.companyEmail} has been registered, exit init saas...`)
    process.exit(1)
  } else {
    assert(addCompanyStatus.code == 0, 'add company failed')
  }

  await sleepSeconds(3)
  let getCompanyStatus = await getAllCompay(headers)
  assert(getCompanyStatus.code == 0, 'get all company failed')
  let { companies } = getCompanyStatus.data
  let toApplyCompany = _.find(companies, { name: companyName })
  let companyId = toApplyCompany.id
  let passCompanyStatus = await passCompany(headers, companyId)
  assert(passCompanyStatus.code == 0, 'pass company failed')

  console.log('init saas finished...')
}

initSaas()

### 初始化文档
#### 前置条件
- node

#### 步骤
1. 安装依赖
```bash
cd initSaas
npm i
```

2. 修改配置文件
```bash
cd initSaas
vi config.js

const config = {
  superAdminHost: 'http://127.0.0.1:8093',           # saas super admin service
  saasHost: 'http://127.0.0.1:8094',                 # saas admin service
  superAdminAccount: 'superadmin@nbltrust.com',      # the email which will be newly created as saas super admin role
  superAdminPw: 'xxxxxx',                            # super admin password
  hubHost: '127.0.0.1',                              # jadepool hub host which saas will connect to
  hubPort: 7001,                                     # hub port
  asset: 'ETH',                                      # asset which will be added in saas
  companyEmail: 'mycompany@nbltrust.com',            # company email to be registered, saas will fire this account an email, user need to follow the email to active this account
}
```

3. 开始初始化
```bash
node index.js
```

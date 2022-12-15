### jadepool saas部署文档
#### 版本
|版本|修订日期 |修订人 |
|--|--|--|
| V6.2.0 | 2022-12-15 | shaw |
#### 环境准备及依赖组件安装

最基础的一套saas,需要启动这些服务:

 - saas后端，包括api, jp, admin, superadmin, order server五个不同的服务
 - saas前端，主要连接saas后端admin服务
 - postgres数据库, v11.2+
 - redis数据库, v5.0.3+
 - seed服务

	 
部署过程
1. 建议服务器配置：

> 4核8G内存2M带宽以上，ubuntu16.04

2. 预先安装：

- 安装postgres
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```
- postgres新增saas用户及database
```bash
sudo -u postgres psql -U postgres -d postgres
```
```sql
# 新增saas用户及database sql
CREATE USER saas WITH PASSWORD 'xxxxxx';
CREATE DATABASE saas OWNER saas;
GRANT ALL PRIVILEGES ON DATABASE saas to saas;
```
- 安装并启动redis
```bash
sudo apt-get install redis-server
sudo systemctl enable redis-server.service
```
数据库和redis密码，需要与config配置文件相同。



#### 部署saas后端服务
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：
```bash
cd $WORKSPACE
tar -xzvf jadepool-saas-backend-V1.4.0-ubuntu.tar.gz
```

2. 修改配置文件，选项参考config/template.yaml
  - 修改postgres, redis数据库连接方式
vim ./jadepool-saas-backend/config/pro.yaml
```
database:
	host: localhost
	port: 5432
	name: saas
	user: saas
	pass: xxxxxx
	type: postgres

redis:
	addr: localhost:6379
	pass: ""
	db: 0
```

 - 修改邮件服务器配置

vim ./jadepool-saas-backend/config/pro.yaml
```
email: 
	host: smtp.gmail.com
	port: 587
	user: saas.dev@jadepool.io
	pass: xxxxxx
	tls: true
```

 - 修改连接hub时所需要的appid和pri_key, 其中pri_key为saas这一侧的ecc私钥，需要在hub admin中配置同名的appid和相应的ecc公钥

vim ./jadepool-saas-backend/config/pro.yaml
```
jpsrv:
	jadepool_appid: "saas"
	pri_key: "xxxxxx"
```

 - 修改saasadmin weburl和role service url
vim ./jadepool-saas-backend/config/pro.yaml
```
saasadmin:
  saas_web_url: "http://127.0.0.1:3000"           # 指向saas前端对应的url
  access_control_enable: true                     # 是否激活角色权限(V1.4.0后必须开启)
  service_role_url: "http://127.0.0.1:6666"       # 配置上一步启动role service时角色权限服务对应url
  service_name: "jadepool-saas"                   # 请求role service时使用的service name
```

3. 启动saas backend, 新建pm2配置文件。注意JP_SECRET需修改为与hub、jadepool-service-role一致。

vim ./jadepool-saas-backend/pm2/saas-prod.yaml
```
apps:
  - cwd: ./
    name: saas-jp
    script: ./bin/jpSrv
    watch: false
    error_file : ./log/saas-jp-error.log
    out_file : ./log/saas-jp-out.log
    env:
      env: "pro"
      JP_SECRET: xxx

  - cwd: ./
    name: saas-order
    script: ./bin/orderSrv
    watch: false
    error_file : ./log/saas-order-error.log
    out_file : ./log/saas-order-out.log
    env:
      env: "pro"
      JP_SECRET: xxx

  - cwd: ./
    name: saas-admin
    script: ./bin/saasAdmin
    watch: false
    error_file : ./log/saas-admin-error.log
    out_file : ./log/saas-admin-out.log
    env:
      env: "pro"
      JP_SECRET: xxx

  - cwd: ./
    name: saas-api
    script: ./bin/apiSrv
    watch: false
    error_file : ./log/saas-api-error.log
    out_file : ./log/saas-api-out.log
    env:
      env: "pro"
      JP_SECRET: xxx

  - cwd: ./
    name: saas-superadmin
    script: ./bin/superAdmin
    watch: false
    error_file : ./log/saas-superadmin-error.log
    out_file : ./log/saas-superadmin-out.log
    env:
      env: "pro"
      JP_SECRET: xxx
```
4. 启动saas后端服务
```bash
pm2 start ./pm2/saas-prod.yaml
```

#### 部署saas前端代码
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：

```bash
cd $WORKSPACE
tar -xzvf jadepool-saas-frontend-V1.5.3-math-ubuntu.tar.gz
```
2. 安装nginx
```bash
sudo apt update
sudo apt install -y nginx
```
3. 使用nginx反向代理指向saas前端静态文件, nginx配置参考
```bash
server {
  listen 3003;
  server_name default;
  index 200.html index.html;
  # 此处填写jadepool-saas-frontend路径
  root /opt/jadepool/saas/V1.7.1/jadepool-saas-frontend;
  location / {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "POST, HEAD, PUT, PATCH, GET, DELETE";
    add_header Access-Control-Allow-Headers "cache-control, content-type, Origin, Authorization, Accept";
    add_header Access-Control-Allow-Credentials true;
    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    try_files $uri $uri/ =404;
    error_page 404 =301 /;
  }
  location ~ ^/NginxStatus/ {
    stub_status on;
    access_log off;
    }
  location ~ .*\.(html)?$
  {
    expires 0m;
  }
}
```

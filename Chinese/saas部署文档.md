### jadepool saas部署文档
#### 版本
|版本|修订日期 |修订人 |
|--|--|--|
| V1.2.0 | 2019-08-07 | Sarcy |
| | | |
#### 环境准备及依赖组件安装
首先jadepool saas服务依赖jadepool hub, 在部署saas之前请确保hub部署完成。关于hub部署步骤可以在[这里](https://github.com/nbltrust/jadepool-doc/blob/master/Chinese/%E7%91%B6%E6%B1%A0%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3.md)查看。

最基础的一套saas,需要启动这些服务:

 - saas后端，包括api, jp, admin, superadmin, order server五个不同的服务
 - saas前端，主要连接saas后端admin服务
 - postgres数据库, v11.2+
 - redis数据库, v5.0.3+
 - seed服务(可选)，可用于存储以下内容：
	 - 与hub通信时所需要的ecc公私钥对(saas私钥，hub公钥)
	 - 访问api server时所需要的app key/secret
	 
建议将这些服务和hub放在一个局域网中，外层配置防火墙。 本文将以最简的方式(部署在单台服务器)来介绍整个部署过程。如需微服务的方式,请参考进一步的文档。
1. 建议服务器配置：

> 4核8G内存2M带宽以上，ubuntu16.04

2. 预先安装：

- 增加用户saas

```
useradd -r -m saas
su - saas
```
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
请自行设置数据库用户名密码，和配置主从。


#### 部署saas后端服务
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：

```bash
cd $WORKSPACE
mkdir saas-backend
tar -xzvf saas-backend-V1.2.0-ubuntu-full.tar.gz -C ./saas-backend

mkdir saas-frontend
tar -xzvf saas-frontend-V1.2.0-ubuntu-full.tar.gz -C ./saas-frontend
```

2. 修改postgres, redis数据库连接方式

vim ./saas-backend/config/pro.yaml
```yml
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
4. 修改邮件服务器配置

vim ./saas-backend/config/pro.yaml
```yml
email: 
	host: smtp.gmail.com
	port: 587
	user: saas.dev@jadepool.io
	pass: xxxxxx
	tls: true
```
5. 修改连接hub时所需要的appid和pri_key, 其中pri_key为saas这一侧的ecc私钥，需要在hub admin中配置同名的appid和相应的ecc公钥

vim ./saas-backend/config/pro.yaml
```yml
jpsrv:
	jadepool_appid: "saas"
	pri_key: "xxxxxx"
```
6. 其他配置可参考使用config/template.yaml默认配置
7. 新建pm2配置文件

vim ./saas-backend/pm2/saas-prod.yaml
```yml
apps:
  - cwd: ./
    name: saas-jp
    script: ./bin/jpSrv
    watch: false
    error_file : ./log/saas-jp-error.log
    out_file : ./log/saas-jp-out.log
    env:
      env: "pro"

  - cwd: ./
    name: saas-order
    script: ./bin/orderSrv
    watch: false
    error_file : ./log/saas-order-error.log
    out_file : ./log/saas-order-out.log
    env:
      env: "pro"

  - cwd: ./
    name: saas-admin
    script: ./bin/saasAdmin
    watch: false
    error_file : ./log/saas-admin-error.log
    out_file : ./log/saas-admin-out.log
    env:
      env: "pro"

  - cwd: ./
    name: saas-api
    script: ./bin/apiSrv
    watch: false
    error_file : ./log/saas-api-error.log
    out_file : ./log/saas-api-out.log
    env:
      env: "pro"

  - cwd: ./
    name: saas-superadmin
    script: ./bin/superAdmin
    watch: false
    error_file : ./log/saas-superadmin-error.log
    out_file : ./log/saas-superadmin-out.log
    env:
      env: "pro"
```
8. 启动saas后端服务
```bash
pm2 start ./pm2/saas-prod.yaml
```
#### 部署saas前端代码
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：

```bash
cd $WORKSPACE
mkdir saas-frontend
tar -xzvf saas-frontend-V1.2.0-ubuntu-full.tar.gz -C ./saas-frontend
```
2. 安装nginx
```bash
sudo apt update
sudo apt install -y nginx
```
3. 使用nginx反向代理指向saas前端静态文件


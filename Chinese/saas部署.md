### jadepool saas部署文档
#### 版本
|版本|修订日期 |修订人 |修订人 |
|--|--|--|--|
| V6.2.0 | 2022-12-15 | shaw |lucifer|
#### 环境准备及依赖组件安装

最基础的一套saas,需要启动这些服务:

 - saas后端，包括admin,kyc-api两个服务
 - saas前端，主要连接saas后端admin服务
 - go, v1.14.2
 - postgres数据库, v11.2+
 - redis数据库, v5.0.3+
 - seed服务

	 
部署过程
1. 建议服务器配置：

> 4核8G内存2M带宽以上，ubuntu16.04

2. 预先安装：
- 安装go
- 安装postgres
- postgres新增saas用户及database
```sql
# 新增saas用户及database sql
CREATE USER saas WITH PASSWORD 'xxxxxx';
CREATE DATABASE saas;
CREATE DATABASE kyc_database;
GRANT ALL PRIVILEGES ON DATABASE saas to saas;
```
- 安装并启动redis
注意：数据库和redis密码，需要与config配置文件相同。



#### 部署saas后端服务
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：
```bash
cd $WORKSPACE
tar -xzvf jadepool-saas-backend-V6.2.1-ubuntu.tar.gz
```
2.数据导入
- pro.yml文件放置在jadepool-saas-svr/config
- saas-pro.yml文件放置在jadepool-saas-svr/pm2
- admin和kyc_database需要导入到数据库里


3. 启动saas后端服务
- 导入权限
 ```bash
env=pro ./bin/cli -op migrateSAASRoles
 ```
- 启动
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

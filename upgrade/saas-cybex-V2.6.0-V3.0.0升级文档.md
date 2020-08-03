### 调整说明
- V2.6.0-V3.0.0
- 运营系统需要手动设置默认default和package
#### 一、`拉取saas最新包(cybex环境)`
##### saas后端
- ssh root@121.196.217.176:/home/ops/general/saas/V3.0.4/jadepool-saas-backend-V3.0.4-ubuntu.tar.gz .
##### saas前端
- ssh root@121.196.217.176:/home/ops/general/saas/V3.0.2/jadepool-saas-frontend-3.0.2-cybex-ubuntu.tar.gz .
##### saas admin
- ssh root@121.196.217.176:/home/ops/general/saas/V3.0.0/jadepool-saas-admin-V3.0.0-ubuntu.tar.gz .
#### 二、停用saas服务
#### 三、`备份数据库`(重要)
#### 四、替换后端包
#### 五、替换前端包
#### 六、替换admin包
#### 七、nginx配置需要更新
- 在nginx的配置里找到后端请求的url
```bash
server {
        listen 443;
        server_name api.jadepool.io;

       ssl on;
       ssl_certificate   cert/api.jadepool.io.pem;
       ssl_certificate_key  cert/api.jadepool.io.key;
       ssl_session_timeout 5m;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
       ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
       ssl_prefer_server_ciphers on;

    location / {
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass    http://127.0.0.1:8094;
        #try_files $uri $uri/ =404;
        #error_page 404 =301 /;
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
 - 在proxy_http_version 1.1下面增加两行（如果已有无需添加）
 ```bash
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
 ```
 - 重启nginx       
 service nginx restart
#### 八、升级前需手动去数据库删除role
```bash
db.getCollection('jp_roles').remove({name: 'FINANCIAL_OFFICER'})
```
#### 九、更新权限列表
```bash
git clone https://github.com/nbltrust/saas-doc.git
cd ./saas-doc
git pull
git checkout V3.0.0
cd ./initSaasRole
node upsert.js   该node执行完后执行下一行的
node upsert.js saas-admin
```
#### 十、saas-admin部署步骤更新

1. 修改请求的后端服务url
```bash
vim index.html
# 修改href
<meta id="backend_host" href=""/>
改为
<meta id="backend_host" href="xxx.xxx.xxx"/>
xxx.xxx.xxx为后端请求url
```

#### 十一、启动saas服务
#### 十二、在saas后端主目录下跑下面的命令
```bash
env=prod ./bin/cli -op migrateReports -log-level INFO
```

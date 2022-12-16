### jadepool saas部署文档
#### 版本
|版本|修订日期 |修订人 |修订人 |修订人 |
|--|--|--|--|--|
| V6.2.0 | 2022-12-15 | shaw |lucifer|zhangyang |
#### 环境准备及依赖组件安装

 最基础的一套saas,需要启动这些服务:

 - saas后端，包括admin,kyc-api两个服务
 - saas前端，主要连接saas后端admin服务
 - postgres数据库, v11.8-1
 - redis数据库, v5.0.8
 - Elasticsearch, v6.8.23
 - seed服务, R1.2.1.190121
 - nginx, v1.22

	 
#### 一、环境准备
1. 建议服务器配置：

> 4核8G内存2M带宽以上，ubuntu16.04

2. 预先安装：

- 安装postgres
- postgres新增saas用户及database
```sql
# 新增saas用户及database sql
CREATE USER saas WITH PASSWORD 'xxxxxx';
CREATE DATABASE saas;
CREATE DATABASE kyc_database;
CREATE DATABASE log_database;
```
- 安装并启动redis



#### 二、部署seed服务
1、tmux new -s seed_saas
2、创建seed_saas文件夹
3、进入seed_saas， 执行./seed 设置密码 
4、启动./seed

#### 三、部署saas后端服务
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：
```bash
cd $WORKSPACE
tar -xzvf jadepool-saas-backend-V6.2.1-ubuntu.tar.gz
```
2. 数据导入
- pro.yml文件放置在jadepool-saas-svr/config
```bash
需要修改对应数据库和redis的ip
```
- saas-pro.yml文件放置在jadepool-saas-svr/pm2
- admin和kyc_database需要导入到数据库里
3. 执行sql语句
```bash
zhangyang
```
4. 启动saas后端服务

- 启动，在jadepool-saas-svr目录下启动
```bash
pm2 start pm2/saas-pro.yaml
```


#### 四、部署saas前端代码
1. 请在服务器新建工作目录，并将收到的saas放到工作目录，为了方便描述用$WORKSPACE表示工作目录：

```bash
cd $WORKSPACE
tar -xzvf jadepool-saas-frontend-V6.2.0-hkcustody-ubuntu.tar.gz
```
2. 安装nginx

3. 使用nginx反向代理指向saas前端静态文件, nginx配置参考
```bash
server {
        listen 80;
        server_name  xpert.hashkey.com;


        add_header Access-Control-Allow-Origin https://xpert.hashkey.com;
        add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS,PATCH;
        add_header Access-Control-Allow-Headers Content-Type,Content-Length,Authorization,Accept,X-Requested-With,Current-Page,X-AuthCode,X-Wallet-Password,X-SMSCode,X-GoogleCode;

        rewrite ^/custody$  / permanent;
        rewrite ^/account-activat\?(.*)$  /account-activate/?$1 permanent;
        location ~ ^/saas-t\.ico$ {
                  rewrite ^/(.*)$  https://xpert.hashkey.com/saas/$1 permanent;
         }
        location ~ ^/saas\.ico$ {
                  rewrite ^/(.*)$  https://xpert.hashkey.com/saas-admin/$1 permanent;
         }
        location / {
                alias /home/jadepool/saas/prime-website/dist/;
                index  index.html;
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                #rewrite ^/saas-t.ico$  /saas/saas-t.ico last;
                rewrite ^/apply  /user/apply last;
                rewrite ^/login  /user/login last;
                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/user\/(.*)$) {
                  rewrite ^/(.*)$  /user/$1 last;
                 }
                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/kyc\/(.*)$) {
                  rewrite ^/(.*)$  /kyc/$1 last;
                 }

                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/saas-admin\/(.*)$) {
                  rewrite ^/(.*)$  /saas-admin/$1 last;
                 }
                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/style\.css$) {
                  rewrite ^/(.*)$  /saas-admin/$1 last;
                 }

                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/hub\/(.*)$) {
                  rewrite ^/(.*)$  /hub/$1 permanent;
                 }
                if ($http_referer ~* ^https:\/\/xpert\.hashkey\.com\/trading\/(.*)$) {
                  rewrite ^/(.*)$  /trading/$1 permanent;
                 }
                try_files $uri $uri/ =404;
                error_page 404 =301 /;
                proxy_http_version 1.1;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $host;

                if ($request_method = 'OPTIONS') {
                  return 204;

                }
          set $flag 0;
          if ($ip_whitelist != 1) {
              set $flag "1";
          }
          if ($geoip2_data_country_code ~ "(CN)") {
              set $flag "${flag}2";
          }
         if ($flag ~ "(12)") {
              return 403;

        }


        }


        location /user {
                alias /home/jadepool/saas/jadepool-saas-frontend;
                index  200.html index.html;
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
                error_page 404 =301 /user/;
 
                allow   106.14.3.167;
                allow   47.91.218.48;
                allow   18.162.231.172;
                allow   18.163.54.194;
                allow   180.167.200.34;
                allow   180.167.200.35;
                allow   180.167.200.36;
                allow   180.169.254.69;
                allow    all;


                if ($request_method = 'OPTIONS') {
                  return 204;

                }
          set $flag 0;
          if ($ip_whitelist != 1) {
              set $flag "1";
          }
          if ($geoip2_data_country_code ~ "(CN)") {
              set $flag "${flag}2";
          }
         if ($flag ~ "(12)") {
              return 403;

        }

        }


     location /kyc {
                alias /home/jadepool/saas/jadepool-saas-kyc;
                index  200.html index.html;
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.

                try_files $uri $uri/ =404;
                error_page 404 =301 /kyc/;


                set $flag 0;
                if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.116\.63\.199.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^222\.71\.39\.162.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^58\.246\.68\.202.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^106\.14\.3\.167.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.44\.30.* ){set $flag 1;}
                if ($flag = 0){return 403;}
                if ($request_method = 'OPTIONS') {
                       return 204;

                }
             location ~* \.html?$ {
             expires -1;
             add_header Pragma "no-cache";
             add_header Cache-Control "no-store, must-revalidate";
             }

         }
     location /kycserver/ {
                set $flag 0;
                if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.116\.63\.199.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^222\.71\.39\.162.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^58\.246\.68\.202.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^106\.14\.3\.167.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.44\.30.* ){set $flag 1;}
                if ($flag = 0){return 403;}

                proxy_set_header Upgrade $http_upgrade;
                 proxy_set_header Connection "upgrade";
                 proxy_http_version 1.1;
                 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                 proxy_set_header Host $host;
                 proxy_pass    http://127.0.0.1:8096/;

         }

        location /saas-admin {
                #alias /home/jadepool/saas/source/jadepool-saas-admin/build;
                alias /home/jadepool/saas/jadepool-saas-admin;
                index  index.html;
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                rewrite ^/saas-admin/login$  /saas-admin permanent;
                try_files $uri $uri/ =404;
                error_page 404 =301 /;
                set $flag 0; 
                if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.116\.63\.199.* ){set $flag 1;}
 #               if ( $http_x_forwarded_for ~* ^222\.71\.39\.162.* ){set $flag 1;}
 #               if ( $http_x_forwarded_for ~* ^58\.246\.68\.202.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^106\.14\.3\.167.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.44\.30.* ){set $flag 1;}
             #  if ( $http_x_forwarded_for ~* ^52\.221\.6\.73.* ){set $flag 1;}
             #  if ( $http_x_forwarded_for ~* ^180\.169\.254\.69.* ){set $flag 1;}
             #  if ( $http_x_forwarded_for ~* ^180\.169\.254\.70.* ){set $flag 1;}
             #  if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
             #   if ($flag = 0){return 403;}
            
                #allow   106.14.3.167;
                #allow   47.91.218.48;
                #allow   18.162.231.172;
                #allow   18.163.54.194;
                #allow   180.167.200.34;
                #allow   180.167.200.35;
                #allow   180.167.200.36;
                #allow   180.169.254.69;
                ##deny    all;
                allow    all;
                if ($request_method = 'OPTIONS') {
                  return 204;

                }
        }
        location /saas-superadmin/ {
     #        limit_rate 100k;
                set $flag 0; 
                if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.116\.63\.199.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^222\.71\.39\.162.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^58\.246\.68\.202.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.91\.218\.48\.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^106\.14\.3\.167.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.87\.248.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.44\.30.* ){set $flag 1;}
              # if ( $http_x_forwarded_for ~* ^52\.221\.6\.73.* ){set $flag 1;}
              # if ( $http_x_forwarded_for ~* ^180\.169\.254\.69.* ){set $flag 1;}
              # if ( $http_x_forwarded_for ~* ^180\.169\.254\.70.* ){set $flag 1;}
              # if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
               # if ($flag = 0){return 403;}
             allow   106.14.3.167;
             allow   47.91.218.48;
             allow   18.162.231.172;
             allow   18.163.54.194;
             allow   180.167.200.34;
             allow   180.167.200.35;
             allow   180.167.200.36;
             allow   180.169.254.69;
             #deny    all;
             allow    all;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
             proxy_http_version 1.1;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header Host $host;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;

             proxy_pass    http://127.0.0.1:8093/;
         }
        location /saas-bg/api/v1/company/apply {
            deny    all;
        }

        location /saas-bg/ {
    #        limit_rate 100k;
            allow   106.14.3.167;
            allow   47.91.218.48;
            allow   18.162.231.172;
            allow   18.163.54.194;
            allow   180.167.200.34;
            allow   180.167.200.35;
            allow   180.167.200.36;
            allow   180.169.254.69;
            allow    all;

            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass    http://127.0.0.1:8094/;
        }

        location /saas-api/ {
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass    http://127.0.0.1:8092/;
        }
        location /saas-noti/ {
           set $flag 0;
           if ( $http_x_forwarded_for ~* ^18\.138\.174\.10.* ){set $flag 1;}
           if ($flag = 0){return 403;}

            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass    http://127.0.0.1:8091/;
        }

        location /trading {
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass   http://alb-xpert-1870136920.ap-east-1.elb.amazonaws.com; 
        }
       
        location /hub/ {
    #        limit_rate 100k;
                 set $flag 0; 
                if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.116\.63\.199.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^222\.71\.39\.162.* ){set $flag 1;}
#                if ( $http_x_forwarded_for ~* ^58\.246\.68\.202.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^47\.91\.218\.48.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^106\.14\.3\.167.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^180\.169\.254\.68.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^18\.166\.44\.30.* ){set $flag 1;}
                if ( $http_x_forwarded_for ~* ^210\.13\.75\.182.* ){set $flag 1;}
              #  if ( $http_x_forwarded_for ~* ^52\.221\.6\.73.* ){set $flag 1;}
              #  if ( $http_x_forwarded_for ~* ^180\.169\.254\.69.* ){set $flag 1;}
              #  if ( $http_x_forwarded_for ~* ^180\.169\.254\.70.* ){set $flag 1;}
              # if ( $http_x_forwarded_for ~* ^101\.132\.40\.61.* ){set $flag 1;}
                if ($flag = 0){return 403;}
            allow   106.14.3.167;
            allow   47.91.218.48;
            allow   18.162.231.172;
            allow   18.163.54.194;
            allow   172.17.4.180;
            #deny    all;
            allow    all;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass    http://172.16.0.197:3000;
        }



        location /resource {
                alias /home/jadepool/saas/resource;
                index  index.html;
        }


        location ~ ^/NginxStatus/ {
                stub_status on;
                access_log off;
         }
        access_log /var/log/nginx/xpert-hashkeysaas-access.log  post_tracking;
        error_log /var/log/nginx/xpert-hashkeysaas-error.log;

    }

    server {
        listen 80 default_server;
        server_name _;
        return 403; # 403 forbidden
    }


```
#### 五、部署官网代码
可以参考部署saas前端代码

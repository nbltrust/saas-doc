#### 一、停用saas服务
#### 二、替换后端包
#### 三、替换前端包
#### 四、替换admin包
#### 五、备份数据库
#### 六、saas-admin部署步骤更新
#### 七、执行下行脚本导入权限文件
```bash
env=pro ./bin/cli -op migrateSuperRoles   创建默认角色和绑定默认权限
```
#### 八、主目录下进入trading目录
```bash
cd trading
npm install
```
#### 九、saas-admin部署步骤更新
1. 修改请求的后端服务url
```bash
vim index.html
# 修改href
<meta id="backend_host" href=""/>
改为
<meta id="backend_host" href="xxx.xxx.xxx"/>
xxx.xxx.xxx为后端请求url
```

#### 十、启动saas

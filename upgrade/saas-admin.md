## saas-admin前端使用说明
1. 解压jadepool-saas-admin-V1.13.0-ubuntu.tar.gz
```bash
tar -xzvf jadepool-saas-admin-V1.13.0-ubuntu.tar.gz
```
2. 修改请求的后端服务url
假设saas-superadmin服务对应的url为https://saas-superadmin.custody.net
```bash
cd jadepool-saas-admin

vim index.html
# 修改href
<meta id="backend_host" href=""/>改为
<meta id="backend_host" href="https://saas-superadmin.custody.net"/>
```

3. 使用nginx代理saas-admin静态文件， 具体步骤可以参考[saas部署文档]最后一步(https://github.com/nbltrust/saas-doc/blob/master/Chinese/saas%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3.md)

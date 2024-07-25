## 开发环境
yarn start

## 打包
yarn patch

## 发布
npm publish itsm-web

## 发布操作
1. 修改当前 package.json 的版本号
2. yarn patch 后会多出一个itsm-web的文件夹
3. npm publish itsm-web (发布权限需要去平台组那里申请)
4. 发布成功以后老的项目更新一下包就可以了

## 补丁包操作
1.yarn patch 后会多出一个itsm-web的文件夹
2.将itsm-web文件夹放入到老项目中的\node_modules\@uyun （覆盖就可以了，不要替换）

## 工单查询组件

1. 代码入口：src/widgets/ticket-list
2. 预览: widget:preview
* 注意：修改everest.config的PreviewWidgetWebpackPlugin插件中预览路口为./src/widgets/ticket-list
3. 执行编译：yarn compile:widget 
* 注意：package.json中改成： "compile:widget": "everest compile --type=umd -m -o components ./src/widgets/ticket-list/index.js"
4. 把编译好的组件，即components文件夹拷贝到工程https://git.uyunsoft.cn/bizComponents/itsm/ticket-query-list/-/tree/dev下
* 注意：components文件和src文件同级
5. 执行yarn build
6. 执行npm pack
* 注意：可以生成压缩包，可以在devcenter中上传组件
7. npm publish


## 创建工单组件

1. 代码入口：src/widgets/create-ticket
2. 预览: widget:preview
* 注意：修改everest.config的PreviewWidgetWebpackPlugin插件中预览路口为./src/widgets/create-ticket
3. 执行编译：yarn compile:widget
* 注意：package.json中改成： "compile:widget": "everest compile --type=umd -m -o components ./src/widgets/create-ticket/index.js"
4. 把编译好的组件，即components文件夹拷贝到工程https://git.uyunsoft.cn/bizComponents/itsm/ticket-query-list/-/tree/create-ticket下
* 注意：components文件和src文件同级
5. 执行yarn build
6. 执行npm pack
* 注意：可以生成压缩包，可以在devcenter中上传组件
7. npm publish




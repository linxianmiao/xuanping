const path = require('path')
const fs = require('fs')

const TYPE_MODULE = 'module'
const TYPE_COMPONENT = 'component'

const TYPE_FILE = 0
const TYPE_FOLDER = 1

const basePath = './refactor'

// 获取对应类型的模块
function getTypePath (type) {
  let typePath = basePath
  switch (type) {
    case TYPE_COMPONENT:
      typePath += '/components'
      break
    case TYPE_MODULE:
      typePath += '/modules'
      break
    default: break
  }

  return typePath
}

// 获取模块下的文件和文件夹路径信息
function getModuleSubPathInfo (type, modulePath) {
  const pathInfo = [
    // {
    //   type: TYPE_FOLDER,
    //   name: 'components'
    // },
    // {
    //   type: TYPE_FOLDER,
    //   name: 'hooks'
    // },
    // {
    //   type: TYPE_FOLDER,
    //   name: 'logics'
    // },
    // {
    //   type: TYPE_FOLDER,
    //   name: 'styles'
    // },
    // {
    //   type: TYPE_FOLDER,
    //   name: 'typings'
    // },
    {
      type: TYPE_FOLDER,
      name: 'views'
    },
    {
      type: TYPE_FILE,
      name: 'constant.ts',
      data: ''
    },
    {
      type: TYPE_FILE,
      name: 'i18n.json',
      data: '[\n  ["key", "zh_CN", "en_US"]\n]'
    },
    {
      type: TYPE_FILE,
      name: 'index.ts',
      data: ''
    }
  ]

  // if (type === TYPE_MODULE) {
  //   pathInfo.push(
  //     {
  //       type: TYPE_FOLDER,
  //       name: 'stores'
  //     },
  //     {
  //       type: TYPE_FOLDER,
  //       name: 'services'
  //     }
  //   )
  // }

  return pathInfo.map(item => ({ ...item, path: path.resolve(modulePath, item.name) }))
}

// 初始化模块目录
const args = process.argv.slice(2)
const moduleType = args[0]
const moduleTypes = ['module', 'component']

if (!moduleType || !moduleTypes.includes(moduleType)) {
  throw new Error('无效的模块类型')
}

const moduleName = args[1]

if (!moduleName) {
  throw new Error('无效的模块名称')
}

// 路径
const typePath = getTypePath(moduleType)
const modulePath = path.resolve(typePath, moduleName)

try {
  // 检查文件夹是否存在
  if (fs.existsSync(modulePath)) {
    throw new Error('该文件夹已存在')
  }

  // 创建模块文件夹
  fs.mkdirSync(modulePath)

  // 创建模块下的文件夹和文件
  const moduleSubPathInfo = getModuleSubPathInfo(moduleType, modulePath)

  moduleSubPathInfo.forEach(info => {
    if (info.type === TYPE_FOLDER) {
      fs.mkdirSync(info.path)
      // 新建的空文件夹下建一个index.ts
      // fs.writeFileSync(info.path + '/index.ts', '')
    } else if (info.type === TYPE_FILE) {
      fs.writeFileSync(info.path, info.data)
    }
  })

  console.log('初始化完成')
} catch (error) {
  console.log(error)
}

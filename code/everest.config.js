const path = require('path')
const PreviewWidgetWebpackPlugin = require('@uyun/preview-widget-webpack-plugin')

let pages = {
  index: {
    entry: './src/entry/index.js',
    template: './public/index.html'
  }
}

// if (process.env.NODE_ENV === 'production') {
pages = {
  index: {
    entry: './src/entry/index.js',
    template: './public/index.html'
  },
  'process-chart': {
    entry: './src/entry/chart.js',
    template: './public/process-chart.html',
    chunks: ['vendor', 'process-chart']
  },
  service: {
    entry: './src/entry/service.js',
    template: './public/service.html'
  },
  ticket: {
    entry: './src/entry/ticket.js',
    template: './public/ticket.html'
  }
}
// }

let disabled = true
if (process.env.WIDGET) {
  pages = {}
  disabled = false
}

const config = {
  baseURL: '/itsm',
  generateSourceMap: false,
  useSwcBuildNodeModules: process.platform === 'win32' ? false : true,
  useESBuild: process.platform === 'win32' ? false : true,
  pages,
  bizOptions: {
    disabled
  },
  alias: {
    '~': './src/app', // 路径别名配置
    immutable: path.resolve(__dirname, './node_modules/immutable'),
    moment: path.resolve(__dirname, './node_modules/moment')
  },
  bizComponents: ['@uyun/biz-itsm-ticketList'],
  proxy: [
    {
      context: [
        '/themes/**',
        '/tenant/**',
        '/frontend/**',
        '/portal/**',
        '/notify/**',
        '/kb/**',
        '/cmdb/**',
        '/automation/**',
        '/monitor/**',
        '/ufs/**',
        '/uyun-base/**',
        '/itsm/fields/**',
        '/itsm/api/**',
        '/catalog/**',
        '/asset/**',
        '/itsmutil/**'
      ],
      // target: 'http://10.1.56.233/',
      // target: 'http://10.1.61.3/',
      // target: 'http://10.1.11.211/',
      // target: 'https://10.1.40.81:7508/',
      target: 'http://10.1.53.182/',
      // target: 'https://10.1.11.23/',
      // target: 'http://10.1.61.134/',
      secure: false,
      proxyTimeout: 300000,
      // 解决 [HPM] Error occurred while trying to proxy request
      headers: {
        Connection: 'keep-alive'
      },
      onProxyRes(proxyRes) {
        let cookie = proxyRes.headers['set-cookie'] || []
        cookie = cookie.map((item) =>
          item
            .split(';')
            .filter((val) => !/^\s*secure\s*$/.test(val))
            .join(';')
        )
        delete proxyRes.headers['set-cookie']
        proxyRes.headers['set-cookie'] = cookie
      },
      cookieDomainRewrite: ''
    }
  ],
  plugins: [
    {
      default: (options) =>
        new PreviewWidgetWebpackPlugin({
          ...options,
          entry: './src/widgets/myticketlist', // 要调试的部件入口  // modellist 没有数据
          rootId: 'main' // 要挂载的root结点，默认为 root
        }),
      type: 'webpack'
    }
  ],
  splitChunks: {
    chunks: 'async',
    maxInitialRequests: 5,
    minSize: 20000,
    minChunks: 2
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'source-map'
    }
    if (!process.env.WIDGET) {
      config.externals = { jquery: 'jQuery' }
    }
    return config
  }
}

module.exports = config

import Mock from 'mockjs'
import { mock as MockAdapter } from '@uyun/utils'
import request from '../request'
const mock = new MockAdapter(request)

mock
  .onGet('/getInfo')
  .reply(
    200,
    Mock.mock({
      'new|0-10': 1,
      'pending|0-10': 1,
      'overdue|0-10': 1,
      'resolution|0-100': 1,
      title: 'mock 数据测试'
    })
  )

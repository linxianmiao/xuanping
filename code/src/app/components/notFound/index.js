import React, { Component } from 'react'
import { Exception, Button } from '@uyun/components'

export default class NotFound extends Component {
  render () {
    const { type = '404' } = this.props
    const obj = {
      404: {
        title: '404',
        description: i18n('glabal-ajaxType-404', '抱歉，您要找的页面失踪了！'),
        actions: <Button href="/tenant">返回租户</Button>
      },
      401: {
        title: '401',
        description: i18n('glabal-ajaxType-401', '抱歉，您暂无权限'),
        actions: <Button href="/tenant">返回租户</Button>
      }
    }
    return <Exception {...obj[type]} />
  }
}

import React, { Component } from 'react'
import { Drawer } from '@uyun/components'
import Iframe from './Iframe'
import { getUrl } from './logic'

export default class Detail extends Component {
  static defaultProps = {
    iframeType: '',
    id: '',
    onClose: () => {}
  }

  // 侧滑支持的iframe动作类型
  iframeTypeList = ['plan-detail', 'plan-job', 'timer-detail', 'timer-job']

  getTitle = (iframeType) => {
    switch (iframeType) {
      case 'plan-detail':
        return '执行计划详情'
      case 'plan-job':
        return '执行计划作业详情'
      case 'timer-detail':
        return '定时作业详情'
      case 'timer-job':
        return '定时作业详情'
      default:
        return ''
    }
  }

  render() {
    const { id, iframeType, onClose } = this.props

    return (
      <Drawer
        visible={this.iframeTypeList.includes(iframeType)}
        title={this.getTitle(iframeType)}
        destroyOnClose
        onClose={onClose}
        className="job-detail-drawer"
      >
        <Iframe id={id} url={getUrl(iframeType, { id })} />
      </Drawer>
    )
  }
}

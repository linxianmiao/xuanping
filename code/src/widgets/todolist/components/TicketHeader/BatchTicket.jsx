import React from 'react'
import { Drawer, Spin } from '@uyun/components'
import { inject } from '@uyun/core'
import styles from './index.module.less'

export default class BatchTicket extends React.Component {
  @inject('i18n') i18n
  state = {
    visible: false,
    loading: false,
    isLoad: false
  }

  onOpen = (e) => {
    e.preventDefault()
    const { isLoad } = this.state
    this.setState({ visible: true, loading: !isLoad })
  }

  onClose = () => {
    this.setState({ visible: false })
  }

  render() {
    const { visible, loading } = this.state
    const src = '/itsm/#/ticket/batchTicket/batchMyTodo?ticketSource=portal&hideHeader=1'
    return (
      <>
        {/* <a onClick={this.onOpen} className={styles.batchText}>{this.i18n('batch-settle', '批量处理')} <Icon type="double-right" /></a> */}
        <Drawer
          title={this.i18n('batch-settle', '批量处理')}
          bodyStyle={{ overflow: 'hidden' }}
          visible={visible}
          onClose={this.onClose}
          className={styles.drawerIframe}
        >
          <Spin spinning={loading}>
            <iframe
              src={src}
              id="iframeId"
              width="100%"
              height="100%"
              allowFullScreen="allowfullscreen"
              scrolling="yes"
              frameBorder={0}
              onLoad={() => {
                this.setState({ loading: false, isLoad: true })
              }}
            />
          </Spin>
        </Drawer>
      </>
    )
  }
}

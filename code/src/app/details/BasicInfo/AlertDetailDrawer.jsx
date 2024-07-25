import React from 'react'
import { Drawer } from '@uyun/components'

const AlertDetailDrawer = props => {
  const { visible, url, onClose } = props

  return (
    <Drawer
      className="alert-detail-drawer"
      visible={visible}
      title={i18n('alert.detail', '告警详情')}
      onClose={onClose}
    >
      <iframe src={url} width="100%" height="100%" style={{ border: 0 }} />
    </Drawer>
  )
}

export default AlertDetailDrawer

import React from 'react'
import RcDrawer from 'rc-drawer'
import { CloseOutlined } from '@uyun/icons';
import { Icon } from '@uyun/components'

import 'rc-drawer/assets/index.css'
import './index.less'

const Drawer = props => {
  const { children, visible, title, closeIcon, maskClosable, className, ...rest } = props

  const handleMaskClick = () => {
    if (maskClosable) {
      props.onClose()
    }
  }

  return (
    <RcDrawer
      {...rest}
      open={visible}
      style={{ zIndex: 1000 }}
      className={className}
      onMaskClick={handleMaskClick}
    >
      {
        closeIcon && (
          <button className="drawer-close" onClick={props.onClose}>
            <CloseOutlined />
          </button>
        )
      }
      {
        !!title && (
          <div className="drawer-header">
            <div className="drawer-title">{title}</div>
          </div>
        )
      }
      <div className="drawer-body" style={title ? {} : { height: '100%' }}>{children}</div>
    </RcDrawer>
  );
}

Drawer.defaultProps = {
  visible: false,
  width: 480,
  title: null,
  closeIcon: true, // 右上角的关闭按钮是否显示
  maskClosable: true,
  className: '',
  onClose: () => {},

  handler: false, // Drawer的小控件
  level: null // 设为null时，页面内容不会随着侧滑框移动。Drawer中默认为'all'
}

export default Drawer

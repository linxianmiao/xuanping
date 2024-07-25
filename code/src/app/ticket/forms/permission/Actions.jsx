import React from 'react'
import { Button, Dropdown, Menu, Icon } from '@uyun/components'

import styles from './index.module.less'

const Actions = (props) => {
  const { serviceCodes, serviceRange, onClick, isRequired } = props

  const renderButton = (code) => {
    const btnProps = {
      key: code,
      onClick: () => onClick(code)
    }

    switch (code) {
      case '0':
        return (
          <Button {...btnProps} disabled={isRequired === 2}>
            {'加入用户组'}
          </Button>
        )
      case '1':
        return (
          <Button {...btnProps} disabled={isRequired === 2}>
            {'退出用户组'}
          </Button>
        )
      case '2':
        return (
          <Button {...btnProps} disabled={isRequired === 2}>
            {'新建用户组'}
          </Button>
        )
      // case '2':
      //   const menu = (
      //     <Menu onClick={({ key }) => onClick(code, key)}>
      //       {
      //         serviceRange.map(item => <Menu.Item key={item.appId}>{item.enName + ' - ' + item.appName}</Menu.Item>)
      //       }
      //     </Menu>
      //   )
      //   return (
      //     <Dropdown key={code} trigger={['click']} overlay={menu}>
      //       <Button key={code} type="primary">
      //         {'新建用户组'} <Icon type="down" />
      //       </Button>
      //     </Dropdown>
      //   )
      case '3':
        return (
          <Button {...btnProps} disabled={isRequired === 2}>
            {'编辑用户组'}
          </Button>
        )
      default:
        return null
    }
  }

  return <div className={styles.btns}>{serviceCodes.sort((a, b) => a - b).map(renderButton)}</div>
}

Actions.defaultProps = {
  serviceCodes: [],
  serviceRange: [],
  onClick: () => {}
}

export default Actions

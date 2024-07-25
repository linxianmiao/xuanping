import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { push } from '@uyun/runtime-react'
import { inject, observer } from 'mobx-react'
import NotFound from '../notFound'
import getPermissions from '../common/getPermissions'
@inject('globalStore')
@observer
export default class PermissionRoute extends Component {
  render() {
    let { menuCode, globalStore, ...rest } = this.props
    const { productPermissions, routePermissions, defaultHome, ticketMenuList, configAuthor } = globalStore
    const permissionlist = getPermissions(productPermissions)
    const routePermissionList = Object.keys(routePermissions).filter(key => Boolean(routePermissions[key]))

    if (_.isEmpty(productPermissions)) {
      push('/tenant')
      // window.UYUN_CORE.location.href = '/tenant/'
    }

    if (menuCode === 'customize') {
      const pathnameList = this.props.location.pathname.split('/')
      const len = pathnameList.length
      menuCode = pathnameList[len - 1]
    }

    let isPer = menuCode ? _.some(_.concat(permissionlist, routePermissionList), item => item === menuCode) : true

    if (menuCode === 'remoteConfig') {
      isPer = configAuthor.remoteTicketConfigMenu
    }

    if (!isPer) {
      localStorage.setItem('notfondjson', JSON.stringify({ productPermissions, defaultHome, ticketMenuList }))
    }

    return isPer ? <Route {...rest} /> : <NotFound type="401" />
  }
}
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Breadcrumb, Button } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import getUrl from '~/utils/getUrl'
import list from './list'
import './index.less'
function urlToList(url) {
  const [path, ...rest] = url.split('/').filter((i) => i !== '')
  if (path === 'authority') {
    return [path, ...rest]
  }
  return rest
}

function getBreadcrumb(pathSnippets, ticketMenuList) {
  return _.reduce(
    pathSnippets,
    (breadcrumbList, item) => {
      let breadcrumbItem = _.find(list(i18n), (readcrumb) => item === readcrumb.value)
      if (!breadcrumbItem) {
        const QUERYER = _.find(ticketMenuList, (menu) => menu.code === item)
        if (QUERYER) {
          breadcrumbItem = {
            value: QUERYER.code,
            path: `/ticket/${QUERYER.code}`,
            name: window.language === 'en_US' ? QUERYER.enName : QUERYER.zhName
          }
        }
      }

      return breadcrumbItem ? [...breadcrumbList, breadcrumbItem] : breadcrumbList
    },
    []
  )
}

@inject('globalStore')
@observer
class PageHeader extends Component {
  getBreadcrumbs = () => {
    const { menuList, ticketRecord } = this.props.globalStore
    const { ticketMenuList } = menuList
    const { location, customizeBreadcrumb, isNewTab } = this.props
    let breadcrumbList = []
    if (customizeBreadcrumb) {
      breadcrumbList = customizeBreadcrumb
    } else {
      const pathSnippets = urlToList(location.pathname)
      breadcrumbList = getBreadcrumb(pathSnippets, ticketMenuList)
      // 工单详情用来显示来源的
      if (breadcrumbList.length && breadcrumbList[0].value === 'detail') {
        let path = '/ticket/all'
        let name = i18n('layout.All_Tickets', '所有工单')
        if (this.props.location.state) {
          const { fromHase, fromName } = this.props.location.state
          path = fromHase
          name = fromName
        }
        breadcrumbList = [
          { path, name },
          { ...breadcrumbList, name: ticketRecord.title }
        ]
      }
      // 从面包屑审批记录进来的数据默认回到模型审核页面
      if (breadcrumbList.length === 2 && breadcrumbList[1].value === 'approval') {
        breadcrumbList[0].state = true
      }
    }

    const last = breadcrumbList.length - 1

    let isOpen = window.location.pathname.indexOf('/ticket.html')
    if (isNewTab && Array.isArray(breadcrumbList) && breadcrumbList.length > 0) {
      return (
        <Breadcrumb style={{ paddingLeft: 0 }}>
          <Breadcrumb.Item>{breadcrumbList[breadcrumbList.length - 1].name}</Breadcrumb.Item>
        </Breadcrumb>
      )
    }
    return (
      <Breadcrumb style={{ paddingLeft: 0 }}>
        {_.map(breadcrumbList, (breadcrumb, index) => {
          return index === last ? (
            <Breadcrumb.Item key={index}>{breadcrumb.name}</Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={index}>
              {breadcrumb.path ? (
                isOpen == -1 ? (
                  <Link
                    to={{
                      pathname: breadcrumb.path,
                      state: breadcrumb.state
                    }}
                  >
                    {breadcrumb.name}
                  </Link>
                ) : (
                  breadcrumb.name
                )
              ) : (
                breadcrumb.name
              )}
            </Breadcrumb.Item>
          )
        })}
      </Breadcrumb>
    )
  }

  render() {
    const ticketSource = getUrl('ticketSource')
    const urlSearch = new URLSearchParams(this.props.location?.search || '')
    if (urlSearch.get('isPostMessage')) {
      return null
    }
    // const hideHeader = getUrl('hideHeader')
    // 是否是itsm内部的创建工单
    const isItsmCreate = this.props.location.pathname.indexOf('ticket/createTicket') !== -1
    // if (this.props?.source === 'datatable') {
    //   console.log('111')
    //   window.LOWCODE_APP_KEY = this.props?.appkey
    // }
    return ticketSource ? null : (
      <div>
        {this.getBreadcrumbs()}
        {isItsmCreate && (
          <Button
            style={{ position: 'absolute', top: 6, right: 0, height: 28 }}
            onClick={() => this.props.history.goBack()}
          >
            {i18n('globe.back', '返回')}
          </Button>
        )}
      </div>
    )
  }
}

export default withRouter(PageHeader)

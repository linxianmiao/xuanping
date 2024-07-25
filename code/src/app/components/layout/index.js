import React, { Component, Suspense } from 'react'
import { Provider } from 'mobx-react'
import { Layout, BackTop } from '@uyun/components'
import BasicLayout from '@uyun/layout'
import { getPerUrl } from '../common/getPerUrl'
import { withRouter } from 'react-router-dom'
import stores from '../../stores'
import getUrl from '~/utils/getUrl'
import Side from './side'
// import styles from './index.module.less'
import './index.less'

if (process.env.NODE_ENV !== 'production') {
  window.store = stores
}
const { Content } = Layout

@withRouter
class LayoutWarp extends Component {
  state = {
    loading: true
  }
  async componentDidMount() {
    stores.loadFieldWidgetStore.getCustomFieldInfos()
    stores.globalStore.isHavePrivilege() // 查询产品权限
    stores.globalStore.checkUserPermission()

    // 如果侧边栏菜单被隐藏，部分接口需要从side放到这里来调用
    if (getUrl('hideHeader') || getUrl('hideMenu')) {
      stores.globalStore.getSwitch()
      stores.globalStore.checkShowStatusButton()
      stores.globalStore.getFilterNamesByRegular()
      stores.globalStore.checkConfigAuthor()
      stores.globalStore.checkListOperation()
      stores.globalStore.getTicketUrgingTime()
    }
    // 获取修改表单的route权限
    if (window.location.href.indexOf('/ticketChange') > -1) {
      const ticketId = getUrl('ticketId')
      const tacheId = getUrl('tacheId')
      await stores.globalStore.checkUserChangeAuth({ ticketId, tacheId })
    }
    await Promise.all([
      stores.globalStore.queryProductPermissions(),
      stores.globalStore.isShowBatchHandle()
    ]).then((res) => {
      const defaultHome = getPerUrl(res[0])

      if (this.props.location.pathname === '/' && defaultHome !== '/') {
        this.props.history.replace(defaultHome)
      }
      this.setState({
        loading: false
      })
    })
  }

  render() {
    const ticketSource = getUrl('ticketSource')
    const hideHeader = getUrl('hideHeader')
    const hideHead = getUrl('hideHead')
    const hideMenu = getUrl('hideMenu')

    const hide = []

    if (hideHeader) {
      hide.push('header', 'sideMenu')
    } else {
      if (hideHead) {
        hide.push('header')
      }
      if (hideMenu) {
        hide.push('sideMenu')
      }
    }
    const iframeNameList = ['Modellistapp', 'apptriggermanage']
    if (this.state.loading) {
      return null
    }

    const componentIframe = window.location.href.includes('appkey=')
    const isBackGround =
      window.location.href.includes('/modellist') ||
      window.location.href.includes('/triggerlist') ||
      window.location.href.includes('/datatable')
    return (
      <Provider {...stores}>
        <BasicLayout
          productName="itsm"
          sideMenu={(props) => <Side menuProps={props} />}
          hide={hide}
        >
          <Layout
            id="itsm-wrap"
            className={
              componentIframe
                ? 'wrapper component-iframe-wrap'
                : ticketSource === 'portal'
                ? 'wrapper portal-wrap'
                : 'itsm-wrapper wrapper'
            }
          >
            <Content className="content">
              <div
                className={
                  iframeNameList.includes(window.name)
                    ? 'content-wrap content-wrap-modellist'
                    : isBackGround
                    ? 'content-wrap content-wrap-background'
                    : 'content-wrap'
                }
              >
                {this.props.children}
              </div>
              <BackTop target={() => document.getElementById('itsm-wrap')} />
            </Content>
          </Layout>
        </BasicLayout>
      </Provider>
    )
  }
}
export default LayoutWarp

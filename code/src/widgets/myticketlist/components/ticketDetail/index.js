import '@uyun/runtime'
import '~/common/common'
import '~/common/staticVariable'
import { Provider } from 'mobx-react'
import React, { PureComponent } from 'react'
import { MemoryRouter, Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import stores from '~/stores'
import './index.less'
import Details from '~/details'
import CreateTicket from '~/create-ticket'
import TicketChange from '~/ticketChange'

if (process.env.NODE_ENV !== 'production') {
  window.store = stores
}

const memoryHistory = createMemoryHistory()

class LayoutWarp extends PureComponent {
  state = {
    loading: true
  }

  changeRoute() {
    const { source } = this.props
    const {
      ticketId,
      id,
      appInfoVo,
      activityRefresh,
      caseId,
      activityId,
      modelId,
      tacheNo,
      tacheType
    } = this.props.info
    let url = ''
    if (source === 'mydrafts') {
      url = `/ticket/drafts/${id}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1&isPostMessage=1`
    } else {
      url = `/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1&isPostMessage=1`
      if (activityRefresh) {
        url = `/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&caseId=${caseId}&tacheId=${activityId}&modelId=${modelId}&tacheNo=${tacheNo}&tacheType=${tacheType}&isPostMessage=1`
      }
    }
    if (appInfoVo?.appkey) {
      url += `&appkey=${appInfoVo?.appkey}`
    }
    memoryHistory.push(url)
  }

  async componentDidMount() {
    stores.loadFieldWidgetStore.getCustomFieldInfos()
    stores.globalStore.isHavePrivilege() // 查询产品权限
    stores.globalStore.checkUserPermission()

    stores.globalStore.getSwitch()
    stores.globalStore.checkShowStatusButton()
    stores.globalStore.getFilterNamesByRegular()
    stores.globalStore.checkConfigAuthor()
    stores.globalStore.checkListOperation()
    stores.globalStore.getTicketUrgingTime()
    await Promise.all([
      stores.globalStore.queryProductPermissions(),
      stores.globalStore.isShowBatchHandle()
    ]).then((res) => {
      this.setState({
        loading: false
      })
      this.changeRoute()
    })
  }

  componentDidUpdate(prev) {
    if (prev.info.ticketId !== this.props.info.ticketId && this.props.info.ticketId) {
      this.changeRoute()
    }
    if (prev.info.id !== this.props.info.id && this.props.info.id) {
      this.changeRoute()
    }
    if (
      prev.info.activityRefresh !== this.props.info.activityRefresh &&
      this.props.info.activityRefresh
    ) {
      this.changeRoute()
    }
  }

  render() {
    const { info, source } = this.props
    if (
      this.state.loading ||
      (!info?.ticketId && source === 'detail') ||
      (!info?.id && source === 'mydrafts')
    ) {
      return null
    }
    if (!source) {
      return null
    }

    return (
      <Provider {...stores}>
        <MemoryRouter>
          <Router history={memoryHistory}>
            <div className="wrapper portal-wrap u4-layout" id="itsm-wrap">
              <div className="content-wrap content-wrap-background">
                <Route
                  exact
                  path="/ticketDetail/:id/"
                  component={(props) => <Details {...props} />}
                />
                <Route
                  exact
                  path="/ticket/detail/:id/"
                  component={(props) => <Details {...props} />}
                />
                <Route
                  exact
                  path="/ticket/drafts/:id"
                  component={(props) => <CreateTicket {...props} />}
                />
                <Route
                  exact
                  path="/ticketChange"
                  component={(props) => <TicketChange {...props} />}
                />
              </div>
            </div>
          </Router>
        </MemoryRouter>
      </Provider>
    )
  }
}
export default LayoutWarp

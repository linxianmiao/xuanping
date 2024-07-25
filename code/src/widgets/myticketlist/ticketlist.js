import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { ArrowLeftOutlined, ArrowRightOutlined, SyncOutlined } from '@uyun/icons'
import { Drawer, Tabs, Tooltip } from '@uyun/components'
import { TicketlistStore } from './ticketlist.store'
import styles from './ticketlist.module.less'
import axios from 'axios'
import TicketTable from './components/ticketTable'
import MyAttention from './components/ticketTable/myAttention'
import TicketHeader from './components/ticketHeader'
import './index.less'
import _ from 'lodash'
import cl from 'classnames'
import { FullscreenOutlined, FullscreenExitOutlined } from '@uyun/icons'
import CustomIcon from './components/iconfont'
import TicketDetail from './components/ticketDetail'

const TabPane = Tabs.TabPane
@observer
class Ticketlist extends Component {
  @inject(TicketlistStore) store
  @inject('widget') widget

  constructor(props, context) {
    super(props, context)
    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    }
    this.state = {
      url: '',
      title: '',
      timer: 30,
      activeKey: 'mytodo',
      tabs: ['mytodo', 'mypartin', 'mycreate', 'myfollow', 'myapprove', 'mydrafts', 'all'],
      arrow: 'left',
      selectedRowKeys: [],
      counts: {
        mypartinCount: 0,
        mycreateCount: 0,
        myapproveCount: 0
      },
      myAttentionList: [],
      selectedRow: [],
      USER_INFO: {},
      currentRecord: {},
      detailSource: '',
      portalOpenType: 'iframe'
    }
  }

  tabRef = React.createRef()

  async componentDidMount() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    this.div = div
    await this.store.getUserSupDept()
    // 初始进来时高级经理展示我的审批
    axios
      .get(`/tenant/api/v1/user/details/view`)
      .then((res) => {
        this.setState({ USER_INFO: res?.data?.data })
        if (res?.data?.data?.userId) {
          axios
            .get(`/tenant/api/v2/users/details?user_id=${res?.data?.data?.userId} `)
            .then((list) => {
              if (list?.data?.data.position === '高级经理') {
                this.setState({ activeKey: 'myapprove' }, () => {
                  this.store.setValue({ ...this.store.query, filterType: 'myapprove' }, 'query')
                  this.store.changeColumns()
                })
              }
            })
            .catch((e) => {
              console.log(e)
            })
        }
      })
      .catch((error) => {
        console.log(error)
      })
    this.store.getTicketPriority()
    this.store.changeColumns()
    this.getTabCounts()
    const { activeKey } = this.state
    if (activeKey !== 'myfollow' && activeKey !== 'all') this.getList()
    axios.get(`/itsm/api/v2/config/change/getSwitch`).then(({ data }) => {
      this.setState({ portalOpenType: data?.data?.portalOpenType || 'iframe' })
    })
  }

  componentWillUnmount() {
    if (this.div) {
      document.body.removeChild(this.div)
    }
  }

  //获取tab数据
  getTabCounts = () => {
    this.store.getTabCount()
    axios
      .get(
        `/itsm/api/v2/ticket/getTicketListwithAllApps?filterType=myPartIn&pageNum=1&pageSize=1&sortRule=descend`
      )
      .then((res) => {
        //我的已办
        this.setState({
          counts: _.assign({}, this.state.counts, { mypartinCount: res?.data?.data?.count || 0 })
        })
      })
    let data = {
      extParams: {},
      filterType: 'myCreate',
      sortRule: 'descend',
      pageNum: 1,
      pageSize: 1,
      creator: ['currentUser']
    } //我的发起
    axios.post(`/itsm/api/v2/ticket/getAllTicket/countWithAllApps`, data).then((res) => {
      this.setState({
        counts: _.assign({}, this.state.counts, { mycreateCount: res?.data?.data || 0 })
      })
    })
    // let allData = {
    //   extParams: {},
    //   filterType: 'all',
    //   sortRule: 'descend',
    //   pageNum: 1,
    //   pageSize: 1,
    //   filterMyDepart: this.store.currentDept
    // } //所有工单
    // axios.post(`/itsm/api/v2/ticket/getAllTicket/countWithAllApps`, allData).then((res) => {
    //   this.setState({
    //     counts: _.assign({}, this.state.counts, { allCount: res?.data?.data || 0 })
    //   })
    // })
    axios
      .get(
        `/itsm/api/v2/ticket/getTicketListwithAllApps?filterType=myapprove&pageNum=1&pageSize=1&sortRule=descend`
      )
      .then((res) => {
        this.setState({
          // 我的审批
          counts: _.assign({}, this.state.counts, { myapproveCount: res?.data?.data?.count || 0 })
        })
      })
    axios
      .get(
        `/itsm/api/v2/ticket/getTicketListWithAllApps?filterType=myFollow&pageNum=1&pageSize=9999&sortRule=descend`
      )
      .then((res) => {
        this.setState({
          // 获取所有已关注的数据
          myAttentionList: res?.data?.data?.list || []
        })
      })
  }

  getList = () => {
    this.store.getTicketList()
  }
  reload = () => {
    const { query } = this.store
    this.store.setValue(
      {
        ...query,
        pageNum: 1
      },
      'query'
    )
  }

  handleDetailTicket = (data, type) => {
    const { ticketName, ticketId, appInfoVo, id } = data

    let src = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1`
    if (type === 'mydrafts') {
      src = `/itsm/#/ticket/drafts/${id}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1`
    }

    if (appInfoVo?.appkey) {
      src += `&appkey=${appInfoVo?.appkey}`
    }

    this.setState({
      title: ticketName,
      url: src,
      currentRecord: data,
      detailSource: type
    })
    // 注释原因：用this.windowWin监听无效
    // const w = this.windowWin || window
    window.addEventListener('message', this.handleChangeMessage)
  }

  handleChangeMessage = (res) => {
    if (res.data.createTicket === 'success') {
      const { nextTacheData } = res.data
      if (nextTacheData?.canContinueApprove) {
        const { ticketId, caseId, activityId, title } = nextTacheData
        const { currentRecord } = this.state
        const { modelId, tacheNo, tacheType } = currentRecord
        const iframeSrc = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&caseId=${caseId}&tacheId=${activityId}&modelId=${modelId}&tacheNo=${tacheNo}&tacheType=${tacheType}`

        this.setState(
          {
            currentRecord: {
              ...currentRecord,
              ticketId,
              caseId,
              activityId,
              title,
              activityRefresh: Date.now() // 侧滑不关闭，自动刷新组件
            },
            url: iframeSrc,
            title
          },
          () => {
            if (this.state.portalOpenType === 'iframe') {
              const iframe = document.getElementById('iframeIdMyticketlist') || {}
              iframe.src = iframeSrc
              iframe.contentWindow.location.reload(true)
            }
          }
        )
      } else {
        this.onClose()
      }
    }
  }

  handleChangeTimer = (timer) => {
    this.setState({ timer })
  }
  destroyIframe = () => {
    const iframe = document.getElementById('iframeIdMyticketlist')
    try {
      iframe.src = 'about:blank'
      iframe.contentWindow.document.write('')
      iframe.contentWindow.document.clear()
    } catch (e) {}
  }
  onClose = () => {
    window.removeEventListener('message', this.handleChangeMessage)
    this.setState({ url: '', arrow: 'left', currentRecord: {}, detailSource: '' })
    this.getList()
    this.getTabCounts()
  }

  handleChangeActiveKey = (activeKey) => {
    this.store.setValue([], 'ticketList')
    this.store.setValue([], 'count')

    this.setState({ activeKey }, () => {
      this.tabRef && this.tabRef.current?.clearSearchInfo()
      this.tabRef && this.tabRef.current?.handleChange(activeKey, 'filterType')
      this.store.changeColumns()
      this.getTabCounts()
    })
  }

  _renderTabPaneTitle = (tab) => {
    switch (tab) {
      case 'mytodo':
        return `我的待办`
      case 'mypartin':
        return '我的已办'
      case 'mycreate':
        return '我的发起'
      case 'myfollow':
        return `我的关注`
      case 'myapprove':
        return '我的审批'
      case 'mydrafts':
        return '我的草稿'
      case 'all':
        return '所有工单'
      default:
        break
    }
  }

  _renderTabPaneNum = (tab) => {
    const { tabCounts = {} } = this.store
    const { counts } = this.state
    switch (tab) {
      case 'mytodo':
        return tabCounts?.todoCount || 0
      case 'mypartin':
        return counts?.mypartinCount || 0
      case 'mycreate':
        return counts?.mycreateCount || 0
      case 'myfollow':
        return tabCounts?.myfollowCount || 0
      case 'myapprove':
        return counts?.myapproveCount || 0
      case 'all':
        return null
      case 'mydrafts':
        return tabCounts?.mydraftCount || 0
      default:
        return 0
    }
  }

  handleClick = () => {
    const { arrow } = this.state
    this.setState({ arrow: arrow === 'right' ? 'left' : 'right' })
  }

  handleSelectedRow = (selectedRowKeys, selectedRow = []) => {
    this.setState({
      selectedRowKeys,
      selectedRow
    })
  }
  toggleFullscreen = () => {
    this.setState({
      isFullScreen: !this.state.isFullScreen
    })
  }

  render() {
    const {
      isFullScreen,
      title,
      url,
      timer,
      activeKey,
      tabs,
      arrow,
      selectedRowKeys,
      myAttentionList,
      selectedRow,
      USER_INFO,
      currentRecord,
      detailSource,
      portalOpenType
    } = this.state
    const content = (
      <React.Fragment>
        <div
          className={cl(styles.itsmTicketlist, {
            [styles.fullscreen]: isFullScreen
          })}
          id="itsm-ticket-list"
        >
          <div className={styles.fullscreenIcon}>
            <Tooltip title="刷新">
              <SyncOutlined onClick={this.reload} style={{ marginRight: 12 }} />
            </Tooltip>

            {isFullScreen ? (
              <Tooltip title="退出全屏">
                <FullscreenExitOutlined onClick={this.toggleFullscreen} />
              </Tooltip>
            ) : (
              <Tooltip title="全屏">
                <FullscreenOutlined onClick={this.toggleFullscreen} />
              </Tooltip>
            )}
          </div>
          <Tabs
            destroyInactiveTabPane
            onChange={this.handleChangeActiveKey}
            activeKey={activeKey}
            type="card"
          >
            {_.map(tabs, (tab) => {
              return (
                <TabPane
                  tab={
                    <div className={styles.tabTitle}>
                      <div className={activeKey === tab ? styles.tabDivider : ''}></div>
                      <div className={styles.tabInfo}>
                        {<CustomIcon className={styles.iconfont} type={tab} />}
                        <div className={styles.tabTitleSpan}>
                          {this._renderTabPaneTitle(tab)}
                          <span>{this._renderTabPaneNum(tab)}</span>
                        </div>
                      </div>
                    </div>
                  }
                  key={tab}
                >
                  {tab === 'myfollow' ? (
                    <MyAttention
                      selectedRowKeys={selectedRowKeys}
                      onSelectedRow={this.handleSelectedRow}
                      timer={timer}
                      handleChangeTimer={this.handleChangeTimer}
                      handleDetailTicket={this.handleDetailTicket}
                      activeKey={activeKey}
                      getList={this.getList}
                      myAttentionList={myAttentionList}
                      getTabCounts={this.getTabCounts}
                      USER_INFO={USER_INFO}
                    />
                  ) : (
                    <>
                      <TicketHeader
                        selectedRowKeys={selectedRowKeys}
                        selectedRow={selectedRow}
                        onSelectedRow={this.handleSelectedRow}
                        timer={timer}
                        handleChangeTimer={this.handleChangeTimer}
                        handleDetailTicket={this.handleDetailTicket}
                        ref={this.tabRef}
                        getTabCounts={this.getTabCounts}
                      />
                      <TicketTable
                        selectedRowKeys={selectedRowKeys}
                        onSelectedRow={this.handleSelectedRow}
                        handleDetailTicket={this.handleDetailTicket}
                        activeKey={activeKey}
                        myAttentionList={myAttentionList}
                        getList={this.getList}
                      />
                    </>
                  )}
                </TabPane>
              )
            })}
          </Tabs>
        </div>
        <Drawer
          title={
            <div>
              <span style={{ marginRight: '15px', cursor: 'pointer' }} onClick={this.handleClick}>
                {arrow === 'right' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
              </span>
              {title}
            </div>
          }
          bodyStyle={{ overflow: 'hidden', padding: 0 }}
          visible={Boolean(url)}
          onClose={this.onClose}
          className="ticket-wrapdrawer"
          width={arrow === 'left' ? '80%' : '100%'}
          outerClose={false}
          // destroyOnClose
          mask={true}
          maskClosable={false}
        >
          {portalOpenType === 'iframe' && Boolean(url) ? (
            <iframe
              src={url}
              id="iframeIdMyticketlist"
              width="100%"
              height="100%"
              allowFullScreen="allowfullscreen"
              scrolling="yes"
              frameBorder={0}
            />
          ) : (
            <TicketDetail info={currentRecord} source={detailSource} />
          )}
        </Drawer>
      </React.Fragment>
    )

    if (isFullScreen) {
      return ReactDOM.createPortal(content, this.div)
    }
    return content
  }
}

export { Ticketlist }

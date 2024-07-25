import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Tabs, Drawer } from '@uyun/components'
import TicketList from '../../app/list'

function getTicketQueryKey(menuKey) {
  switch (menuKey) {
    case 'myfollow':
      return 'myFollow'
    case 'mypartin':
      return 'myPartIn'
    case 'groupTodo':
      return 'groupTodo'
    case 'myTodo':
    case 'mytodo':
      return 'myToDo'
    case 'entrustTodo':
      return 'entrust'
    case 'mycreate':
      return 'mycreate'
    case 'all_ticket':
      return 'all'
    default:
      return menuKey
  }
}

function getFilterTypeList(res, filterType) {
  let filterTypeList = []
  const data = Array.isArray(res) ? res : []
  if (Array.isArray(filterType) && filterType.length) {
    filterTypeList = filterType
      .map((item) => {
        const current = data.find((d) => d.code === item)
        if (current) {
          current.code = getTicketQueryKey(current.code)
          return current
        }
        return null
      })
      .filter((item) => !!item)
  } else {
    filterTypeList = data.map((item) => {
      item.code = getTicketQueryKey(item.code)
      return item
    })
  }
  return filterTypeList
}

function setIframeStyle() {
  const iframe = document.querySelector('#itsm-ticket-query-list')
  iframe.addEventListener('load', function () {
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow
      const targetBody = iframeWindow.document.querySelector('body')
      const targetItsmWrap = iframeWindow.document.querySelector('#itsm-wrap')
      const targetContentWrap = iframeWindow.document.querySelector('.content-wrap')
      targetItsmWrap.style.background = 'transparent'
      targetItsmWrap.style.overflow = 'auto'
      targetContentWrap.style.left = 0
      targetContentWrap.style.right = 0
      targetBody.classList.add('transparent')
    }, 500)
  })
}

@inject('globalStore')
@observer
class TabList extends Component {
  static defaultProps = {
    filterType: []
  }
  state = {
    type: '',
    filterTypeList: [],
    visible: false,
    refresh: 1,
    showType: 'tab',
    iframeSrc: ''
  }

  itsmPostMessage = (res) => {
    if (res && res.data && res.data.createTicket === 'success') {
      if (this.state.showType === 'detail') {
        this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.setState({ refresh: this.state.refresh + 1, showType: 'tab', iframeSrc: '' })
        }, 400)
      } else if (this.state.showType === 'create') {
        this.setState({ showType: 'tab', iframeSrc: '', refresh: this.state.refresh + 1 })
      } else {
        if (this.refDrawer) {
          this.timer && clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.refDrawer.close()
            this.setState({ refresh: this.state.refresh + 1 })
          }, 400)
        }
      }
    }
  }

  componentDidMount() {
    const { filterType } = this.props
    window.LOWCODE_APP_KEY = this.props.appKey || this.props.appkey
    this.props.globalStore.getMenuList().then((data) => {
      this.props.globalStore.setTicketListOperation({ exportBtn: true })
      const filterTypeList = getFilterTypeList(data, filterType)
      this.setState({
        filterTypeList,
        type: filterTypeList.length ? filterTypeList[0].code : ''
      })
    })
    window.addEventListener('message', (res) => this.itsmPostMessage(res))
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ showType: 'tab' })
    }
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
    window.removeEventListener('message', (res) => this.itsmPostMessage(res))
  }
  handleTicketDetail = (src, ticketName, type) => {
    const appkey = this.props.appKey || this.props.appkey
    src = appkey
      ? `${src}&appkey=${appkey}&hideHeader=1&ticketSource=portal`
      : `${src}&hideHeader=1&ticketSource=portal`

    if (type === 'newTab') {
      window.open(src, '_blank')
      return false
    }

    if (this.props.openDetailMode === 'currentPage') {
      this.setState({ showType: 'detail', iframeSrc: src }, () => {
        setIframeStyle()
      })
    } else if (this.props.openDetailMode === 'drawer') {
      this.refDrawer = Drawer.open({
        title: ticketName,
        className: 'detail-drawer',
        content: (
          <iframe
            style={{ minHeight: 'inherit' }}
            src={src}
            id="itsm-ticket-query-list"
            width="100%"
            height="100%"
            allowFullScreen="allowfullscreen"
            scrolling="yes"
            frameBorder={0}
          />
        )
      })
      setIframeStyle()
    } else {
      window.open(src, '_blank')
    }
  }
  handleCreateTicket = ({ key }) => {
    const appkey = this.props.appKey || this.props.appkey
    const src = appkey
      ? `/itsm/#/create/${key}/ddd?ticketSource=portal&hideHeader=1&appkey=${appkey}`
      : `/itsm/#/create/${key}/ddd?ticketSource=portal&hideHeader=1`
    this.setState({ showType: 'create', iframeSrc: src }, () => {
      setIframeStyle()
    })
  }
  render() {
    const { type, filterTypeList, iframeSrc, refresh, showType } = this.state
    const { createTicket, processCodes } = this.props
    const appkey = this.props.appKey || this.props.appkey
    return (
      <div style={{ minHeight: 'inherit' }}>
        {showType === 'tab' ? (
          <>
            {filterTypeList.length > 1 ? (
              <Tabs
                activeKey={type}
                onChange={(value) => {
                  window.TICKET_QUERY = {}
                  this.setState({ type: value })
                }}
              >
                {filterTypeList.map((item) => {
                  return <Tabs.TabPane tab={item.zhName} key={item.code} />
                })}
              </Tabs>
            ) : null}
            {type ? (
              <TicketList
                match={{ params: { type } }}
                location={{}}
                source="npm"
                refresh={refresh}
                appkey={appkey}
                isCreateTicket={createTicket}
                processCodes={processCodes}
                handleTicketDetail={this.handleTicketDetail}
                handleCreateTicket={this.handleCreateTicket}
              />
            ) : (
              <Table />
            )}
          </>
        ) : null}
        {showType === 'create' ? (
          <iframe
            style={{ minHeight: 'inherit' }}
            title="创建工单"
            src={iframeSrc}
            id="itsm-ticket-query-list"
            width="100%"
            height="100%"
            allowFullScreen="allowfullscreen"
            scrolling="yes"
            frameBorder={0}
          />
        ) : null}
        {showType === 'detail' ? (
          <iframe
            style={{ minHeight: 'inherit' }}
            title="工单详情"
            src={iframeSrc}
            id="itsm-ticket-query-list"
            width="100%"
            height="100%"
            allowFullScreen="allowfullscreen"
            scrolling="yes"
            frameBorder={0}
          />
        ) : null}
      </div>
    )
  }
}

export default TabList

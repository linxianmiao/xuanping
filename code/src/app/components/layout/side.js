import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { DownOutlined, PlusOutlined, SearchOutlined } from '@uyun/icons'
import { Button, Badge, Dropdown, Menu } from '@uyun/components'
import TicketModelList from '../../model-list/create-ticket/index.js'
import SearchDrawer from '../../global-search'
import SideMenu from '@uyun/ec-side-menu'
import getPermissions from '../common/getPermissions'
import { getPerUrl, getCode } from '../common/getPerUrl'
import getUrl from '~/utils/getUrl'

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

@inject(
  'globalStore',
  'modelListStore',
  'fieldListBuiltinStore',
  'fieldListExtendStore',
  'fieldListShareStore',
  'definitionStore',
  'policyStore',
  'recordStore',
  'triggerListStore'
)
@withRouter
@observer
class Side extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
      visible: false,
      searchVisible: false
    }
    this.todoTimerer = null
  }

  componentDidMount() {
    this.props.globalStore.getGrantedApp()
    this.props.globalStore.getDraftsTotal()
    this.props.globalStore.getFilterType()
    if (this.todoTimerer) clearInterval(this.todoTimerer)
    this.todoTimerer = setInterval(
      () => {
        console.log('定时器刷新待办数')
        this.props.globalStore.getFilterType()
      },
      1 * 60 * 1000
    )

    this.props.globalStore.getToken()

    // 如果侧边栏菜单被隐藏，这些接口转移到index中调用
    if (!getUrl('hideHeader') && !getUrl('hideMenu')) {
      this.props.globalStore.getSwitch()
      this.props.globalStore.checkShowStatusButton()
      this.props.globalStore.getFilterNamesByRegular()
      this.props.globalStore.checkConfigAuthor()
      this.props.globalStore.checkListOperation()
      this.props.globalStore.getTicketUrgingTime()
    }
  }

  componentWillUnmount() {
    clearInterval(this.todoTimerer)
  }

  handleChange = (visible) => {
    this.setState({ visible })
  }

  handleSearchVisibleChange = (searchVisible) => {
    this.setState({ searchVisible })
  }

  handleMenuClick = ({ key }) => {
    const { pathname } = this.props.location

    // 通过路由判断是否需要清空筛选条件
    if ((key === 'model' || key === 'field') && pathname === `/conf/${key}`) {
      return
    }
    if (getPerUrl(key) === pathname) {
      return
    }

    const queryKey = getTicketQueryKey(key)
    if (window.TICKET_QUERY && window.TICKET_QUERY[queryKey]) {
      window.TICKET_QUERY[queryKey] = null
    }
    // 如果是所有工单，还需要清空已归档列表的筛选条件
    if (key === 'all_ticket' && window.TICKET_QUERY && window.TICKET_QUERY.archived) {
      window.TICKET_QUERY.archived = null
    }
    // 所有工单清空查询视图
    // if (key === 'all_ticket') {
    this.props.globalStore.setTicketQueryViews(null)
    // }
    if (key === 'model') {
      this.props.modelListStore.resetQuery()
    }
    if (key === 'field') {
      this.props.fieldListBuiltinStore.resetQuery()
      this.props.fieldListExtendStore.resetQuery()
      this.props.fieldListShareStore.resetQuery()
    }
    if (key === 'trigger') {
      this.props.triggerListStore.resetQuery()
    }
    if (key === 'sla') {
      this.props.definitionStore.resetQuery()
      this.props.policyStore.resetQuery()
      window.OLA_LIST_FILTERS = null
      window.OLA_PROCESS_LIST_FILTERS = null
      window.SLA_STATISTICS_FILTERS = null
    }
  }

  _returnName = (item, isChild) => {
    const name = window.language === 'en_US' ? item.enName : item.zhName
    return name
  }

  render() {
    const { collapsed, visible, searchVisible } = this.state
    const {
      draftsTotal,
      ticketFilterType,
      productPermissions,
      configAuthor,
      approveCount,
      entrustTicketCount,
      menuList
    } = this.props.globalStore
    // 工单数量
    let myToDo = _.find(ticketFilterType, (filterType) => filterType.filterUrl === 'myToDo') || {}
    let groupTodo =
      _.find(ticketFilterType, (filterType) => filterType.filterUrl === 'groupTodo') || {}
    let myFollow =
      _.find(ticketFilterType, (filterType) => filterType.filterUrl === 'myFollow') || {}
    myToDo = myToDo.num || 0
    groupTodo = groupTodo.num || 0
    myFollow = myFollow.num || 0
    const { ticketMenuList } = menuList
    const permissionlist = getPermissions(productPermissions)
    const tickets = {
      key: 'ticket',
      type: 'group',
      name: i18n('layout.tickets', '工单'),
      children: [
        {
          key: 'createTicket',
          type: 'component',
          component: (
            <div
              style={{
                padding: collapsed ? '0 5px 10px' : '0 20px 10px',
                transition: 'all 0.3s'
              }}
            >
              {collapsed ? (
                <Button.Group size="small">
                  <Button
                    style={{ paddingLeft: 4, paddingRight: 4 }}
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      this.handleChange(true)
                    }}
                  />
                  {!window.quicklySearchDisable ? (
                    <Dropdown
                      overlay={
                        <Menu
                          className="global-search-btn-menu"
                          onClick={() => this.handleSearchVisibleChange(true)}
                        >
                          <Menu.Item key="search">
                            <SearchOutlined />
                            {i18n('global.search', '全文检索')}
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button
                        style={{ paddingLeft: 0, paddingRight: 0 }}
                        type="primary"
                        icon={<DownOutlined />}
                      />
                    </Dropdown>
                  ) : (
                    ''
                  )}
                </Button.Group>
              ) : (
                <Button.Group>
                  <Button
                    onClick={() => {
                      this.handleChange(true)
                    }}
                    icon={<PlusOutlined />}
                    type="primary"
                  >
                    {i18n('layout.new', '新建')}
                  </Button>
                  {!window.quicklySearchDisable ? (
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => this.handleSearchVisibleChange(true)}
                    />
                  ) : (
                    ''
                  )}
                </Button.Group>
              )}
            </div>
          )
        }
      ]
    }

    // 远程工单菜单
    if (configAuthor.remoteTicket) {
      const [ZhRemoteName, EnRemoteName] = configAuthor.remoteFilterNames || []
      tickets.children.push({
        key: 'remoteList',
        type: 'link',
        title: window.language === 'en_US' ? EnRemoteName : ZhRemoteName,
        name: window.language === 'en_US' ? EnRemoteName : ZhRemoteName,
        target: '_self',
        path: '/remote',
        icon: 'iconfont icon-yuanchengguanli'
      })
    }

    _.map(ticketMenuList, (menu) => {
      const children = []
      const queryMenuView = menu.queryMenuView || {}
      _.map(menu.children, (submenu) => {
        const queryMenuView = submenu.queryMenuView || {}
        children.push({
          key: submenu.code,
          type: 'link',
          title: this._returnName(submenu),
          name: this._returnName(submenu),
          icon: submenu.iconName ? `iconfont icon-${submenu.iconName}` : null,
          target: queryMenuView.openMode === 'newTab' ? '_blank' : '_self',
          path:
            submenu.type === 'HYPERLINK'
              ? queryMenuView.openMode === 'newTab'
                ? queryMenuView.linkUrl
                : `/iframe/${submenu.code}`
              : getPerUrl(submenu.code)
        })
      })
      const newItem = {
        key: menu.code,
        type: menu.type === 'GROUP' ? 'sub' : 'link',
        title: this._returnName(menu),
        name: this._returnName(menu),
        icon: menu.iconName ? `iconfont icon-${menu.iconName}` : null,
        target: queryMenuView.openMode === 'newTab' ? '_blank' : '_self',
        path:
          children.length === 0
            ? menu.type === 'HYPERLINK'
              ? queryMenuView.openMode === 'newTab'
                ? queryMenuView.linkUrl
                : `/iframe/${menu.code}`
              : getPerUrl(menu.code)
            : '',
        children: children,
        footer:
          menu.code === 'mytodo' ? (
            <Badge count={myToDo} className="left-badge-bg" />
          ) : menu.code === 'myfollow' ? (
            <Badge count={myFollow} className="left-badge-bg" />
          ) : menu.code === 'draft_box' ? (
            <Badge count={draftsTotal} className="left-badge-bg" />
          ) : menu.code === 'groupTodo' ? (
            <Badge count={groupTodo} className="left-badge-bg" />
          ) : menu.code === 'mycheck' ? (
            <Badge count={approveCount} className="left-badge-bg" />
          ) : menu.code === 'entrustTodo' ? (
            <Badge count={entrustTicketCount} className="left-badge-bg" />
          ) : null
      }
      !menu.isChild && tickets.children.push(newItem)
    })

    const configs = {
      key: 'config',
      type: 'group',
      title: i18n('layout.config', '配置'),
      name: i18n('layout.config', '配置'),
      children: [
        {
          key: 'model',
          type: 'link',
          title: i18n('layout.model', '模型管理'),
          name: i18n('layout.model', '模型管理'),
          icon: 'iconfont icon-deploymentunit',
          path: '/conf/model'
        },
        {
          key: 'database',
          type: 'link',
          title: '数据表管理',
          name: '数据表管理',
          icon: 'iconfont icon-biaoge',
          path: '/conf/database'
        },
        {
          key: 'formSet',
          type: 'link',
          title: i18n('layout.formSet', '子表单管理'),
          name: i18n('layout.formSet', '子表单管理'),
          icon: 'iconfont icon-biaodanguanli',
          path: '/conf/formManagement'
        },
        {
          key: 'field',
          type: 'link',
          title: i18n('layout.fields', '字段管理'),
          name: i18n('layout.fields', '字段管理'),
          icon: 'iconfont icon-font-size',
          path: '/conf/field'
        },
        {
          key: 'trigger',
          type: 'link',
          title: i18n('layout.triggers', '触发器'),
          name: i18n('layout.triggers', '触发器'),
          icon: 'iconfont icon-issuesclose',
          path: '/conf/trigger'
        },
        {
          key: 'sla',
          type: 'link',
          title: i18n('layout.sla_manage', 'SLA管理'),
          name: i18n('layout.sla_manage', 'SLA管理'),
          icon: 'iconfont icon-dashboard',
          path: '/conf/sla'
        }
      ]
    }
    const entrust = {
      key: 'entrust',
      type: 'link',
      title: '委托',
      name: '委托',
      icon: 'iconfont icon-weituo1',
      path: '/conf/entrust',
      below: true
    }
    const setting = {
      key: 'sysCon',
      type: 'link',
      title: i18n('layout.sysCon', '设置'),
      name: i18n('layout.sysCon', '设置'),
      icon: 'iconfont icon-xitongpeizhi',
      path: '/sysCon',
      below: true
    }
    const authority = {
      key: 'authority',
      type: 'link',
      title: i18n('layout.authority', '权限'),
      name: i18n('layout.authority', '权限'),
      icon: 'iconfont icon-quanxianguanli',
      path: '/authority',
      below: true
    }
    const configsChildren = configs.children.filter((item) => _.includes(permissionlist, item.key)) // 配置列表
    const isSetting = _.some(permissionlist, (item) => item === 'sysCon') // 是否有配置权限
    const isAuthority = _.some(permissionlist, (item) => item === 'authority') // 权限配置页面权限
    const isEntrust = _.some(permissionlist, (item) => item === 'entrust_management')
    configs.children = configsChildren

    // 远程配置菜单
    if (configAuthor.remoteTicketConfigMenu) {
      configs.children.push({
        key: 'remote',
        type: 'link',
        title: '远程配置',
        name: '远程配置',
        icon: 'iconfont icon-xitongpeizhi',
        path: '/conf/remote'
      })
    }

    // 侧边数据生成
    let items = [].concat(tickets)
    if (!_.isEmpty(configsChildren)) {
      items = [...items, configs]
    }
    if (isEntrust) {
      items = [...items, entrust]
    }

    if (isSetting) {
      items = [...items, setting]
    }
    if (isAuthority) {
      items = [...items, authority]
    }

    const code = getCode(this.props.location.pathname)
    const defaultOpenKeys =
      _.find(ticketMenuList, (menu) => _.some(menu.children, (child) => child.code === code)) || {}

    const { headerHeight } = runtimeStore.getState()

    return (
      <React.Fragment>
        <SideMenu
          style={{ top: headerHeight }}
          items={items}
          Link={Link}
          collapsed={collapsed}
          openCurrentOnly={false}
          defaultOpenKeys={[defaultOpenKeys.code]}
          selectedKeys={[code]}
          onCollapse={(collapsed, type) => {
            this.setState({ collapsed })
          }}
          {...this.props.menuProps}
          isSelectedKey={(item) => {
            return this.props.location.pathname.indexOf(item.path) !== -1
          }}
          mode="default"
          onClick={this.handleMenuClick}
        />
        {visible && <TicketModelList visible={visible} handleChange={this.handleChange} />}
        <SearchDrawer
          visible={searchVisible}
          onClose={() => this.handleSearchVisibleChange(false)}
        />
      </React.Fragment>
    )
  }
}

export default Side

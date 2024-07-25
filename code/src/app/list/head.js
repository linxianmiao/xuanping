import React, { Component } from 'react'
import classnames from 'classnames'
import { inject, observer } from 'mobx-react'
import { DoubleRightOutlined, DownOutlined, SyncOutlined } from '@uyun/icons'
import { Input, Button, Modal, Popover, Switch, message, Dropdown, Menu } from '@uyun/components'
import { Link, withRouter } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import TicketFilter from './components/ticketFilter'
import TicketListImport from './components/import'
import TicketListExport from './components/export'
import TicketView from './components/ticketView'
import { todoDefaultList, followDefaultList, allDefaultList } from './config/selectDefaultList'
import CustomColumn from './components/customColumn'
import ModalSelect from './components/modelLazySelect'
import MyApproveButton from './components/MyApproveButton'
import SeniorJump from '~/ticket/btn/operate/seniorJump'
import TicketRollBack from '~/ticket/btn/operate/rollBack'
import './styles/head.less'

import * as R from 'ramda'

const codeToCheckList = {
  myFollow: followDefaultList,
  myPartIn: followDefaultList,
  all: allDefaultList,
  archived: allDefaultList,
  myToDo: todoDefaultList,
  myapprove: todoDefaultList
}

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
    case 'mycheck':
      return 'mycheck'
    case 'archived':
      return 'archived'
    default:
      return menuKey
  }
}
const IMPORT_TYPE = new Set(['archived', 'all']) // 可以进行导入的 filterType
@inject('listStore', 'globalStore', 'modelListStore')
@withRouter
@observer
class TicketHeader extends Component {
  constructor(props) {
    super(props)

    const autoRefresh =
      localStorage.getItem(
        `auto_mytodo_${runtimeStore.getState().user?.userId}_${this.props.paramsType}`
      ) === 'true'

    this.state = {
      exportVisible: false, // 导出
      importVisible: false, // 导入
      selectModal: undefined,
      canRefresh: false, // 是否可以手动刷新
      autoRefresh, // 是否自动刷新,
      // 批量处理
      periodList: [],
      submitVisible: false,
      activityFlowId: '',
      tache: {},
      nextActivity: [],
      batchVisible: '',
      confirmLoading: false,
      ticket: {},
      modelList: []
    }
  }

  timer = null

  componentDidMount() {
    // this.setCheckFilterList(this.props)

    if (this.props.paramsType === 'myToDo' || this.props.paramsType === 'mycheck') {
      this.isCanRefresh()
      this.handleAutoRefreshSwitch(this.state.autoRefresh)
    }
    if (this.props.source === 'npm' && this.props.isCreateTicket) {
      this.props.modelListStore.getModelList({ pageSize: 100 }).then((res) => {
        this.setState({
          modelList: res
            ? res?.list.filter((item) => this.props.processCodes.includes(item.processCode))
            : []
        })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.paramsType !== this.props.paramsType) {
      this.setState({
        selectModal: undefined
      })
      // this.setCheckFilterList(nextProps)

      if (nextProps.paramsType === 'myToDo' || nextProps.paramsType === 'mycheck') {
        const autoRefresh =
          localStorage.getItem(
            `auto_mytodo_${runtimeStore.getState().user?.userId}_${nextProps.paramsType}`
          ) === 'true'
        this.setState({ autoRefresh }, () => {
          this.isCanRefresh()
          this.handleAutoRefreshSwitch(this.state.autoRefresh)
        })
      } else {
        this.clearTimer()
      }
    }
  }

  componentWillUnmount() {
    this.clearTimer()
  }

  isCanRefresh = async () => {
    const res = await axios.get(API.isCanListRefresh)

    this.setState({ canRefresh: !!res })
  }

  handleRefresh = () => {
    this.props.listStore.getList()
    this.props.globalStore.getFilterType() // 左侧菜单的工单数量
    this.handleAutoRefreshSwitch(this.state.autoRefresh)
  }

  reload = () => {
    this.props.lefRefresh && this.props.lefRefresh()
    this.props.listStore.setSelectedRowKeys([])
    this.props.listStore.setCurrentAndPageSize(1)
    this.handleRefresh()
  }

  handleAutoRefreshSwitch = (value) => {
    localStorage.setItem(
      `auto_mytodo_${runtimeStore.getState().user?.userId}_${this.props.paramsType}`,
      String(value)
    )
    this.clearTimer()

    if (value) {
      this.timer = setInterval(() => {
        this.props.listStore.getList()
        this.props.globalStore.getFilterType()
      }, 10 * 1000)
    }

    this.setState({ autoRefresh: value })
  }

  clearTimer = () => {
    this.timer && clearInterval(this.timer)
    this.timer = null
  }

  setCheckFilterList(props) {
    if (!window.TICKET_CHECK_FILTER_LIST) {
      window.TICKET_CHECK_FILTER_LIST = {}
    }
    const { paramsType } = props
    const {
      menuList: { ticketMenuList = [] }
    } = props.globalStore // 获取查询器的默认搜索条件
    const currentMenuData =
      _.find(ticketMenuList, (menu) => getTicketQueryKey(menu.code) === paramsType) || {}
    const queryMenuView = currentMenuData.queryMenuView || {}
    const extParams = queryMenuView.extParams || {} // 解构解的好辛苦
    const defaultFilterList = {
      ...queryMenuView,
      ...extParams
    }
    let checkList = []
    // 无缓存的项，且不是总览下钻
    if (window.TICKET_CHECK_FILTER_LIST[paramsType] && !props.location.query) {
      checkList = window.TICKET_CHECK_FILTER_LIST[paramsType]
    } else {
      if (codeToCheckList[paramsType]) {
        checkList = codeToCheckList[paramsType]
      } else {
        checkList = _.filter(
          Object.keys(defaultFilterList),
          (filter) => ['extParams', 'columns', 'checkFilterList'].indexOf(filter) === -1
        )
      }
    }
    this.props.listStore.setCheckFilterList(checkList, paramsType)
    this.props.listStore.queryFieldInfo(checkList, 'QUERY')
  }

  handleChangeViewId = (viewId, viewName) => {
    const { filterType } = this.props.listStore

    const views = {
      [filterType]: viewId ? { id: viewId, name: viewName } : undefined
    }

    if (viewId) {
      this.props.handleChangeFilterListVisible(false)
    }
    this.props.globalStore.setTicketQueryViews(views)
  }

  handleModelSelect = async (id) => {
    // 个待与组待 所处阶段的下拉值 是与工单类型联动
    const res = await this.props.modelListStore.queryActivityInfos({ modelId: id })
    this.setState({ periodList: res })
    const { pageSize, query } = this.props.listStore
    const tmp =
      this.props.paramsType === 'groupTodo' ||
      this.props.paramsType === 'myToDo' ||
      this.props.paramsType === 'entrust' ||
      this.props.paramsType === 'todoGroup'
        ? 'modelId'
        : 'processId'
    const data = _.assign({}, query, { [tmp]: id ? [id] : null })
    this.props.listStore.setQuery(data)
    this.props.listStore.setCurrentAndPageSize(1, pageSize)
    this.handleRefresh()
    this.setState({
      selectModal: id
    })
  }

  // 导入取消
  handleImportCancle = (callback) => {
    this.setState({ importVisible: false }, () => {
      callback && callback()
    })
  }

  // 导出的状态
  handleExportCancle = (exportVisible) => {
    this.setState({ exportVisible })
  }

  // 删除
  handleDeleteTcketList = () => {
    const { selectedRowKeys, pageSize } = this.props.listStore
    const ticketIdList = _.chain(selectedRowKeys)
      .map((item) => item.substr(0, 32))
      .uniq()
      .value()
    if (_.size(ticketIdList) > 100) {
      Modal.warning({
        title: i18n('ticket-delete-tip', '暂不支持删除超过{count}条工单', { count: 100 })
      })
      return false
    }
    Modal.confirm({
      iconType: 'exclamation-circle',
      title: '确定删除全部已选工单？该操作不可逆转!',
      onOk: async () => {
        const ticketIdList = _.map(selectedRowKeys, (item) => item.substr(0, 32))
        const res = await this.props.listStore.ticketListBatchDelete(ticketIdList)
        // 删除成功以后重新请求
        if (res) {
          this.reload()
        } else {
          message.error(i18n('w2001'))
        }
      }
    })
  }

  handleFilterClick = () => {
    const { visible } = this.props
    this.props.handleChangeFilterListVisible(!visible)
    const { allField } = this.props.listStore
    if (_.isEmpty(allField.builtinFields) && !visible) {
      this.props.listStore.getAllColumns()
    }
  }

  renderBatchButton() {
    // 只有个人待办和组内待办的页面中有批量处理入口
    const pathMap = {
      myToDo: 'batchMyTodo',
      groupTodo: 'batchGroupTodo',
      todoGroup: 'batchTodoGroup'
    }
    const { filterType } = this.props.listStore
    const { isShowBatch } = this.props.globalStore.routePermissions
    const batchPath = pathMap[filterType]
    if (typeof batchPath === 'undefined' || !isShowBatch) return null
    return (
      <Link to={`/ticket/batchTicket/${batchPath}`} className="batch-handle-link">
        {i18n('batch-process', '批量处理')} <DoubleRightOutlined />
      </Link>
    )
  }

  handleKeywordChange = (e, query) => {
    this.props.listStore.setQuery(_.assign({}, query, { wd: e.target.value }))
  }

  handleSearch = (value) => {
    const { pageSize } = this.props.listStore
    this.props.listStore.setCurrentAndPageSize(1, pageSize)
    setTimeout(() => {
      this.handleRefresh()
    }, 0)
  }

  hideModal = () => {
    this.setState({ batchVisible: '', tache: {} })
  }

  refresh = () => {
    this.props.listStore.resetSelected()
    this.props.listStore.getAllTicketList()
    this.props.globalStore.getFilterType()
  }

  ticketJump = async () => {
    const { selectedRows } = this.props
    const { activityFlowId, tache, ticket } = this.state
    if (selectedRows.length === 0) return
    const ticket_Ids = R.pluck('ticketId', selectedRows)

    const values = await this.jump.validate()
    const execs = values[tache.id] || []
    const user = execs.filter((item) => item.type === 1).map((item) => item.id)
    const group = execs.filter((item) => item.type === 0).map((item) => item.id)
    const payload = {
      ticket_Ids,
      parallelismTacheUser: ticket.isInParallel && user ? { [tache.id]: user } : {},
      handleRule: {
        route_id: activityFlowId,
        message: values.message,
        executors_groups: {
          [tache.id]: { user, group }
        }
      },
      handleType: 0,
      activityId: selectedRows[0].tacheId
    }
    this.setState({ confirmLoading: true })
    const batchHandleId = await this.props.listStore.batchHandleTicket(payload)
    this.setState({ confirmLoading: false })
    this.hideModal()
    this.props.listStore.setProps({ isBatchHandling: true })
    await this.props.listStore.getBatchHandleProgress(batchHandleId)
    this.refresh()
  }

  ticketClose = async () => {
    const values = await this.close.validate()
    const { selectedRows } = this.props
    if (selectedRows.length === 0) return
    const ticket_Ids = R.pluck('ticketId', selectedRows)
    const payload = {
      ticket_Ids,
      handleType: 3,
      handleRule: {
        message: values.message
      },
      activityId: selectedRows[0].tacheId
    }
    this.setState({ confirmLoading: true })
    const batchHandleId = await this.props.listStore.batchHandleTicket(payload)
    this.setState({ confirmLoading: false })
    this.hideModal()
    this.props.listStore.setProps({ isBatchHandling: true })
    await this.props.listStore.getBatchHandleProgress(batchHandleId)
    this.refresh()
  }

  showCloseModal = () => {
    this.setState({ batchVisible: 'close' })
  }

  /* ------------------------------------- */

  render() {
    const {
      query,
      filterType,
      selectedRows,
      selectedRowKeys,
      approveCount,
      typeList,
      formList,
      modelRule
    } = this.props.listStore
    const { ticketQueryViews, menuList } = this.props.globalStore
    const { importAuthro, exportBtn, listDelete } = this.props.globalStore.ticketListOperation
    const {
      importVisible,
      exportVisible,
      selectModal,
      canRefresh,
      autoRefresh,
      batchVisible,
      tache,
      periodList,
      nextActivity,
      confirmLoading
    } = this.state
    const { visible, showBatchBtn } = this.props
    const { wd } = query
    const ticketView = ticketQueryViews[filterType] || {}
    const builtInFilterType = new Set(typeList)
    const currentMenuData =
      _.find(menuList.ticketMenuList, (menu) => getTicketQueryKey(menu.code) === filterType) || {}
    const queryMenuView = _.get(currentMenuData, 'queryMenuView', {})
    const ticketViewModelId = queryMenuView ? queryMenuView.model_id : []
    const content = (
      <div className="overview-control-wrap clearfix">
        <span className="overview-control-text">{i18n('refresh_interval', '每隔10秒刷新')}</span>
        <span className="overview-control">
          <Switch checked={autoRefresh} onChange={this.handleAutoRefreshSwitch} />
        </span>
      </div>
    )
    const ticketIdList = _.map(selectedRowKeys, (item) => item.substr(0, 32))
    const tacheIdList = _.map(selectedRows, (item) => item.tacheId)
    return (
      <div id="ticket-list-filter-warp" className="ticket-list-filter-warp">
        <Input.Search
          style={{ width: 258, marginRight: 12 }}
          placeholder={i18n('globe.keywords', '请输入关键字')}
          allowClear
          enterButton
          value={wd}
          onChange={(e) => {
            this.handleKeywordChange(e, query)
          }}
          onSearch={() => this.handleSearch()}
          onClear={() => this.handleSearch()}
        />
        {builtInFilterType.has(filterType) && (
          <ModalSelect
            filterType={filterType}
            value={selectModal}
            style={{ width: 256, marginRight: 15 }}
            onChange={this.handleModelSelect}
          />
        )}
        {this.props.source === 'npm' ? null : (
          <TicketView
            viewId={ticketView.id}
            viewName={ticketView.name}
            handleChangeViewId={this.handleChangeViewId}
          />
        )}
        <div
          onClick={this.handleFilterClick}
          className={classnames('filter-btns-wrap', { active: visible })}
          style={{ lineHeight: '32px' }}
        >
          <span>{i18n('ticket.list.filter', '更多筛选')}</span>
          <DownOutlined />
        </div>

        {
          // 审阅
          // _.includes(['myToDo', 'approve'], filterType) && Boolean(approveCount) &&
          // <div className="ticket-list-approve" style={{ float: 'right' }}>
          //   <Checkbox checked={filterType === 'approve'} onChange={e => {
          //     if (e.target.checked) {
          //       this.props.listStore.setFilterType('approve')
          //     } else {
          //       this.props.listStore.setFilterType('myToDo')
          //     }
          //     this.handleRefresh()
          //   }}>{i18n('ticket.list.mytoDo.appove', '待审阅')}</Checkbox>
          //   <Badge count={approveCount} />
          // </div>
        }
        <div className="ticket-all-btns-wrap">
          {filterType === 'myapprove' ? (
            <>
              <MyApproveButton
                disabled={ticketIdList.length === 0}
                ticketIdList={ticketIdList}
                tacheIdList={tacheIdList}
                reload={this.reload}
                approvalResult={1}
                type="default"
              >
                通过
              </MyApproveButton>
              <MyApproveButton
                disabled={ticketIdList.length === 0}
                ticketIdList={ticketIdList}
                tacheIdList={tacheIdList}
                reload={this.reload}
                approvalResult={2}
                type="default"
              >
                驳回
              </MyApproveButton>
            </>
          ) : (
            <>
              {importAuthro && IMPORT_TYPE.has(filterType) && (
                <Button
                  //   type="primary"
                  //   icon={<DownloadOutlined />}
                  onClick={() => {
                    this.setState({ importVisible: true })
                  }}
                >
                  {i18n('config.trigger.import', '导入')}
                </Button>
              )}
              {exportBtn && !_.includes(['myPartIn', 'myFollow', 'mycheck'], filterType) && (
                <Button
                  //   type="primary"
                  //   icon={<UploadOutlined />}
                  onClick={() => {
                    this.handleExportCancle('form')
                  }}
                >
                  {i18n('config.trigger.export', '导出')}
                </Button>
              )}
              {listDelete && !builtInFilterType.has(filterType) && (
                <Button disabled={_.isEmpty(selectedRowKeys)} onClick={this.handleDeleteTcketList}>
                  {i18n('delete', '删除')}
                </Button>
              )}
              {_.includes(['all', 'archived'], filterType) && (
                <CustomColumn ticketViewModelId={ticketViewModelId} />
              )}
              <TicketListImport
                visible={importVisible}
                handleImportCancle={this.handleImportCancle}
                lefRefresh={this.props.lefRefresh}
              />
              <TicketListExport
                visible={exportVisible}
                handleExportCancle={this.handleExportCancle}
              />
              {this.renderBatchButton()}

              {(filterType === 'myToDo' || filterType === 'mycheck') && canRefresh && (
                <Button.Group style={{ float: 'right' }}>
                  <Button
                    style={{ verticalAlign: 'middle', paddingTop: 2, marginRight: 0 }}
                    icon={<SyncOutlined />}
                    onClick={this.handleRefresh}
                  />
                  <Popover placement="bottomLeft" content={content} trigger="click">
                    <Button style={{ verticalAlign: 'middle' }} icon={<DownOutlined />} />
                  </Popover>
                </Button.Group>
              )}
            </>
          )}
          {this.props.source === 'npm' && this.props.isCreateTicket ? (
            <Dropdown
              overlay={
                <Menu onClick={(key) => this.props.handleCreateTicket(key)}>
                  {this.state.modelList.map((item) => (
                    <Menu.Item key={item.processId}>{item.processName}</Menu.Item>
                  ))}
                </Menu>
              }
              overlayStyle={{ maxHeight: 150 }}
            >
              <Button type="primary" style={{ float: 'right', marginRight: 12, marginLeft: 12 }}>
                新建工单 <DownOutlined />
              </Button>
            </Dropdown>
          ) : null}
        </div>

        {visible && (
          <TicketFilter
            key={filterType}
            viewId={ticketView.id}
            viewName={ticketView.name}
            handleChangeViewId={this.handleChangeViewId}
            ticketViewModelId={ticketViewModelId}
            periodList={periodList}
          />
        )}

        <Modal
          title={tache.title || ''}
          visible={batchVisible === 'submit'}
          onCancel={this.hideModal}
          onOk={this.ticketJump}
          confirmLoading={confirmLoading}
          destroyOnClose
        >
          <SeniorJump
            visible={batchVisible === 'submit'}
            id={formList.ticketId}
            isRequiredHandingSuggestion={modelRule.isRequiredHandingSuggestion}
            modelType={modelRule.modelType}
            modelId={formList.subModelId || formList.modelId}
            tacheId={formList.tacheId}
            tache={tache}
            caseId={formList.caseId}
            orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
            nextActivity={nextActivity}
            activityType={formList.activityType}
            wrappedComponentRef={(node) => {
              this.jump = node
            }}
          />
        </Modal>

        <Modal
          title={i18n('globe.close', '关闭')}
          visible={this.state.batchVisible === 'close'}
          onCancel={this.hideModal}
          onOk={this.ticketClose}
          confirmLoading={confirmLoading}
          destroyOnClose
        >
          <TicketRollBack
            isRequiredHandingSuggestion={modelRule.isRequiredHandingSuggestion}
            visible={batchVisible === 'close'}
            wrappedComponentRef={(node) => {
              this.close = node
            }}
          />
        </Modal>
      </div>
    )
  }
}

export default TicketHeader

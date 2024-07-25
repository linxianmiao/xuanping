import React, { Component } from 'react'
import { Provider, observer, inject } from 'mobx-react'
import { reaction } from 'mobx'
import TicketHeader from './head'
import TicketTable from './ticketTable'
import TicketPagination from './components/ticketPagination'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import stores from './stores'
import originalQuery from './config/originalQuery'
import defaultAttributeList from './config/defaultAttributeList'
import list from './config/defaultList'
import { getQueryAndColumns } from './utils'
import ErrorBoundary from '~/components/ErrorBoundary'

import './styles/index.less'
import _ from 'lodash'

@inject('globalStore')
@observer
class TicketList extends Component {
  static defaultProps = {
    listStore: stores.listStore
  }

  state = {
    visible: false // 筛选
  }

  get list() {
    const { modelList } = this.props.listStore
    const { priorityList } = this.props.globalStore
    return [
      {
        name: i18n('ticket.list.ticketName', '标题'),
        code: 'ticketName',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.ticketNum', '单号'),
        code: 'ticketNum',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.filter.model', '模型'),
        code: 'modelId',
        type: 'modelSelect',
        params: _.map(modelList.slice(1), (item) => ({
          label: item.processName,
          value: item.processId
        }))
      },
      {
        name: i18n('ticket.list.tacheName', '当前节点'),
        code: 'modelAndTacheId',
        type: 'modelTache'
      },
      {
        name: i18n('ticket-list-table-th-executionGroup', '处理组'),
        code: 'executionGroup',
        type: 'group'
      },
      {
        name: i18n('ticket.list.filter.filterOrg', '创建人所在部门'),
        code: 'filterOrg',
        type: 'department'
      },
      {
        name: i18n('participant.deparment', '参与人所在部门'),
        code: 'participantsDepartIds',
        type: 'department'
      },
      ...list.slice(0, 2),
      {
        name: i18n('ticket-list-table-th-priority', '优先级'),
        code: 'priority',
        type: 'select',
        params: _.map(priorityList, (item) => ({ value: item.value, label: item.name }))
      },
      ...list.slice(2)
    ]
  }

  componentDidMount() {
    if (this.props.source === 'npm') {
      this.props.globalStore.queryProductPermissions().then(() => {
        this.props.globalStore.getTicketPriority().then(() => {
          this.props.listStore.setAttrList(this.list, 'QUERY')
          this.getList(this.props)
        })
      })
    } else {
      this.props.globalStore.getTicketPriority().then(() => {
        this.props.listStore.setAttrList(this.list, 'QUERY')
        this.getList(this.props)
      })
    }
    this.disposer = reaction(
      () => {
        return this.props.listStore.ticketcolumns
      },
      async (data) => {
        const { caseIds, codes } = data
        if (!_.isEmpty(codes)) {
          this.props.listStore.setProps({ loading: true })
          await this.props.listStore.getTicketFormData(caseIds, codes)
          this.props.listStore.setProps({ loading: false })
        }
      }
    )
    window.removeEventListener('storage', this.onStorage, false)
    window.addEventListener('storage', this.onStorage, false)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refresh !== this.props.refresh) {
      this.getList(this.props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      this.props.listStore.setValue([], 'ticketList')
      this.props.listStore.setValue(0, 'count')
      this.handleChangeFilterListVisible(false)
      const { query } = this.props.listStore
      const data = _.assign({}, query, { processId: undefined })
      this.props.listStore.setQuery(data)
      this.getList(nextProps)
    }
  }

  componentWillUnmount() {
    this.disposer()
    window.removeEventListener('storage', this.onStorage)
  }

  onStorage = (event) => {
    if (event.key === 'RELOAD_TICKET_LIST' && event.newValue) {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getList(this.props)
      }, 500)
    }
  }

  handleChangeFilterListVisible = (visible) => {
    this.setState({ visible })
  }

  getList = (props) => {
    const { type } = props.match.params
    const { query } = props.location
    if (!window.TICKET_QUERY) {
      window.TICKET_QUERY = {}
    }

    props.listStore.setFilterType(type)
    if (query) {
      // 路由中带有query，由此判断是总览下钻
      const queryData = _.cloneDeep(originalQuery)
      for (const key in query) {
        if (_.includes(['status', 'modelId'], key)) {
          queryData[key] = query[key].split('_')
        } else if (_.includes(['source', 'priority', 'creator'], key)) {
          queryData[key] = [query[key]]
        } else if (_.includes(['overdue'], key)) {
          queryData[key] = [].concat(Number(query[key]))
        } else if (_.includes(['create_time'], key)) {
          queryData[key] = [query.create_time, query.end_time]
        }
      }

      // props.listStore.setQuery(queryData)
      const {
        menuList: { ticketMenuList = [] }
      } = props.globalStore
      const { columnsListCode, queryListCode, queryList, columnsList, queryArchived } =
        getQueryAndColumns(ticketMenuList, type)
      this.props.listStore.setProps({ queryArchived: queryArchived })

      this.props.listStore.queryFieldInfo(
        _.concat(columnsListCode, queryListCode),
        queryList,
        columnsList
      )
      const newQuery = {}
      _.forEach(queryList, (item) => {
        if (queryData[item.code]) {
          item.value = queryData[item.code]
          newQuery[item.code] = queryData[item.code]
        } else {
          if (!item.hide) {
            item.value = undefined
            newQuery[item.code] = undefined
          } else {
            newQuery[item.code] = item.value
          }
        }
      })
      props.listStore.setQuery(newQuery)
      window.TICKET_QUERY[type] = {
        ...window.TICKET_QUERY[type],
        query: { ...newQuery }
      }
      props.listStore.setCurrentAndPageSize(1, 20)
      props.listStore.setAttributeList(defaultAttributeList)
    } else {
      // 菜单进入、面包屑、后退等
      // 查询器的数据
      const { allTypeList } = props.listStore
      if (!_.includes(allTypeList, type)) {
        const {
          menuList: { ticketMenuList = [] }
        } = props.globalStore // 获取查询器的默认搜索条件

        const {
          query,
          columnsListCode,
          queryListCode,
          queryList,
          columnsList,
          queryArchived,
          selectedColumnsWidth
        } = getQueryAndColumns(ticketMenuList, type)
        this.props.listStore.setProps({ queryArchived: queryArchived })
        this.props.listStore.setProps({ selectedColumnsWidth })
        // window.TICKET_QUERY 此全局变量专门解决查询后进入详情，返回列表时带回搜索参数不可乱改，影响太大！！！
        if (!window.TICKET_QUERY[type]) {
          this.props.listStore.queryFieldInfo(
            _.concat(columnsListCode, queryListCode),
            queryList,
            columnsList
          )
          props.listStore.setQuery(query)
          window.TICKET_QUERY[type] = {
            ...window.TICKET_QUERY[type],
            query: { ...query }
          }
        } else if (window.TICKET_QUERY[type] && window.TICKET_QUERY[type].filterType !== type) {
          this.props.listStore.queryFieldInfo(
            _.concat(columnsListCode, queryListCode),
            queryList,
            columnsList
          )
          props.listStore.setQuery(query)
          window.TICKET_QUERY[type] = {
            ...window.TICKET_QUERY[type],
            query: { ...query }
          }
        }
      }

      if (window.TICKET_QUERY[type]) {
        const { current, pageSize, query, attributeList } = window.TICKET_QUERY[type]
        props.listStore.setQuery(query)
        props.listStore.setCurrentAndPageSize(current, pageSize)
        props.listStore.setAttributeList(attributeList)
      } else {
        props.listStore.setQuery(originalQuery)
        props.listStore.setCurrentAndPageSize(1, 20)
        props.listStore.setAttributeList(defaultAttributeList)
      }
    }

    props.listStore.getList()
    if (type === 'mycheck') {
      props.globalStore.queryApproveCount()
    }
    if (type === 'groupTodo') {
      props.globalStore.getFilterType()
    }
    if (type === 'entrust') {
      props.globalStore.getEntrustTicketCount()
    }
  }

  // 工单左侧刷新
  lefRefresh = () => {
    this.props.globalStore.getFilterType()
  }

  render() {
    const { filterType, count, selectedRows = [] } = this.props.listStore
    const showBatchBtn = selectedRows.length > 0
    const { source, isCreateTicket, processCodes } = this.props
    return (
      <Provider {...stores}>
        <div className="rebuild-ticket-list-wrap" id="rebuild-ticket-list-wrap">
          {source === 'npm' ? null : <PageHeader />}
          <ContentLayout>
            {/* {_.includes(['all', 'archived'], filterType) && <Tabs />} */}
            <ErrorBoundary desc={i18n('loadFail')}>
              <TicketHeader
                lefRefresh={this.lefRefresh}
                visible={this.state.visible}
                handleChangeFilterListVisible={this.handleChangeFilterListVisible}
                paramsType={this.props.match.params.type}
                showBatchBtn={showBatchBtn}
                selectedRows={selectedRows}
                source={source}
                isCreateTicket={isCreateTicket}
                processCodes={processCodes}
                handleCreateTicket={this.props.handleCreateTicket}
              />
              {_.includes(['myToDo', 'groupTodo'], filterType) ? (
                <TicketTable
                  paramsType={this.props.match.params.type}
                  source={source}
                  handleTicketDetail={this.props.handleTicketDetail}
                />
              ) : (
                <TicketTable
                  paramsType={this.props.match.params.type}
                  source={source}
                  handleTicketDetail={this.props.handleTicketDetail}
                />
              )}
              {Boolean(count) && <TicketPagination />}
            </ErrorBoundary>
          </ContentLayout>
        </div>
      </Provider>
    )
  }
}
export default TicketList

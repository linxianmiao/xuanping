import React, { Component } from 'react'
import moment from 'moment'
import { observer, inject } from 'mobx-react'
import qs from 'qs'
import { SOTERFIELDTYPES, BUILTIN_DATAINDEX, BUILTIN_MENUCODE } from './config/attribute'
import { toJS } from 'mobx'
import { Table, Tooltip, Tag } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { parseTagsDataToArray } from '~/utils/common'
import TicketTitle from './components/ticketTitle'
import TicketDetailLink from './components/ticketDetailLink'
import { getCode } from '~/components/common/getPerUrl'
import list from '~/components/pageHeader/list'

import './styles/table.less'

const TD_WIDTH = 150

const getShowRowSelection = (filterType, onRowSelectionChange) => {
  return (
    !_.includes(['myPartIn', 'myFollow'], filterType) || typeof onRowSelectionChange === 'function'
  )
}

@inject('listStore', 'globalStore')
@observer
class TicketTable extends Component {
  state = {
    tableHight: 400
  }

  _renderStatus = (text) => {
    let name = ''
    let color = ''
    switch (text) {
      case 2:
        name = i18n('ticket.list.status_2', '处理中')
        color = '#1F99E5'
        break // 处理中
      case 3:
        name = i18n('ticket.list.status_3', '已完成')
        color = '#3CD768'
        break // 已完成
      case 7:
        name = i18n('ticket.list.status_7', '已关闭')
        color = '#B8BEC8'
        break // 已关闭
      case 10:
        name = i18n('ticket.list.status_10', '挂起')
        color = '#FF4848'
        break // 挂起
      case 11:
        name = i18n('ticket.list.status_11', '已废除')
        color = '#ec4e53'
        break // 已废除
      case 12:
        name = i18n('ticket.list.status_12', '已处理')
        color = '#0549c5'
        break // 已处理
      case 13:
        name = i18n('ticket.list.status_13', '已归档')
        color = '#0549c5'
        break // 已归档
      default:
        name = i18n('ticket.list.status_1', '待处理')
        color = '#FFCD3D'
        break // 待处理
    }
    return { name, color }
  }

  componentDidMount() {
    this.resizeUpdate()
    window.addEventListener('resize', this.resizeUpdate)
    document.querySelector('.filter-btns-wrap')?.addEventListener('click', this.changeHight)

    if (
      !(
        window.location.href.includes('batchMyTodo') ||
        window.location.href.includes('batchGroupTodo') ||
        window.location.href.includes('batchTodoGroup')
      ) &&
      this.props.source !== 'npm'
    ) {
      document
        .getElementById('ticket-list-filter-warp')
        .addEventListener('DOMNodeInserted', this.changeHight)
    }
  }

  changeHight = () => {
    setTimeout(() => {
      this.resizeUpdate()
    })
  }

  resizeUpdate = () => {
    if (this.props.source === 'npm') {
      return
    }
    let tableHight = 0
    if (
      window.location.href.includes('batchMyTodo') ||
      window.location.href.includes('batchGroupTodo')
    ) {
      tableHight =
        document.querySelector('.content-wrap')?.getBoundingClientRect().height -
        document.querySelector('.batch-ticket-header')?.getBoundingClientRect().height -
        (document.getElementsByClassName('u4-table-thead')[0]?.offsetHeight || 60) -
        40 -
        24 -
        80
    } else {
      tableHight =
        window.$('#rebuild-ticket-list-wrap').height() -
        (document.getElementsByClassName('u4-table-thead')[0]?.offsetHeight || 60) -
        document.querySelector('#ticket-list-filter-warp')?.getBoundingClientRect().height -
        40 -
        24 -
        80
    }

    this.setState({ tableHight })
  }

  componentDidUpdate(nextProps) {
    if (this.props.paramsType !== nextProps.paramsType) {
      this.resizeUpdate()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeUpdate)
    document.querySelector('.filter-btns-wrap')?.removeEventListener('click', this.changeHight)
    document
      .getElementById('ticket-list-filter-warp')
      ?.removeEventListener('DOMNodeInserted', this.changeHight)
  }

  _renderPriority = (text) => {
    const { priorityList } = this.props.globalStore
    const { name, color } = _.find(priorityList, (item) => item.value == text) || {}
    if (name) {
      return (
        <span className={'table-th-priority'} style={{ background: color }}>
          {name}
        </span>
      )
    }
    return '--'
  }

  renderColumnBywrapTypeMap = ({ text, width, wrapType }) => {
    if (wrapType === 'fixedBreak') {
      return (
        <Tooltip title={text}>
          <span
            style={{
              display: 'inline-block',
              maxWidth: width
            }}
            className={wrapType}
          >
            {text}
          </span>
        </Tooltip>
      )
    }
    if (wrapType === 'fixedWrap') {
      return (
        <span className={wrapType} style={{ maxWidth: width, display: 'inline-block' }}>
          {text}
        </span>
      )
    }
    return <span className={wrapType}>{text}</span>
  }
  handleClick = (record, type) => {
    const {
      ticketId,
      tacheNo,
      tacheType,
      processId,
      subModelId,
      tacheId,
      caseId,
      externalURL,
      draft,
      ticketName
    } = record
    const {
      menuList: { ticketMenuList }
    } = this.props.globalStore
    const code = getCode(this.props.location.pathname)
    const menu =
      _.find(ticketMenuList, (item) => item.code === code) ||
      _.find(list(i18n), (item) => item.value === code) ||
      {}
    const isAgile = this.props.location.pathname.includes('ticket/agile')
    const search = {
      tacheNo: tacheNo || 0,
      tacheType: tacheType,
      tacheId: tacheId,
      modelId: subModelId || processId,
      caseId: caseId,
      isDrafts: draft,
      isAgile
    }
    if (this.props.source === 'npm') {
      this.props.handleTicketDetail(
        `/itsm/#/ticketDetail/${ticketId}?${qs.stringify(search)}`,
        ticketName,
        type
      )
      return false
    }
    if (externalURL) {
      window.open(externalURL)
      return false
    }
    if (type === 'newTab') {
      // 带头部以及左侧菜单
      // window.open(`/#/ticket/detail/${ticketId}?${qs.stringify(search)}`)
      // 不带头部以及左侧带单
      window.open(`./ticket.html#/ticket/detail/${ticketId}?${qs.stringify(search)}`)
      return false
    }
    this.props.history.push({
      pathname: `/ticket/detail/${ticketId}`,
      search: `?${qs.stringify(search)}`,
      state: {
        fromHase: this.props.location.pathname,
        fromName: menu.name || (window.language === 'zh_CN' ? menu.zhName : menu.enName)
      }
    })
  }

  _renderColumns = (isShowRowSelection) => {
    const {
      ticketList,
      ticketAttributeList,
      isBatchHandling,
      filterType,
      query,
      columnSelectedList,
      selectedColumnsWidth
    } = this.props.listStore
    const { handlingTicketIdList = [], paramsType } = this.props
    const { orderBy, sortRule } = query
    let columnWidthMap = new Map()
    let wrapTypeMap = new Map()
    if (Array.isArray(selectedColumnsWidth) && selectedColumnsWidth.length > 0) {
      _.forEach(selectedColumnsWidth, (d) => {
        if (d.width.widthType.includes('auto')) {
          columnWidthMap.set(d.code, 'auto')
          wrapTypeMap.set(d.code, 'auto')
        } else {
          columnWidthMap.set(d.code, d.width.widthNum)
          if (d.width.widthType.includes('fixedWrap')) {
            wrapTypeMap.set(d.code, 'fixedWrap')
          } else {
            wrapTypeMap.set(d.code, 'fixedBreak')
          }
        }
      })
    }
    let columns = [
      {
        key: 'ticketName',
        width: columnWidthMap.has('ticketName') ? columnWidthMap.get('ticketName') : 240,
        dataIndex: 'ticketName',
        title: i18n('ticket-list-table-th-title', '工单标题'),
        sorter: BUILTIN_DATAINDEX.has('ticketName'),
        sortOrder: orderBy === 'ticketName' ? sortRule : false,
        render: (text, record) => {
          const isHandling = isBatchHandling && handlingTicketIdList.includes(record.ticketId)
          const wrapType = wrapTypeMap.has('ticketName') ? wrapTypeMap.get('ticketName') : ''
          let width =
            columnWidthMap.has('ticketName') && columnWidthMap.get('ticketName') !== 'auto'
              ? columnWidthMap.get('ticketName') - 32
              : TD_WIDTH - 32
          return (
            // <TicketDetailLink {...{ text, record }}>
            <TicketTitle
              record={record}
              isHandling={isHandling}
              globalStore={this.props.globalStore}
              source={this.props.source}
              handleTicketDetail={this.props.handleTicketDetail}
              wrapType={wrapType}
              width={width}
              renderColumnBywrapTypeMap={this.renderColumnBywrapTypeMap}
            />
            // </TicketDetailLink>
          )
        }
      },
      {
        key: 'ticketNum',
        dataIndex: 'ticketNum',
        title: i18n('ticket-list-table-th-ticketNum', '流水号'),
        sorter: BUILTIN_DATAINDEX.has('ticketNum'),
        sortOrder: orderBy === 'ticketNum' ? sortRule : false,
        width: columnWidthMap.has('ticketNum') ? columnWidthMap.get('ticketNum') : 200,
        render: (text, record) => {
          const isAgile = this.props.location.pathname.includes('ticket/agile')
          const isPortal = window.location.href.includes('portal')
          const wrapType = wrapTypeMap.has('ticketNum') ? wrapTypeMap.get('ticketNum') : ''
          let width =
            columnWidthMap.has('ticketNum') && columnWidthMap.get('ticketNum') !== 'auto'
              ? columnWidthMap.get('ticketNum') - 32 - 16
              : TD_WIDTH - 32 - 16
          return (
            <div className="ticketNumTd">
              <TicketDetailLink
                {...{ text, record }}
                source={this.props.source}
                handleTicketDetail={this.props.handleTicketDetail}
              >
                <div className={wrapTypeMap.has('ticketNum') ? wrapTypeMap.get('ticketNum') : ''}>
                  {this.renderColumnBywrapTypeMap({ text, wrapType, width })}
                  {!isAgile && !isPortal && (
                    <Tooltip placement="top" title="新窗口打开工单">
                      <i
                        className="icon iconfont icon-tab_new"
                        onClick={(e) => {
                          e.stopPropagation()
                          this.handleClick(record, 'newTab')
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </TicketDetailLink>
            </div>
          )
        }
      },
      {
        key: 'processName',
        dataIndex: 'processName',
        title: i18n('ticket-list-table-th-processName', '模型'),
        sorter: BUILTIN_DATAINDEX.has('processName'),
        sortOrder: orderBy === 'processName' ? sortRule : false,
        render: (text, record) => {
          const wrapType = wrapTypeMap.has('processName') ? wrapTypeMap.get('processName') : ''
          let width =
            columnWidthMap.has('processName') && columnWidthMap.get('processName') !== 'auto'
              ? columnWidthMap.get('processName') - 32
              : TD_WIDTH - 32
          return this.renderColumnBywrapTypeMap({ text, width, wrapType })
        },
        width: columnWidthMap.has('processName') ? columnWidthMap.get('processName') : TD_WIDTH
      },
      {
        key: 'tacheName',
        title: i18n('ticket-list-table-th-tacheName', '当前节点'),
        dataIndex: 'tacheName',
        sorter: BUILTIN_DATAINDEX.has('tacheName'),
        sortOrder: orderBy === 'tacheName' ? sortRule : false,
        width: columnWidthMap.has('tacheName') ? columnWidthMap.get('tacheName') : TD_WIDTH,
        render: (text, record) => {
          const { parallelismGroupName, tacheType } = record
          return (
            <div className="ticket-list-parallel">
              {tacheType === 2 && (
                <Tooltip
                  title={`${i18n(
                    'ticket.list.parallelismGroupName',
                    '并行组：'
                  )}${parallelismGroupName}`}
                  placement="top"
                >
                  <i className="iconfont icon-binghangzu table-list-btn-available" />
                </Tooltip>
              )}
              <span>{text}</span>
            </div>
          )
        }
      },
      {
        key: 'activityStageName',
        title: '当前阶段',
        dataIndex: 'activityStageName',
        width: columnWidthMap.has('activityStageName')
          ? columnWidthMap.get('activityStageName')
          : TD_WIDTH,
        render: (text, record) => record?.activityStageName
      },
      {
        key: 'priority',
        title: i18n('ticket-list-table-th-priority', '优先级'),
        dataIndex: 'priority',
        width: columnWidthMap.has('priority') ? columnWidthMap.get('priority') : 100,
        sorter: BUILTIN_DATAINDEX.has('priority'),
        sortOrder: orderBy === 'priority' ? sortRule : false,
        render: (text, record) => {
          return this._renderPriority(text)
        }
      },
      {
        key: 'status',
        title: i18n('ticket-list-table-th-status', '工单状态'),
        dataIndex: 'status',
        sorter: BUILTIN_DATAINDEX.has('status'),
        sortOrder: orderBy === 'status' ? sortRule : false,
        width: columnWidthMap.has('status') ? columnWidthMap.get('status') : 110,
        render: (text) => {
          const { name, color } = this._renderStatus(text)
          return (
            <span className="ticket-list-table-th-status">
              <i style={{ background: color }} />
              {name}
            </span>
          )
        }
      },
      {
        key: 'creatorName',
        title: i18n('ticket-list-table-th-creatorName', '创建人'),
        dataIndex: 'creatorName',
        sorter: BUILTIN_DATAINDEX.has('creatorName'),
        sortOrder: orderBy === 'creatorName' ? sortRule : false,
        width: columnWidthMap.has('creatorName') ? columnWidthMap.get('creatorName') : TD_WIDTH,
        render: (text, record) => {
          const wrapType = wrapTypeMap.has('creatorName') ? wrapTypeMap.get('creatorName') : ''
          let width =
            columnWidthMap.has('creatorName') && columnWidthMap.get('creatorName') !== 'auto'
              ? columnWidthMap.get('creatorName') - 32
              : TD_WIDTH - 32
          return this.renderColumnBywrapTypeMap({ text, width, wrapType })
        }
      },
      {
        key: 'executorAndGroup',
        title: '处理人/处理组',
        width: columnWidthMap.has('executorAndGroup')
          ? columnWidthMap.get('executorAndGroup')
          : 190,
        render: (record) => {
          const { excutors, executionGroup } = record
          const excutorsStr = excutors.join(',')
          const executionGroupStr = executionGroup.join(',')
          let allexcutorsStr = `${excutorsStr}`
          if (!!excutorsStr && !!executionGroupStr) {
            allexcutorsStr += `/${executionGroupStr}`
          } else if (!excutorsStr && !!executionGroupStr) {
            allexcutorsStr = executionGroupStr
          }
          let width = columnWidthMap.has('executorAndGroup')
            ? columnWidthMap.get('executorAndGroup') - 32
            : 158
          const wrapType = wrapTypeMap.has('executorAndGroup')
            ? wrapTypeMap.get('executorAndGroup')
            : ''
          return this.renderColumnBywrapTypeMap({ text: allexcutorsStr, width, wrapType })
        }
      },
      {
        key: 'creatorTime',
        title: i18n('ticket-list-table-th-creator_time', '创建时间'),
        dataIndex: 'creatorTime',
        width: columnWidthMap.has('creatorTime') ? columnWidthMap.get('creatorTime') : 140,
        sorter: BUILTIN_DATAINDEX.has('creatorTime'),
        sortOrder: orderBy === 'creatorTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        key: 'updateTime',
        width: columnWidthMap.has('updateTime') ? columnWidthMap.get('updateTime') : 140,
        dataIndex: 'updateTime',
        title: i18n('ticket-list-table-th-update_time', '更新时间'),
        sorter: BUILTIN_DATAINDEX.has('updateTime'),
        sortOrder: orderBy === 'updateTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm:ss')
      }
    ]
    if (paramsType === 'all') {
      columns.push({
        key: 'participants',
        title: i18n('participant', '参与人'),
        dataIndex: 'participants',
        render: (text, record) => {
          let participantsStr = ''
          if (Array.isArray(text) && text.length > 0) {
            participantsStr = text.join(',')
          }
          let width = columnWidthMap.has('participant')
            ? columnWidthMap.get('participant') - 32
            : 158
          const wrapType = wrapTypeMap.has('participants') ? wrapTypeMap.get('participants') : ''
          return this.renderColumnBywrapTypeMap({ text: participantsStr, width, wrapType })
        },
        width: columnWidthMap.has('participants') ? columnWidthMap.get('participants') : 190
      })
    }
    if (!_.isEmpty(ticketList)) {
      const caseId = _.get(ticketList, '[0].caseId')
      const extendedColumn = ticketAttributeList[caseId]
      _.forEach(extendedColumn, (item) => {
        const code = item.modelId ? `${item.modelId}_${item.code}` : item.code
        columns.push({
          key: code,
          dataIndex: code,
          title: item.name,
          width: columnWidthMap.has(code) ? columnWidthMap.get(code) : TD_WIDTH,
          sorter: BUILTIN_MENUCODE.has(filterType) ? false : SOTERFIELDTYPES.has(item.type),
          sortOrder: orderBy === code ? sortRule : false,
          render: (text, record) => {
            const current = ticketAttributeList[record.caseId]
            const data =
              _.find(
                current,
                (data) => (data.modelId ? `${data.modelId}_${data.code}` : data.code) === code
              ) || {}
            const { value, type, timeGranularity } = data
            if (value == null) return ''
            if (data.code === 'title') {
              const isHandling = isBatchHandling && handlingTicketIdList.includes(record.ticketId)
              const wrapType = wrapTypeMap.has('title') ? wrapTypeMap.get('title') : ''
              let width =
                columnWidthMap.has('title') && columnWidthMap.get('title') !== 'auto'
                  ? columnWidthMap.get('title') - 32
                  : TD_WIDTH - 32
              return (
                // <TicketDetailLink
                //   {...{ text: value, record }}
                //   source={this.props.source}
                //   handleTicketDetail={this.props.handleTicketDetail}
                // >
                <TicketTitle
                  record={record}
                  isHandling={isHandling}
                  wrapType={wrapType}
                  width={width}
                  renderColumnBywrapTypeMap={this.renderColumnBywrapTypeMap}
                />
                // </TicketDetailLink>
              )
            }
            if (data.code === 'flowNoBuiltIn') {
              return (
                <TicketDetailLink
                  {...{ text: value, record }}
                  source={this.props.source}
                  handleTicketDetail={this.props.handleTicketDetail}
                >
                  {value}
                </TicketDetailLink>
              )
            }
            switch (type) {
              case 'dateTime':
                return moment(value).format('YYYY-MM-DD HH:mm:ss')
              case 'tags':
                return _.map(parseTagsDataToArray(value), (item, index) => (
                  <Tag key={index}>{item}</Tag>
                ))
              case 'links':
                return (
                  <a
                    target="_blank"
                    href={`${value.linkProtocol}${value.linkUrl}`}
                    rel="noreferrer"
                  >
                    {value.linkName}
                  </a>
                )
              case 'jsontext':
                return (
                  <Tooltip title={value}>
                    <div className="table-jsontext">{value}</div>
                  </Tooltip>
                )
              default:
                let width = columnWidthMap.has(code) ? columnWidthMap.get(code) - 32 : 158
                const wrapType = wrapTypeMap.has(code) ? wrapTypeMap.get(code) : ''
                return this.renderColumnBywrapTypeMap({ text: value, width, wrapType })
            }
          }
        })
      })
    } else {
      _.forEach(columnSelectedList || [], (item) => {
        const code = item.modelId ? `${item.modelId}_${item.code}` : item.code
        columns.push({
          key: code,
          dataIndex: code,
          title: item.name,
          width: columnWidthMap.has(code) ? columnWidthMap.get(code) : TD_WIDTH,
          sorter: BUILTIN_MENUCODE.has(filterType) ? false : SOTERFIELDTYPES.has(item.type),
          sortOrder: orderBy === code ? sortRule : false,
          render: (text, record) => {
            const current = ticketAttributeList[record.caseId]
            const data =
              _.find(
                current,
                (data) => (data.modelId ? `${data.modelId}_${data.code}` : data.code) === code
              ) || {}
            const { value, type, timeGranularity } = data
            if (value == null) return ''
            if (data.code === 'title') {
              const isHandling = isBatchHandling && handlingTicketIdList.includes(record.ticketId)
              return (
                <TicketDetailLink
                  {...{ text: value, record }}
                  source={this.props.source}
                  handleTicketDetail={this.props.handleTicketDetail}
                >
                  <TicketTitle record={record} isHandling={isHandling} />
                </TicketDetailLink>
              )
            }
            if (data.code === 'flowNoBuiltIn') {
              return (
                <TicketDetailLink
                  {...{ text: value, record }}
                  source={this.props.source}
                  handleTicketDetail={this.props.handleTicketDetail}
                >
                  {value}
                </TicketDetailLink>
              )
            }
            switch (type) {
              case 'dateTime':
                return moment(value).format('YYYY-MM-DD HH:mm:ss')
              case 'tags':
                return _.map(parseTagsDataToArray(value), (item, index) => (
                  <Tag key={index}>{item}</Tag>
                ))
              case 'links':
                return (
                  <a
                    target="_blank"
                    href={`${value.linkProtocol}${value.linkUrl}`}
                    rel="noreferrer"
                  >
                    {value.linkName}
                  </a>
                )
              case 'jsontext':
                return (
                  <Tooltip title={value}>
                    <div className="table-jsontext">{value}</div>
                  </Tooltip>
                )
              default:
                let width = columnWidthMap.has(code) ? columnWidthMap.get(code) - 32 : 158
                const wrapType = wrapTypeMap.has(code) ? wrapTypeMap.get(code) : ''
                return this.renderColumnBywrapTypeMap({ text: value, width, wrapType })
            }
          }
        })
      })
      columns = _.uniqBy(columns, 'key')
    }
    const columnSelectedCode = toJS(columnSelectedList).map((item) =>
      item.modelId ? `${item.modelId}_${item.code}` : item.code
    )
    // 按照查询器那边进行列的排序
    const newColumns = _.chain(columns)
      .filter((item) => _.includes(columnSelectedCode, item.key))
      .sortBy((item) => _.indexOf(columnSelectedCode, item.key))
      .value()

    return {
      columns: newColumns,
      scroll: { x: 'max-content', y: this.state.tableHight }
    }
  }

  handleSortTable = (pagination, filters, sorter) => {
    const { pageSize, query } = this.props.listStore

    const getNewSortRule = (item) => {
      if (_.isEmpty(sorter) || query.orderBy === sorter.field) {
        return item === 'descend' ? 'ascend' : 'descend'
      }
      return 'descend'
    }

    const { field: orderBy } = sorter

    const newQuery = _.assign({}, query, {
      orderBy: orderBy || query.orderBy,
      sortRule: getNewSortRule(query.sortRule)
    })

    this.props.listStore.setCurrentAndPageSize(1, pageSize)
    this.props.listStore.setQuery(newQuery)
    // 提供一个覆盖请求方法的机会
    if (typeof this.props.getList === 'function') {
      this.props.getList()
    } else {
      this.props.listStore.getList()
    }
  }

  render() {
    const { ticketList, loading, selectedRowKeys, filterType } = this.props.listStore
    const { onRowSelectionChange } = this.props
    const isShowRowSelection = getShowRowSelection(filterType, onRowSelectionChange)
    const { columns, scroll } = this._renderColumns(isShowRowSelection)
    console.log('columns', columns)
    const rowSelection = {
      columnWidth: 32,
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        typeof onRowSelectionChange === 'function'
          ? onRowSelectionChange(selectedRowKeys, selectedRows)
          : this.props.listStore.setSelectedRowKeys(selectedRowKeys, selectedRows)
      }
    }
    const dilver = {
      loading,
      columns,
      dataSource: toJS(ticketList),
      pagination: false,
      showScrollArrows: true,
      scrollArrowsStep: 500,
      onChange: this.handleSortTable,
      rowKey: (record) => {
        const { ticketId, tacheId, caseId } = record
        return ticketId + tacheId + caseId
      }
    }
    if (isShowRowSelection) dilver.rowSelection = rowSelection
    if (scroll) {
      dilver.scroll = isShowRowSelection ? { x: scroll.x, y: this.state.tableHight } : scroll
    }
    if (this.props?.source === 'npm') {
      dilver.scroll = { x: scroll.x }
    }
    return (
      <div className="rebuild-ticket-list-table-wrap">
        <Table {...dilver} />
      </div>
    )
  }
}
export default withRouter(TicketTable)

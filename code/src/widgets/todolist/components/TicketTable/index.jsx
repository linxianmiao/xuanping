import React, { Component } from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { Table, Tooltip, Tag, Drawer } from '@uyun/components'
import TicketTitle from './TicketTitle'
import styles from './index.module.less'
import { i18n } from '../../i18n'
import { parseTagsDataToArray } from '../../logic'

@observer
class TicketTable extends Component {
  @inject('listStore') listStore
  @inject('widget') widget

  constructor(props, context) {
    super(props, context)
    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    } else {
      this.windowWin = window
    }
    this.state = {
      forceClose: false,
      visible: false,
      currentRecord: {}
    }
  }

  // 监听iframe返回
  componentDidMount() {
    this.windowWin.addEventListener('message', this.receiveMessage, false)
  }

  receiveMessage = (event) => {
    const { createTicket, nextTacheData } = event.data
    if (createTicket === 'success') {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        if (nextTacheData.canContinueApprove) {
          const { ticketId, caseId, activityId, title } = nextTacheData
          const { currentRecord } = this.state
          const { modelId, tacheNo, tacheType } = currentRecord
          this.setState(
            {
              currentRecord: {
                modelId,
                tacheNo,
                tacheType,
                ticketId,
                caseId,
                ticketName: title,
                tacheId: activityId
              }
            },
            () => {
              const iframe = document.getElementById('iframe-ticket-detail-todolist')
              const iframeSrc = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&caseId=${caseId}&tacheId=${activityId}&modelId=${modelId}&tacheNo=${tacheNo}&tacheType=${tacheType}`
              iframe.src = iframeSrc
              iframe.contentWindow.location.reload(true)
            }
          )
        } else {
          this.onClose()
        }
        this.listStore.getList()
      }, 300)
    }
  }
  destroyIframe = () => {
    const iframe = document.getElementById('iframe-ticket-detail-todolist')
    try {
      iframe.src = 'about:blank'
      iframe.contentWindow.document.write('')
      iframe.contentWindow.document.clear()
    } catch (e) {}
  }
  onClose = () => {
    this.setState({ visible: false, currentRecord: {} })
    this.destroyIframe()
  }
  componentWillUnmount() {
    this.windowWin.removeEventListener('message', this.receiveMessage, false)
  }

  _renderStatus = (text) => {
    let name = ''
    let color = ''
    switch (text) {
      case 2:
        name = i18n('ticket.list.status_2', '处理中')
        color = '#30d85c'
        break // 处理中
      case 3:
        name = i18n('ticket.list.status_3', '已完成')
        color = '#0549c5'
        break // 已完成
      case 7:
        name = i18n('ticket.list.status_7', '已关闭')
        color = '#24cbac'
        break // 已关闭
      case 10:
        name = i18n('ticket.list.status_10', '挂起')
        color = '#ec4e53'
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
        color = '#4abafd'
        break // 待处理
    }
    return { name, color }
  }

  _renderPriority = (text) => {
    const { ticketUrgentLevelList } = this.listStore
    const { name, color } =
      _.find(ticketUrgentLevelList, (item) => String(item.value) === String(text)) || {}
    if (name) {
      return (
        <span className={'table-th-priority'} style={{ background: color }}>
          {name}
        </span>
      )
    }
    return '--'
  }

  _renderColumns = () => {
    const { checkedColumnCodes, ticketList, query, ticketAttributeList } = this.listStore
    const { orderBy, sortRule } = query
    const columns = [
      {
        key: 'ticketName',
        title: i18n('ticket-list-table-th-title', '工单标题'),
        dataIndex: 'ticketName',
        width: 150,
        render: (_, record) => (
          <TicketTitle record={record} handelTicketDetail={this.handelTicketDetail} />
        )
      },
      {
        key: 'ticketNum',
        title: i18n('ticket-list-table-th-ticketNum', '流水号'),
        dataIndex: 'ticketNum',
        width: 150,
        render: (_, record) => (
          <TicketTitle
            record={record}
            handelTicketDetail={this.handelTicketDetail}
            typeSource="ticketNum"
          />
        )
      },
      {
        key: 'processName',
        title: i18n('ticket-list-table-th-processName', '模型'),
        dataIndex: 'processName',
        width: 150
      },
      {
        key: 'tacheName',
        title: i18n('ticket-list-table-th-tacheName', '当前节点'),
        dataIndex: 'tacheName',
        width: 150,
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
        key: 'priority',
        title: i18n('ticket-list-table-th-priority', '优先级'),
        dataIndex: 'priority',
        width: 100,
        sorter: true,
        sortOrder: orderBy === 'priority' ? sortRule : false,
        render: this._renderPriority
      },
      {
        key: 'status',
        title: i18n('ticket-list-table-th-status', '工单状态'),
        dataIndex: 'status',
        width: 150,
        sorter: true,
        sortOrder: orderBy === 'status' ? sortRule : false,
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
        width: 150
      },
      {
        key: 'executorAndGroup',
        title: '处理人/处理组',
        width: 190,
        render: (record) => {
          const { excutors, executionGroup } = record
          const excutorsStr = excutors.join(',')
          const executionGroupStr = executionGroup.join(',')
          return (
            <>
              <Tooltip title={<div className="break-all">{excutorsStr}</div>}>
                <span style={{ display: 'inline-block', maxWidth: 82 }} className={styles.shenglue}>
                  {excutorsStr}
                </span>
              </Tooltip>
              {!!excutorsStr && !!executionGroupStr && (
                <span style={{ display: 'inline-block', verticalAlign: 'top' }}>/</span>
              )}
              <Tooltip title={<div className="break-all">{executionGroupStr}</div>}>
                <span style={{ display: 'inline-block', maxWidth: 82 }} className={styles.shenglue}>
                  {executionGroupStr}
                </span>
              </Tooltip>
            </>
          )
        }
      },
      {
        key: 'creatorTime',
        title: i18n('ticket-list-table-th-creator_time', '创建时间'),
        dataIndex: 'creatorTime',
        width: 150,
        sorter: true,
        sortOrder: orderBy === 'creatorTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
      },
      {
        key: 'updateTime',
        title: i18n('ticket-list-table-th-update_time', '更新时间'),
        dataIndex: 'updateTime',
        width: 140,
        sorter: true,
        sortOrder: orderBy === 'updateTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
      }
    ]

    if (!_.isEmpty(ticketList)) {
      const caseId = _.get(ticketList, '[0].caseId')
      const extendedColumn = ticketAttributeList[caseId]
      _.forEach(extendedColumn, (item) => {
        columns.push({
          key: item.code,
          dataIndex: item.code,
          title: item.name,
          sortOrder: orderBy === item.code ? sortRule : false,
          sorter: item.type === 'dateTime', // 时间字段可以支持排序
          width: 150,
          render: (text, record) => {
            const current = ticketAttributeList[record.caseId]
            const data = _.find(current, (data) => data.code === item.code) || {}
            const { value, type } = data

            if (_.isEmpty(value)) return ''
            switch (type) {
              case 'dateTime':
                return moment(value).utc(moment(value).zone()).format('YYYY-MM-DD HH:mm')
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
              default:
                return value
            }
          }
        })
      })
    }

    const newColumns = []
    checkedColumnCodes.forEach((code) => {
      const column = columns.find((item) => item.key === code)
      if (column) {
        newColumns.push(column)
      }
    })

    const width =
      document.querySelector('#rebuild-ticket-list-wrap')?.getBoundingClientRect().width || 1000
    const scrollXWidth = newColumns.map((item) => item.width).reduce((sum, item) => sum + item, 0)
    if (scrollXWidth > width) {
      newColumns[0].fixed = true
      newColumns.push({ title: '', fixed: 'right' })
    } else {
      for (const item of newColumns) {
        item.width = (item.width / scrollXWidth) * width
      }
    }

    return {
      columns: newColumns,
      scroll: scrollXWidth > width ? { x: scrollXWidth } : false
    }
  }

  handleSortTable = (pagination, filters, sorter) => {
    const { query } = this.listStore

    const getNewSortRule = (item) => {
      if (_.isEmpty(sorter) || query.orderBy === sorter.field) {
        return item === 'descend' ? 'ascend' : 'descend'
      }
      return 'descend'
    }

    const { current, pageSize } = pagination
    const { field: orderBy } = sorter

    const newQuery = _.assign({}, query, {
      orderBy: orderBy || query.orderBy,
      sortRule: getNewSortRule(query.sortRule)
    })
    this.listStore.setCurrentAndPageSize(current, pageSize)
    this.listStore.setQuery(newQuery)
    this.listStore.getList()
  }

  handelTicketDetail = (visible, obj) => {
    const { ticketId, caseId, tacheId, modelId, tacheNo, tacheType } = obj
    const iframeSrc = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&caseId=${caseId}&tacheId=${tacheId}&modelId=${modelId}&tacheNo=${tacheNo}&tacheType=${tacheType}`
    this.setState({ visible, currentRecord: obj, iframeSrc })
  }

  render() {
    const { ticketList, loading, current, pageSize, count } = this.listStore
    const { columns, scroll } = this._renderColumns()
    const pagination = {
      total: count,
      pageSize,
      current,
      hideOnSinglePage: true
    }

    const tableProps = {
      loading,
      columns,
      pagination,
      dataSource: ticketList,
      showScrollArrows: true,
      onChange: this.handleSortTable,
      rowKey: (record) => record.ticketId + record.tacheId + record.caseId
    }
    if (scroll) tableProps.scroll = scroll

    const { visible, currentRecord, iframeSrc } = this.state
    console.log('重新渲染iframeSrc', iframeSrc)
    return (
      <div className={styles.ticketListTable}>
        <Table {...tableProps} />

        <Drawer
          title={currentRecord.ticketName}
          visible={visible}
          onClose={this.onClose}
          className={styles.drawerIframe}
          bodyStyle={{
            overflow: 'hidden'
          }}
        >
          <iframe
            id="iframe-ticket-detail-todolist"
            src={iframeSrc}
            width="100%"
            height="100%"
            scrolling="yes"
            frameBorder={0}
          />
        </Drawer>
      </div>
    )
  }
}
export default TicketTable

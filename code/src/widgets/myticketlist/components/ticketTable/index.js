import React, { Component, useState, useEffect } from 'react'
import moment from 'moment'
import { inject } from '@uyun/core'
import { observer } from 'mobx-react'
import { Table, Tooltip, Pagination, message, Modal, Tag } from '@uyun/components'
import { TicketlistStore } from '../../ticketlist.store'
import TicketTitle from './TicketTitle'
import styles from '../../ticketlist.module.less'
import { icons } from './icons'
import _ from 'lodash'
import { parseTagsDataToArray } from '../../logic'

const CancelAttentiontSvg = () => (
  <svg viewBox="0 0 1024 1024" width="16" height="16">
    <path
      d="M470.264 147.739L349.228 324.344l-205.363 60.538a50 50 0 0 0-16.353 8.332l-0.651 0.51c-21.314 16.956-25.157 47.94-8.486 69.608l130.559 169.684-5.886 214.021a50 50 0 0 0 2.871 18.127l0.284 0.777c9.54 25.51 37.82 38.74 63.579 29.58l201.726-71.734 201.726 71.735a50 50 0 0 0 18.127 2.87l0.826-0.029c27.21-1.19 48.532-23.998 47.78-51.326l-5.886-214.02 130.56-169.685a50 50 0 0 0 8.332-16.353l0.227-0.795c7.277-26.246-7.827-53.572-34.05-61.302l-205.363-60.538L552.75 147.74a50 50 0 0 0-12.977-12.978c-22.778-15.61-53.899-9.8-69.51 12.978z m41.244 60.105l109.806 160.222 0.351 0.506a50 50 0 0 0 26.755 19.187l186.31 54.921-118.446 153.944-0.379 0.499a50 50 0 0 0-9.974 31.366l5.34 194.162-183.01-65.077-0.604-0.21a50 50 0 0 0-32.902 0.21L311.744 822.65l5.341-194.162 0.013-0.627a50 50 0 0 0-10.367-31.238L188.284 442.68l186.311-54.92a50 50 0 0 0 27.106-19.694l109.807-160.222z"
      fill="#FFB91A"
    />
  </svg>
)

const AttentionSvg = () => (
  <svg viewBox="0 0 1024 1024" width="16" height="16">
    <path
      d="M509.956458 125.700887l126.648468 241.487983 257.600963 52.040237L714.888873 620.511389l32.546254 273.694499-237.478669-117.137861-237.491972 117.137861 32.558533-273.694499L125.700887 419.229107l257.600963-52.040237L509.956458 125.700887"
      fill="#FFB91A"
      data-spm-anchor-id="a313x.search_index.0.i17.17a93a81mHwWnH"
      className="selected"
    />
  </svg>
)

const CancelAttentionIcon = (props) => (
  <span className="uyunicon">
    <CancelAttentiontSvg />
  </span>
)
const AttentionIcon = (props) => (
  <span className="uyunicon">
    <AttentionSvg />
  </span>
)

function ListAttention(props) {
  const { isAttention, data, onCollect } = props

  const [attention, setIsAttention] = useState(isAttention)

  useEffect(() => {
    setIsAttention(isAttention)
  }, [isAttention])

  const handleHeartClick = (e) => {
    e.stopPropagation()

    const nextCollect = attention === 1 ? 0 : 1
    onCollect(attention, data).then((res) => {
      if (res) {
        setIsAttention(nextCollect)
      }
    })
  }

  return (
    <div style={{ marginRight: '10px' }} onClick={handleHeartClick} key={data}>
      {attention === 0 ? <CancelAttentionIcon /> : <AttentionIcon />}
    </div>
  )
}

const i18n = (a, b) => b

@observer
class TicketTable extends Component {
  @inject(TicketlistStore) store

  @inject('i18n') i18n

  state = {
    treeList: [],
    currentItem: [],
    open: false,
    visible: false,
    selectedValue: '',
    tableHight: 600
  }

  componentDidMount() {
    this.resizeUpdate()
    window.addEventListener('resize', this.resizeUpdate)

    const btn = document.querySelector('.js-itsm-filter-btn')

    btn?.addEventListener('click', this.changeHight)

    btn?.addEventListener('DOMNodeInserted', this.changeHight)
  }

  changeHight = () => {
    setTimeout(() => {
      this.resizeUpdate()
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeUpdate)
    const btn = document.querySelector('.js-itsm-filter-btn')
    btn?.removeEventListener('click', this.changeHight)
    btn?.removeEventListener('DOMNodeInserted', this.changeHight)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeKey !== this.props.activeKey) {
      this.resizeUpdate()
    }
  }

  resizeUpdate = () => {
    let height = document.querySelector('#itsm-ticket-list')?.getBoundingClientRect().height || 600
    let filterHight =
      document.querySelector('#ticket-filter-wrap')?.getBoundingClientRect().height || 0
    height = height - 255 - filterHight
    this.setState({ tableHight: height })
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
    const { ticketUrgentLevelList } = this.store
    const { name, color } =
      _.find(ticketUrgentLevelList, (item) => String(item?.value) === String(text)) || {}
    if (name) {
      return (
        <span className={'table-th-priority'} style={{ background: color }}>
          {name}
        </span>
      )
    }
    return '--'
  }

  handleCollect = async (attention, item) => {
    const { ticketId, processId, appInfoVo } = item
    window.PROTAL_APP_KEY = appInfoVo?.appkey
    const res = await this.store.attentionTicket(ticketId, attention, processId)
    window.PROTAL_APP_KEY = ''
    if (res === '200') {
      const msg = attention === 1 ? '取消关注' : '已关注'
      message.success(msg)
      this.store.getTabCount()
      return res
    }
  }

  move = async (record) => {
    this.setState({ currentItem: [record.ticketId], open: true })
  }

  _renderColumns = () => {
    const { myAttentionList } = this.props
    const { ticketAttributeList, ticketList, checkedColumnCodes } = this.store
    const { orderBy, sortRule, filterType } = this.store.query || {}
    const columns = [
      {
        key: 'ticketNum',
        title: i18n('ticket-list-table-th-ticketNum', '单号'),
        dataIndex: 'ticketNum',
        width: 220,
        render: (text, record) => {
          let isAttention = record.isAttention || 0
          const list =
            _.filter(
              myAttentionList,
              (item) =>
                item.ticketId === record.ticketId &&
                item.tacheId === record.tacheId &&
                item.caseId === record.caseId
            ) || []
          if (!_.isEmpty(list)) {
            isAttention = list[0].isAttention
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              {['mypartin', 'mycreate', 'myfollow', 'myapprove', 'mytodo'].includes(filterType) ? (
                <ListAttention
                  isAttention={isAttention}
                  data={record}
                  onCollect={this.handleCollect}
                />
              ) : null}
              <TicketTitle record={record} handleDetailTicket={this.props.handleDetailTicket}>
                {text}
              </TicketTitle>
            </div>
          )
        }
      },
      {
        key: 'ticketName',
        title: i18n('ticket-list-table-th-title', '名称'),
        dataIndex: 'ticketName',
        width: 275
      },
      {
        key: 'processName',
        title: '服务类型',
        dataIndex: 'processName',
        width: 200,
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft">
              <span className={styles.tableText}>{text}</span>
            </Tooltip>
          )
        }
      },
      // {
      //   key: 'status',
      //   title: '流程状态',
      //   dataIndex: 'status',
      //   width: 143,
      //   sorter: true,
      //   sortOrder: orderBy === 'status' ? sortRule : false,
      //   render: (text) => {
      //     const { name, color } = this._renderStatus(text)
      //     return (
      //       <span className={styles['ticket-list-table-th-status']}>
      //         <i style={{ background: color }} />
      //         {name}
      //       </span>
      //     )
      //   }
      // },
      {
        key: 'tacheName',
        title: '当前环节',
        dataIndex: 'tacheName',
        width: 145,
        render: (text, record) => {
          const { parallelismGroupName, tacheType } = record
          return (
            <div>
              {tacheType === 2 && (
                <Tooltip
                  title={
                    i18n('ticket.list.parallelismGroupName', '并行组：') + '' + parallelismGroupName
                  }
                  placement="top"
                >
                  <span className="uyunicon">{icons.Binghangzu}</span>
                </Tooltip>
              )}
              <span>{text}</span>
            </div>
          )
        }
      },
      {
        key: 'executorAndGroup',
        title: '处理人/处理组',
        dataIndex: 'executorAndGroup',
        width: 168,
        render: (text, record) => {
          const { excutors, executionGroup } = record
          const excutorsStr = excutors && excutors.join(',')
          const executionGroupStr = executionGroup && executionGroup.join(',')
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
        key: 'updateTime',
        title: i18n('ticket-list-table-th-update_time', '更新时间'),
        dataIndex: 'updateTime',
        width: 170.93,
        sorter: true,
        sortOrder: orderBy === 'updateTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
      },
      {
        key: 'departorName', // 处理人/组
        title: i18n('ticket-list-table-th-department', '创建人部门'),
        dataIndex: 'departorName',
        width: 168,
        render: (text, record) => {
          let txt = ''
          if (!_.isEmpty(text) && Array.isArray(text)) {
            txt = text.join(',')
          }
          return txt
        }
      },
      {
        key: 'creatorName',
        title: i18n('ticket-list-table-th-creatorName', '创建人'),
        dataIndex: 'creatorName',
        width: 115
      },
      {
        key: 'creatorTime',
        title: i18n('ticket-list-table-th-creator_time', '创建时间'),
        dataIndex: 'creatorTime',
        width: 170.93,
        sorter: true,
        sortOrder: orderBy === 'creatorTime' ? sortRule : false,
        render: (text) => moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
      }
    ]

    if (!_.isEmpty(ticketList) && filterType === 'all') {
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
    // 按照查询器那边进行列的排序
    // let newColumns = _.chain(columns)
    //   .filter((item) => _.includes(ticketAttributeList, item.key))
    //   .sortBy((item) => _.indexOf(ticketAttributeList, item.key))
    //   ?.value()
    let newColumns = []
    if (filterType === 'all') {
      checkedColumnCodes.forEach((code) => {
        const column = columns.find((item) => item.key === code)
        if (column) {
          newColumns.push(column)
        }
      })
    } else {
      newColumns = _.cloneDeep(columns)
    }

    if (filterType === 'myfollow') {
      newColumns.push({
        key: 'operate',
        title: '操作',
        dataIndex: 'operate',
        fixed: 'right',
        width: 80,
        render: (text, record) => (
          <a onClick={() => this.props.handleMove([record.ticketId])}>移动</a>
        )
      })
    } else if (filterType === 'mydrafts') {
      newColumns = [
        {
          title: '名称',
          dataIndex: 'title',
          key: 'title',
          width: '25%',
          render: (text, recode) => (
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <TicketTitle
                record={recode}
                handleDetailTicket={this.props.handleDetailTicket}
                source="mydrafts"
              >
                {text}
              </TicketTitle>
            </div>
          )
        },
        {
          title: '流水号',
          dataIndex: 'flowNo',
          key: 'flowNo',
          width: '20%',
          render: (text) => text || '--'
        },
        {
          title: '模型',
          dataIndex: 'ticketType',
          width: '20%',
          key: 'ticketType'
        },
        {
          title: '创建时间',
          width: '25%',
          dataIndex: 'saveTime',
          key: 'saveTime',
          render: (text, recode) => (
            <span>{moment(recode.saveTime).format('YYYY-MM-DD HH:mm')}</span>
          )
        },
        {
          title: '操作',
          key: 'operate',
          width: '10%',
          render: (text, record) => (
            <a
              onClick={() => {
                this.handleDelete(record)
              }}
            >
              {'删除'}
            </a>
          )
        }
      ]
    }

    newColumns[0].width = 220

    // 如果表格宽度大于可是区域就固定标题
    const width =
      document.querySelector('#rebuild-ticket-list-wrap')?.getBoundingClientRect().width || 1000 // 内容区域的宽度不包含padding
    const scrollXWidth = newColumns.map((item) => item.width).reduce((sum, item) => sum + item, 0)

    if (scrollXWidth > width) {
      newColumns[0].fixed = true
      // if (filterType !== 'myfollow') newColumns[newColumns.length - 1].fixed = 'right'
    } else {
      for (const item of newColumns) {
        item.width = (item.width / scrollXWidth) * width
      }
    }
    return {
      columns: newColumns,
      scroll: scrollXWidth > width ? { x: scrollXWidth, y: this.state.tableHight } : false
    }
  }

  handleDelete = (item) => {
    const { id, appInfoVo } = item
    Modal.confirm({
      title: '确认删除吗？',
      onOk: async () => {
        window.PROTAL_APP_KEY = appInfoVo?.appkey
        const res = await this.store.deleteTicketCache(id)
        window.PROTAL_APP_KEY = ''
        if (res === '200') {
          message.success('删除成功')
          this.props?.getList()
        } else {
          message.error('删除失败')
        }
      }
    })
  }

  handleSortTable = (pagination, filters, sorter) => {
    const { query } = this.store
    const { pageSize } = this.store.query
    const { field: orderBy, order } = sorter
    // const getNewSortRule = (item) => {
    //   if (_.isEmpty(sorter) || query.orderBy === sorter.field) {
    //     return item === 'descend' ? 'ascend' : 'descend'
    //   }
    //   return 'descend'
    // }
    this.store.setValue(
      _.assign({}, query, {
        pageNum: 1,
        pageSize,
        orderBy: orderBy || query.orderBy,
        sortRule: order
      }),
      'query'
    )
  }

  getTreeList = async (code) => {
    const { createUser } = this.props
    const res = await this.store.queryTreeList(code, createUser)
    let list = []
    if (res && Array.isArray(res)) {
      list = _.map(res, (item) => {
        return {
          id: item.id,
          value: item.classifyCode,
          title: item.classifyName,
          pId: item.superCode,
          isLeaf: item.classifyName === '默认分组' ? true : false
        }
      })
    }
    this.setState({ treeList: list })
  }

  onDropdownVisibleChange = (open) => {
    this.setState({ visible: open })
    if (open) {
      this.getTreeList('')
    }
  }

  render() {
    const { ticketList, loading, query, count } = this.store
    const { pageNum, pageSize, filterType } = query
    const { columns, scroll } = this._renderColumns()
    const rowSelection = {
      onChange: this.props.onSelectedRow,
      selectedRowKeys: this.props?.selectedRowKeys
    }
    const tableProps = {
      loading,
      columns,
      scroll,
      rowSelection: ['myfollow', 'myapprove', 'all'].includes(filterType)
        ? rowSelection
        : undefined,
      dataSource: ticketList,
      showScrollArrows: true,
      scrollArrowsStep: 300,
      onChange: this.handleSortTable,
      pagination: false,
      rowKey: (record) => record.ticketId + record.tacheId + record.caseId
    }
    return (
      <div className={styles.ticketListTable} id="rebuild-ticket-list-wrap">
        <Table {...tableProps} />
        {count > 0 && (
          <Pagination
            style={{ float: 'right', margin: '16px 0' }}
            total={count}
            current={pageNum}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            size="small"
            onChange={(pageNum, pageSize) => {
              this.store.setValue(
                _.assign({}, query, {
                  pageNum: pageSize !== query.pageSize ? 1 : pageNum,
                  pageSize: pageSize
                }),
                'query'
              )
            }}
          />
        )}
      </div>
    )
  }
}

export default TicketTable

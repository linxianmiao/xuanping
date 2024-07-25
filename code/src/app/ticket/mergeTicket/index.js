import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Button, Tooltip, message, Table, Modal, Input, Pagination, Alert } from '@uyun/components'
import DetailDrawer from '~/details/DetailDrawer'

import { inject, observer } from 'mobx-react'
import * as mobx from 'mobx'
import moment from 'moment'

import './index.less'

const Search = Input.Search
@inject('ticketStore')
@withRouter
@observer
class MergeTicket extends Component {
  state = {
    wd: '', // 关键字
    allTickets: [], // 所有的工单列表
    visible: false,
    pageNum: 10,
    pageSize: 1,
    total: 0,
    selectedRowKeys: [],
    subDetailRoute: null, // 侧滑详情的路由数据
    title: '',
    columns: [
      {
        title: i18n('ticket.relateTicket.title', '标题'),
        dataIndex: 'title',
        key: 'title',
        width: 150,
        render: (text, record) => {
          //   return <Link
          //     to={{
          //       pathname: `/ticket/detail/${record.id}`,
          //       search: `?tacheType=0&tacheNo=0&tacheId=${record.tacheId}&modelId=${record.modelId}`
          //     }}
          //   >{ text }</Link>
          return (
            <a
              onClick={() => {
                this.getTicketDetail(record)
              }}
            >
              {text}
            </a>
          )
        }
      },
      {
        title: i18n('ticket.relateTicket.type', '关系类型'),
        dataIndex: 'ticketRelationType',
        key: 'ticketRelationType',
        render: (text) => {
          return text === 1
            ? i18n('Parent_ticke', '父单')
            : text === 2
            ? i18n('Child_ticket', '子单')
            : ''
        }
      },
      {
        title: i18n('conf.model.ruleLength', '流水号'),
        dataIndex: 'flowNoRule',
        key: 'flowNoRule'
      },
      {
        title: i18n('ticket.relateTicket.modelName', '流程类型'),
        dataIndex: 'modelName',
        key: 'modelName'
      },
      {
        title: i18n('ticket.relateTicket.activity', '流程环节'),
        dataIndex: 'activityName',
        key: 'activityName'
      },
      {
        title: i18n('ticket.relateTicket.from', '来源'),
        dataIndex: 'userInfos',
        key: 'userInfos',
        render: (text) => {
          const data = (text || [])[0] || {}
          return <div>{data.userName}</div>
        }
      },
      {
        title: i18n('ticket.list.creatorTime', '创建时间'),
        dataIndex: 'creatorTime',
        key: 'creatorTime',
        render: (text) => {
          return moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: i18n('operation', '操作'),
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => {
          const { field } = this.props
          let deleteMergeTicketFlag = field
            ? field.deleteMergeTicketFlag
            : this.props.formList?.deleteMergeTicketFlag
          return (
            <div>
              {this.props.formList?.currexcutor &&
              this.props.formList?.currexcutor.indexOf(runtimeStore.getState().user?.userId) > -1 &&
              !this.props.formList?.isReceiveTicket &&
              deleteMergeTicketFlag ? (
                <div
                  onClick={() => {
                    this.delRelation(record.id)
                  }}
                  className="relate_operate_ok"
                >
                  {i18n('delete', '删除')}
                </div>
              ) : (
                <div className="relate_operate">
                  <Tooltip title={i18n('ticket.relateTicket.tooltip1', '暂无删除权限')}>
                    {i18n('delete', '删除')}
                  </Tooltip>
                </div>
              )}
            </div>
          )
        }
      }
    ],
    modelColumns: [
      {
        title: i18n('tip17', '工单标题'),
        dataIndex: 'ticketName',
        key: 'ticketName',
        width: 150
      },
      {
        title: i18n('conf.model.ruleLength', '流水号'),
        dataIndex: 'ticketNum',
        key: 'ticketNum'
      },
      {
        title: i18n('layout_model', '模型'),
        dataIndex: 'processName',
        key: 'processName'
      },
      {
        title: i18n('ticket.list.tacheName', '当前节点'),
        dataIndex: 'tacheName',
        key: 'tacheName'
      },
      {
        title: i18n('tip23', '工单状态'),
        dataIndex: 'status',
        key: 'status',
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
        title: i18n('ticket.list.creatorTime', '创建时间'),
        dataIndex: 'creatorTime',
        key: 'creatorTime',
        render: (text) => {
          return moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
        }
      }
    ]
  }

  componentDidMount() {
    if (this.props.source !== 'formset') {
      this.getMergeTicket({ pageNum: 1 })
    }
  }

  getTicketDetail = (record) => {
    const subDetailRoute = {
      location: {
        pathname: `/ticket/detail/${record.id}`,
        search: `?tacheType=0&tacheNo=0&tacheId=${record.tacheId}&modelId=${record.modelId}&renderPager=false`
      },
      match: {
        params: { id: record.id }
      }
    }
    this.setState({
      title: record.title,
      subDetailRoute
    })
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

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  handleSearch = (value) => {
    this.setState(
      {
        pageSize: 10,
        pageNum: 1,
        wd: value
      },
      () => {
        this.getallTicket()
      }
    )
  }

  // 获取所有可以关联的工单列表
  getallTicket = () => {
    // 获取所有可以关联的工单列表
    const data = {
      pageSize: this.state.pageSize,
      pageNum: this.state.pageNum,
      modelId: [this.props.formList?.modelId],
      wd: this.state.wd,
      status: ['1', '2', '3', '7', '10']
    }
    axios.post(API.person_get_all_ticket, data).then(async (res) => {
      const count = (await axios.post(API.tickList_count, data)) || 0

      this.setState({
        allTickets: res.list,
        total: _.isNumber(count) ? count : 0
      })
    })
  }

  //  获取已经关联的工单列表
  getMergeTicket = (params) => {
    this.props.ticketStore.getMergeTicket({ ticketId: this.props.id, ...params })
  }

  // 关联工单
  handleSubmit = () => {
    const { selectedRowKeys } = this.state
    const { id } = this.props
    if (_.isEmpty(selectedRowKeys)) {
      message.warning(i18n('ticket.create.no_set1', '请选择工单'))
      return false
    }
    const data = {
      srcId: id,
      destId: selectedRowKeys.join(','),
      relationType: '5'
    }
    axios.get(API.RELATE_TICKET, { params: data }).then(() => {
      this.props.ticketStore.getTicketDetailTabCounts(id) // 关联后 刷新tab数据数量统计
      this.props.ticketStore.getProcessRecord(id, undefined, this.props.formList?.caseId) // 关联后 刷新处理记录
      this.getMergeTicket({ ticketId: id })
      this.setState({
        selectedRowKeys: [],
        wd: '',
        visible: false
      })
    })
  }

  // 删除当前合并的工单
  delRelation = (id) => {
    axios.post(API.DEL_MERGESHIP(this.props.id, id, 5)).then((res) => {
      if (res === true) {
        message.success('删除成功')
        this.getMergeTicket({ ticketId: this.props.id })
        this.props.ticketStore.getTicketDetailTabCounts(this.props.id) // 删除关联后 刷新tab数据数量统计
        this.props.ticketStore.getProcessRecord(
          this.props.id,
          undefined,
          this.props.formList?.caseId
        ) // 删除关联后 刷新处理记录
      }
    })
  }

  handleVisibleChange = () => {
    this.setState(
      {
        visible: true,
        pageSize: 10,
        pageNum: 1
      },
      () => {
        this.getallTicket()
      }
    )
  }

  handleCancel = () => {
    this.setState({
      selectedRowKeys: [],
      wd: '',
      visible: false
    })
  }

  pageChange = (page, pageSize) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize
      },
      () => {
        this.getallTicket()
      }
    )
  }

  pageChange1 = (pageNum, pageSize) => {
    this.props.ticketStore.getMergeTicket({ pageNum, pageSize, ticketId: this.props.id })
  }

  showTotal = (total) => {
    return i18n('total', '共') + total + i18n('item', '条')
  }

  onClose = () => {
    this.setState({ subDetailRoute: '' })
  }

  render() {
    const { formList, field } = this.props
    const { allTickets, total, selectedRowKeys, subDetailRoute, title } = this.state
    const mergeTicket = mobx.toJS(this.props.ticketStore.mergeTicket)
    const { mergeTicketPagination } = this.props.ticketStore
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: this.props.id === record.ticketId
      })
    }
    const pagination = {
      current: mergeTicketPagination.current,
      pageSize: mergeTicketPagination.pageSize,
      total: mergeTicketPagination.total,
      size: 'small',
      onChange: this.pageChange1
    }
    let isCanMergeTicket = field ? field.mergeTicketFlag : formList?.isCanMergeTicket
    const formStatus = formList?.status === 7 || formList?.status === 11 // 工单状态：关闭、废除 （不可关联工单）
    const isRenderMergeButton =
      formList?.currexcutor &&
      formList?.currexcutor.indexOf(runtimeStore.getState().user?.userId) > -1 &&
      !formList?.isReceiveTicket &&
      !formStatus &&
      [1, true].includes(isCanMergeTicket)
    return (
      <div className="ticket-froms-relevance">
        {isRenderMergeButton ? (
          <Button
            type="primary"
            className="ticket-forms-merge-button"
            onClick={() => {
              this.handleVisibleChange()
            }}
          >
            {i18n('ticket.add.merge', '添加合并工单')}
          </Button>
        ) : (
          ''
        )}
        <div>
          <Table
            dataSource={mergeTicket}
            columns={this.state.columns}
            pagination={pagination}
            className="SLA_table"
            rowKey="id"
            size="small"
          />
        </div>
        <Modal
          title={i18n('ticket.add.merge', '添加合并工单')}
          visible={this.state.visible}
          className="ticket-froms-relevance-model"
          width="1000px"
          maskClosable={false}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          <Alert
            message="合并到当前主单后，其余工单均被标记为合并子单。合并后的子单不能被处理，可以被查看。"
            type="info"
            showIcon
          />
          <Search
            placeholder={i18n('input_keyword', '请输入关键字')}
            enterButton
            style={{ width: 200, marginTop: '13px' }}
            onSearch={this.handleSearch}
          />
          <Table
            rowSelection={rowSelection}
            rowKey={(record) => record.ticketId}
            dataSource={allTickets}
            childrenColumnName="noNeedChildren" // 不需要树形展示，这里随便设置一个标识
            columns={this.state.modelColumns}
            pagination={false}
            className="SLA_table"
            style={{ marginTop: '21px' }}
          />
          <Pagination
            onChange={this.pageChange}
            total={total}
            size="small"
            showTotal={this.showTotal}
          />
        </Modal>
        <DetailDrawer
          visible={!!subDetailRoute}
          title={title}
          detailRoute={subDetailRoute}
          onClose={this.onClose}
        />
      </div>
    )
  }
}
export default MergeTicket

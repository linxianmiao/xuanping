import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Table, Button, message } from '@uyun/components'
import TenantSelect from '~/components/RemoteTenantSelect'
import Operation from './Operation'
import moment from 'moment'

const ButtonGroup = Button.Group

@withRouter
@observer
export default class RemoteTable extends Component {
  handleAccept = async (id, msg) => {
    const res = await axios.post(`${API.acceptRequest}?requestId=${id}&message=${msg}`)
    if (res === '200') {
      message.success('受理成功')
      this.props.remoteListStore.query()
    }
  }

  handleReject = async (id, msg) => {
    const res = await axios.post(`${API.rejectRequest}?requestId=${id}&message=${msg}`)
    if (res === '200') {
      message.success('驳回成功')
      this.props.remoteListStore.query()
    }
  }

  render() {
    const {
      data,
      loading,
      current,
      pageSize,
      total,
      filters,
      selectedTenant,
      setProps,
      onFilterFieldChange
    } = this.props.remoteListStore

    const pagination = {
      current,
      pageSize,
      total,
      onChange: (current, size) => {
        this.props.remoteListStore.setProps({ current })
        this.props.remoteListStore.query({ pageNo: current, pageSize: size })
      },
      onShowSizeChange: (current, size) => {
        this.props.remoteListStore.setProps({ pageSize: size })
        this.props.remoteListStore.query({ pageNo: current, pageSize: size })
      }
    }

    const columns = [
      {
        title: '请求节点名称',
        dataIndex: 'srcNodeName'
      },
      {
        title: '模型',
        dataIndex: 'srcModelName'
      },
      {
        title: '工单标题',
        dataIndex: 'title'
      },
      {
        title: '请求人名称',
        dataIndex: 'creatorName'
      },
      {
        title: '请求时间',
        dataIndex: 'createTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm')
      },
      {
        title: '备注',
        dataIndex: 'message'
      }
    ]

    // 未受理时，才有操作栏
    if (Number(filters.status) === 0) {
      columns.push({
        title: i18n('operation', '操作'),
        render: (record) => {
          return (
            <ButtonGroup type="link">
              <Operation type="accept" onOk={(message) => this.handleAccept(record.id, message)} />
              <Operation type="reject" onOk={(message) => this.handleReject(record.id, message)} />
            </ButtonGroup>
          )
        }
      })
    }

    // 已受理时，可以查看工单
    if (Number(filters.status) === 1) {
      columns.push({
        title: i18n('operation', '操作'),
        render: (record) => {
          return (
            <ButtonGroup type="link">
              <a onClick={() => this.props.history.push(`/ticket/detail/${record.remoteTicketId}`)}>
                {i18n('view.ticket', '查看工单')}
              </a>
            </ButtonGroup>
          )
        }
      })
    }

    return (
      <div>
        <div style={{ paddingBottom: 12 }}>
          <TenantSelect
            placeholder="请选择节点"
            allowClear
            value={selectedTenant}
            onChange={(value) => {
              setProps({ selectedTenant: value })
              onFilterFieldChange(value && value.value, 'nodeId', true)
            }}
          />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={toJS(data)}
          pagination={pagination}
        />
      </div>
    )
  }
}

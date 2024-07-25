import React, { Component } from 'react'
import { Button, Modal, Table } from '@uyun/components'
import moment from 'moment'

export default class ViewRemoteRecordsButton extends Component {
  static defaultProps = {
    ticketId: ''
  }

  state = {
    visible: false,
    data: [],
    loading: false
  }

  handleShow = () => {
    if (this.state.data.length === 0) {
      this.query()
    }

    this.setState({ visible: true })
  }

  query = async () => {
    const { ticketId } = this.props
    const params = { ticketId }

    this.setState({ loading: true })

    const res = await axios.get(API.queryRemoteTicketRecords, { params })

    this.setState({ data: res || [], loading: false })
  }

  getStatusName = status => {
    switch (status) {
      case 0: return '未受理'
      case 1: return '已受理'
      case 2: return '已驳回'
    }
  }

  render() {
    const { visible, data, loading } = this.state

    const columns = [
      {
        title: '协助节点',
        dataIndex: 'nodeName'
      },
      {
        title: i18n('ticket.list.model', '模型'),
        dataIndex: 'targetModelName'
      },
      {
        title: i18n('sloth.srvitems.requestor', '请求人'),
        dataIndex: 'creatorName'
      },
      {
        title: '请求时间',
        dataIndex: 'createTime',
        render: time => moment(time).format('YYYY-MM-DD HH:mm')
      },
      {
        title: i18n('tip9', '状态'),
        dataIndex: 'status',
        render: this.getStatusName
      }
    ]

    return (
      <>
        <Button onClick={this.handleShow}>
          查看远程协助
        </Button>

        <Modal
          title="远程协助"
          width={800}
          visible={visible}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </Modal>
      </>
    )
  }
}

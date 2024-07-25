import React from 'react'
import { Table } from '@uyun/components'
import { toJS } from 'mobx'
import { withRouter, Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import DetailDrawer from '~/details/DetailDrawer'

@inject('ticketStore')
@withRouter
@observer
class RemoteTicket extends React.Component {
  state = {
    subDetailRoute: null,
    subDetailTitle: ''
  }

  componentDidMount() {
    const { id, source } = this.props
    if (source !== 'formset') {
      const {
        getRemoteTiekets,
        remotePagination: { current, size }
      } = this.props.ticketStore
      getRemoteTiekets(id, current, size)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      const {
        getRemoteTiekets,
        remotePagination: { current, size }
      } = this.props.ticketStore
      getRemoteTiekets(this.props.id, current, size)
    }
  }

  handleSubDetailShow = (item) => {
    const { title, ticketId, tacheId, modelId } = item
    const subDetailRoute = {
      location: {
        pathname: `/ticket/detail/${ticketId}`,
        search: `?tacheType=0&tacheNo=0&tacheId=${tacheId}&modelId=${modelId}&renderPager=false`
      },
      match: {
        params: { id: ticketId }
      }
    }
    this.setState({
      subDetailRoute,
      subDetailTitle: title
    })
  }

  onClose = () => {
    this.setState({
      subDetailRoute: null
    })
  }

  render() {
    const { id } = this.props
    const { subDetailRoute, subDetailTitle } = this.state
    const { remoteTicketList, remoteTicketsLoading, remotePagination, getRemoteTiekets } =
      this.props.ticketStore
    const columns = [
      {
        title: i18n('ticket.list.ticketName', '标题'),
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => {
          return (
            // 远程工单
            <a onClick={() => this.handleSubDetailShow(record)}>{text}</a>
            // <Link
            //   to={{
            //     pathname: `/ticket/detail/${record.ticketId}`,
            //     search: `?tacheType=0&tacheNo=0&tacheId=${record.tacheId}&modelId=${record.modelId}`
            //   }}
            // >
            //   {text}
            // </Link>
          )
        }
      },
      {
        title: i18n('conf.model.ruleLength', '流水号'),
        dataIndex: 'flowNo',
        key: 'flowNo'
      },
      {
        title: '远程节点',
        dataIndex: 'nodeName',
        key: 'nodeName'
      },
      {
        title: '工单性质',
        dataIndex: 'relationRemoteType',
        key: 'relationRemoteType',
        render: (text) => (text ? '协办方' : '发起方')
      },
      {
        title: i18n('sla_ticket_type', '工单类型'),
        dataIndex: 'modelName',
        key: 'modelName'
      },
      {
        title: i18n('ticket.relateTicket.activity', '流程环节'),
        dataIndex: 'activityName',
        key: 'activityName'
      },
      {
        title: i18n('ticket.list.creatPerson', '创建人'),
        dataIndex: 'creatorName',
        key: 'creatorName'
      }
    ]
    return (
      <>
        <Table
          dataSource={remoteTicketList}
          columns={columns}
          loading={remoteTicketsLoading}
          pagination={{
            current: remotePagination.current,
            size: remotePagination.size,
            total: remotePagination.total,
            onChange: (current, size) => {
              getRemoteTiekets(id, current, size)
            },
            onShowSizeChange: (current, size) => {
              getRemoteTiekets(id, current, size)
            }
          }}
          size="small"
        />
        <DetailDrawer
          visible={!!subDetailRoute}
          title={subDetailTitle}
          detailRoute={subDetailRoute}
          onClose={this.onClose}
        />
      </>
    )
  }
}

export default RemoteTicket

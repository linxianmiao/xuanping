import React from 'react'
import { Table } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import './index.less'
let falt = true

@inject('globalStore')
@observer
export default class Drafts extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      current: 1,
      pageSize: 20,
      dataSource: [],
      total: 0,
      loading: false
    }
  }

  componentWillMount () {
    this.handleRefresh()
  }

  handleDelete (ticketId) {
    if (falt) {
      falt = false

      axios.get(API.deleteTicketCache(ticketId)).then(res => {
        this.props.globalStore.getDraftsTotal()
        this.handleRefresh()
        falt = true
      })
    }
  }

  handleRefresh () {
    const { current, pageSize } = this.state
    const params = {
      page: current - 1,
      rows: pageSize
    }
    this.setState({ loading: true })
    axios.get(API.getTicketCrafts, { params: params }).then(res => {
      this.setState({
        dataSource: res.data,
        total: res.total,
        loading: false
      })
    })
  }

  render () {
    const columns = [
      {
        title: i18n('ticket_create_subject', '工单标题'),
        dataIndex: 'title',
        key: 'title',
        width: '25%',
        render: (text, recode) => (
          <Link to={'/ticket/drafts/' + recode.id}>
            {text || i18n('ticket_draftList_no_subject', '无标题')}
          </Link>
        )
      }, {
        title: i18n('ticket-list-table-th-ticketNum', '流水号'),
        dataIndex: 'flowNo',
        key: 'flowNo',
        width: '20%',
        render: (text) => text || '--'
      }, {
        title: i18n('layout_model', '模型'),
        dataIndex: 'ticketType',
        width: '20%',
        key: 'ticketType'
      }, {
        title: i18n('config_model_createTime', '创建时间'),
        width: '25%',
        dataIndex: 'saveTime',
        key: 'saveTime',
        render: (text, recode) => (
          <span>{moment(recode.saveTime).format('YYYY-MM-DD HH:mm')}</span>
        )
      }, {
        title: i18n('operation', '操作'),
        key: 'operate',
        width: '10%',
        render: (text, record) => (
          <a onClick={() => { this.handleDelete(record.id) }}>{i18n('delete', '删除')}</a>
        )
      }
    ]
    const { dataSource, total, current, pageSize, loading } = this.state
    const pagination = {
      total,
      current,
      pageSize,
      showQuickJumper: true,
      onChange: (current, pageSize) => {
        this.setState({
          current,
          pageSize
        }, () => {
          this.handleRefresh()
        })
      },
      onShowSizeChange: (_, pageSize) => {
        this.setState({
          current: 1,
          pageSize
        }, () => {
          this.handleRefresh()
        })
      }
    }
    return (
      <div className="draftsList">
        <PageHeader />
        <ContentLayout>
          <div style={{ height: '32px' }}>
            <span className="trigger-tips">{i18n('draftList_tips', '草稿箱仅用于存放创建工单时保存的数据,工单流程中保存的数据在处理工单中可以直接查看。')}</span>
          </div>
          <div className="trigger-list-content" id="list-trigger">
            <Table
              className="drafts-list"
              loading={loading}
              rowKey={record => record.id}
              dataSource={dataSource}
              columns={columns}
              pagination={pagination}
            />
          </div>
        </ContentLayout>
      </div>
    )
  }
}

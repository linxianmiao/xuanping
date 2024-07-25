import React, { Component } from 'react'
import { Progress, Table, Title } from '@uyun/components'
import { observer } from 'mobx-react'
import { autorun, toJS } from 'mobx'
import './style/handlePerson.less'

const CustomProgress = props => {
  const { count, total, index } = props
  let percentStr = (~~((count / total) * 10000)) / 100
  const percentNum = ~~percentStr
  percentStr += '%'
  const format = () => percentStr
  const cls = `tr-has-progress-wrap progress${index}`
  return (
    <div className="tr-has-progress">
      <span className="tr-has-progress-value">{count}</span>
      <div className={cls} style={{ width: 170 }}>
        <Progress percent={percentNum} status="active" strokeWidth={5} format={format} />
      </div>
    </div>
  )
}

@observer
class HandlePerson extends Component {
  componentDidMount () {
    this.disposer = autorun(() => {
      const { pageNum, pageSize, orderBy, orderType, isMore } = this.props.store
      const data = { pageNum, pageSize, orderBy, orderType }
      this.props.store.getUserTicket(data, isMore)
    })
  }

    onLoadingMore = () => {
      const page = this.props.store.pageNum + 1
      this.props.store.setPageNum(page)
    }

    onTableChange = (pagination, filters, sorter) => {
      this.props.store.setFilter(sorter)
    }

    componentWillUnmount () {
      this.disposer()
      this.props.store.destroy()
    }

    render () {
      const { total, data, isEnding } = toJS(this.props.store)
      const columns = [{
        title: i18n('tip25', '处理人'),
        key: 'name',
        className: 'oveview-default-handle-person-title',
        width: '16%',
        render: (text, row) => {
          return row.name
        }
      }, {
        title: i18n('tip30', '待处理工单'),
        key: 'todoCount',
        sorter: true,
        width: '28%',
        render: (text, row) => {
          return <CustomProgress count={row.todoCount} total={total[0]} index="1" />
        }
      }, {
        title: i18n('tip31', '处理中工单'),
        key: 'doingCount',
        sorter: true,
        width: '28%',
        render: (text, row) => {
          return <CustomProgress count={row.doingCount} total={total[1]} index="2" />
        }
      }, {
        title: i18n('tip32', '逾期工单'),
        key: 'overdueCount',
        sorter: true,
        width: '28%',
        render: (text, row) => {
          return <CustomProgress count={row.overdueCount} total={total[2]} index="3" />
        }
      }]
      return (
        <div className="overview-default-public-wrap" style={{ height: 'auto' }}>
          <Title>
            {i18n('handle_person', '处理人工单统计')}
          </Title>
          <div className="overview-default-handle-person-table">
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              onChange={this.onTableChange}
              rowKey={row => row.userId}
            />
            { isEnding ? <div className="overview-default-loading-more">{i18n('tip34', '已经全部显示')}</div>
              : <div onClick={this.onLoadingMore} className="overview-default-loading-more has-href">{i18n('tip33', '加载更多')}<i className="icon iconfont icon-zhankai" /></div>
            }
          </div>

        </div>
      )
    }
}

export default HandlePerson

import React, { Component } from 'react'
import { Select } from '@uyun/components'
import TableDetail from './tableDetail'
const Option = Select.Option

class PendingTable extends Component {
  state = {
    loaded: false,
    list: [],
    current: 1,
    total: 0,
    pageSize: 10,
    loading: false,
    priority: 0
  }

  onClick = (value) => {
    this.setState({ priority: value }, this.load)
  }

  onPageChange = (current, pageSize) => {
    this.setState({ current, pageSize }, this.load)
  }

  componentDidMount() {
    this.load()
  }

  load = () => {
    const { pageSize, current, priority, loaded } = this.state
    this.setState({
      loading: true
    })
    //
    axios
      .post('/itsm/api/v2/ticket/getAllTicket', {
        filterType: 'todo',
        executor: ['currentUser'],
        status: ['1', '2', '10'],
        pageNum: current,
        priority: priority ? [priority] : undefined,
        pageSize
      })
      .then((res) => {
        axios
          .post('/itsm/api/v2/ticket/getAllTicket/count', {
            filterType: 'todo',
            executor: ['currentUser'],
            status: ['1', '2', '10'],
            pageNum: current,
            priority: priority ? [priority] : undefined,
            pageSize
          })
          .then((count) => {
            if (!loaded) {
              this.props.onChange(_.isNumber(count) ? count : 0)
            }

            this.setState({
              loaded: true,
              loading: false,
              list: res.list || [],
              total: _.isNumber(count) ? count : 0
            })
          })
      })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
  }

  render() {
    const levels = [
      { label: i18n('all', '全部'), value: 0 },
      { label: i18n('urgent', '极高'), value: 5 },
      { label: i18n('high', '高'), value: 4 },
      { label: i18n('normal', '中'), value: 3 },
      { label: i18n('low', '低'), value: 2 },
      { label: i18n('none', '极低'), value: 1 }
    ]
    const { list, current, total, pageSize, loading, priority } = this.state

    return (
      <div className="overview-person-table">
        <div className="overview-person-table-filter">
          <Select value={priority} style={{ width: 200 }} onChange={this.onClick}>
            {_.map(levels, (item, i) => {
              return (
                <Option key={i} value={item.value}>
                  {item.label}
                </Option>
              )
            })}
          </Select>
        </div>
        <TableDetail
          data={list}
          loading={loading}
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={this.onPageChange}
        />
      </div>
    )
  }
}

export default PendingTable

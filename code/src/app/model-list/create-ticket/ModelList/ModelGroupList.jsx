import React, { Component } from 'react'
import { Menu, Spin, Empty } from '@uyun/components'

class ModelTypeList extends Component {
  state = {
    data: [],
    loading: false
  }

  timer = null

  conditions = { pageNo: 1, pageSize: 20 }

  total = 0

  componentDidMount() {
    this.query()
  }

  query = async () => {
    this.setState({ loading: true })

    const res = await axios(API.query_model_layout, { params: this.conditions })
    const data = (res.pageNum > 1 ? this.state.data : []).concat(res.list || [])

    this.conditions.pageNo = res.pageNum || 1
    this.total = res.total || 0
    this.setState({ data, loading: false })
  }

  handleScroll = e => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (this.total > this.state.data.length && isBottom && !this.state.loading) {
      this.conditions.pageNo = this.conditions.pageNo + 1
      this.timer = setTimeout(() => {
        clearInterval(this.timer)
        this.query()
      }, 300)
    }
  }

  render() {
    const { groupId, onChange, showFollow } = this.props
    const { data, loading } = this.state

    return (
      <div
        className="mbt-model-type-list-wrap"
        onScroll={this.handleScroll}
      >
        <Menu selectedKeys={[groupId]} onClick={({ key }) => onChange(key)}>
          <Menu.Item key="all">{i18n('all')}</Menu.Item>
          {showFollow && <Menu.Item key="collect">{i18n('my.collection')}</Menu.Item>}
          {
            data.map(item => (
              <Menu.Item key={item.id}>{item.name}</Menu.Item>
            ))
          }
        </Menu>
        {
          loading && <Spin />
        }
        {
          data.length === 0 && !loading && <Empty type="data" />
        }
      </div>
    )
  }
}

export default ModelTypeList

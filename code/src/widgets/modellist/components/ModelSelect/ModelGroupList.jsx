import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { Menu, Spin, Empty } from '@uyun/components'
import styles from './index.module.less'

class ModelTypeList extends Component {
  @inject('i18n') i18n

  @inject('api') api

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

    const res = await this.api.queryModelGroups(this.conditions)
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
    const { groupId, onChange } = this.props
    const { data, loading } = this.state

    return (
      <div
        className={styles.mbtModelTypeListWrap}
        onScroll={this.handleScroll}
      >
        <Menu selectedKeys={[groupId]} onClick={({ key }) => onChange(key)}>
          <Menu.Item key="all">{this.i18n('all', '全部')}</Menu.Item>
          <Menu.Item key="collect">{this.i18n('my.collection', '我的收藏')}</Menu.Item>
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

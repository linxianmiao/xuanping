import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Menu, Spin, Empty, Input } from '@uyun/components'
import styles from './index.module.less'

@inject('modelListStore')
@observer
export default class GroupList extends Component {
  state = {
    data: [],
    loading: false,
    groupKw: undefined
  }

  timer = null
  pageNum = 1
  pageSize = 20
  total = 0

  componentDidMount() {
    this.query()
  }

  query = async (params = {}) => {
    this.setState({ loading: true })

    const finalParams = { page_num: this.pageNum, page_size: this.pageSize, ...params }
    const res =
      (await axios.get(API.queryDictionaryData('model_layout'), { params: finalParams })) || {}
    const { list, pageNum, total } = res
    const data = (pageNum > 1 ? this.state.data : []).concat(list || [])

    this.pageNum = pageNum || 1
    this.total = total || 0
    this.setState({ data, loading: false })
    this.props.modelListStore.setValue({ groupList: data })
  }

  handleScroll = (e) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (isBottom && this.total > this.state.data.length && !this.state.loading) {
      this.pageNum = this.pageNum + 1
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.query()
      }, 300)
    }
  }

  render() {
    const { onChange } = this.props
    const { query } = this.props.modelListStore
    const { data, loading, groupKw } = this.state

    return (
      <div className={styles.groupListWrapper} onScroll={this.handleScroll}>
        <div className={styles.searchWrapper}>
          <Input.Search
            placeholder={i18n('input_keyword')}
            allowClear
            enterButton
            value={groupKw}
            onChange={(e) => this.setState({ groupKw: e.target.value })}
            onSearch={() => this.query({ kw: groupKw, page_num: 1 })}
            onClear={() => {
              this.setState({ groupKw: undefined }, () => {
                this.query({ kw: undefined, page_num: 1 })
              })
            }}
          />
        </div>
        <div className={styles.menuWrapper}>
          <Menu selectedKeys={[query.layoutId || 'all']} onClick={({ key }) => onChange(key)}>
            <Menu.Item key="all">{i18n('all')}</Menu.Item>
            {data.map((item) => (
              <Menu.Item key={item.id} title={item.name}>
                {item.name}
              </Menu.Item>
            ))}
          </Menu>
          {loading && <Spin />}
          {data.length === 0 && !loading && <Empty type="data" />}
        </div>
      </div>
    )
  }
}

import React, { Component, Fragment } from 'react'
import { inject } from '@uyun/core'
import { Spin, Empty, message } from '@uyun/components'
import Filters from './Filters'
import Card from './Card'
import styles from './index.module.less'

class ModelList extends Component {
  @inject('i18n') i18n

  @inject('api') api

  state = {
    data: [],
    loading: false
  }

  conditions = this.getInitialConditions()

  total = 0

  timer = null

  componentDidMount() {
    this.query(this.conditions)
  }

  componentDidUpdate(prevProps) {
    const { groupId } = this.props

    if (groupId && groupId !== prevProps.groupId) {
      this.conditions = this.getInitialConditions()
      if (groupId === 'all') {
        this.conditions.layoutId = undefined
        this.conditions.collect = 0
      } else if (groupId === 'collect') {
        this.conditions.layoutId = undefined
        this.conditions.collect = 1
      } else {
        this.conditions.layoutId = groupId
        this.conditions.collect = 0
      }
      this.query(this.conditions)
    }
  }

  getInitialConditions() {
    return {
      pageNo: 1,
      pageSize: 24,
      layoutId: undefined,
      collect: 0
    }
  }

  query = async conditions => {
    this.setState({ loading: true })

    const res = await this.api.queryModels(conditions)
    const data = (conditions.pageNo > 1 ? this.state.data : []).concat(res.list || [])

    this.conditions.pageNo = res.pageNum || 1
    this.total = res.total || 0
    this.setState({
      data,
      loading: false
    })
  }

  handleScroll = e => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    const { pageNo, pageSize } = this.conditions
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (this.total > (pageNo * pageSize) && isBottom && !this.state.loading) {
      this.conditions.pageNo = this.conditions.pageNo + 1
      this.timer = setTimeout(() => {
        clearInterval(this.timer)
        this.query(this.conditions)
      }, 300)
    }
  }

  handleFilterChange = filters => {
    this.conditions = { ...this.conditions, ...filters }
    this.conditions.pageNo = 1
    this.query(this.conditions)
  }

  handleCollect = (collect, item) => {
    return this.api.collectModel(item.processId, collect).then(res => {
      if (res === '200') {
        const msg = collect === 1 ? this.i18n('collect.success', '收藏成功') : this.i18n('collect.cancel.success', '取消收藏')
        message.success(msg)

        // 在“我的收藏”中取消收藏，则把该条数据在前端过滤掉
        if (this.props.groupId === 'collect') {
          this.setState(prevState => {
            return {
              data: prevState.data.filter(d => d.processId !== item.processId)
            }
          })
        }

        return res
      }
    })
  }

  render() {
    const { groupId, selectedModelIds } = this.props
    const { loading, data } = this.state

    return (
      <Fragment>
        <Spin wrapperClassName={styles.mbtModelListSpin} spinning={loading}>
          <Filters groupId={groupId} onChange={this.handleFilterChange} />
          <div className={styles.mbtModelListWrap} onScroll={this.handleScroll}>
            {
              data.map(item => {
                const selected = selectedModelIds.indexOf(item.processId) > -1
                return (
                  <div key={item.processId} className={styles.mbtModelCardWrap}>
                    <Card
                      data={item}
                      selected={selected}
                      onClick={this.props.onSelect}
                      onCollect={this.handleCollect}
                    />
                  </div>
                )
              })
            }
            {!loading && data.length === 0 && <Empty type="data" />}
          </div>
        </Spin>
      </Fragment>
    )
  }
}

export default ModelList

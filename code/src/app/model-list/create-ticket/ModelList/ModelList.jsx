import React, { Component, Fragment } from 'react'
import { Spin, Empty, message } from '@uyun/components'
import Filters from './Filters'
import Card from './Card'

class ModelList extends Component {
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

    const res = await axios.get(API.getAuthModelsByUser, { params: conditions })
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
    return axios.get(`${API.collectModel}/${item.processId}/${collect}`).then(res => {
      if (res === '200') {
        const msg = collect === 1 ? i18n('collect.success') : i18n('collect.cancel.success')
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
    const { groupId, selectList, mode, showFollow } = this.props
    const { loading, data } = this.state

    return (
      <Fragment>
        <Spin wrapperClassName="mbt-model-list-spin" spinning={loading}>
          <Filters groupId={groupId} onChange={this.handleFilterChange} />
          <div className="mbt-model-list-wrap" onScroll={this.handleScroll}>
            {
              data.map(item => (
                <div key={item.processId} className="mbt-model-card-wrap">
                  <Card showFollow={showFollow} mode={mode} selectList={selectList} data={item} onClick={this.props.onSelect} onCollect={this.handleCollect} />
                </div>
              ))
            }
            {!loading && data.length === 0 && <Empty type="data" />}
          </div>
        </Spin>
      </Fragment>
    )
  }
}

export default ModelList

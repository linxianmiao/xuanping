import React, { Component } from 'react'
import { Input } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import LazyLoadList from '~/components/lazyLoad/lazyLoadList'
import styles from './index.module.less'
import classnames from 'classnames'

@inject('modelListStore')
@observer
export default class Model extends Component {
  state ={
    list: [],
    loading: false,
    query: {
      kw: undefined,
      pageNo: 1,
      pageSize: 15
    }
  }

  componentDidMount() {
    this.getList()
  }

  getList = async () => {
    const { query } = this.state
    const res = await this.props.modelListStore.queryAllModels(query) || {}
    const { list } = res
    if (query.pageNo === 1) {
      this.setState({ list: list })
    } else {
      this.setState({ list: [...this.state.list, ...list] })
    }
  }

  handleChangeQuery = (query) => {
    this.setState({ query })
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.getList()
    }, 300)
  }

  handleChange = (item) => {
    this.props.handleChangeValueList({ modelId: item.id, modelName: item.name })
  }

  render () {
    const { valueList } = this.props
    const { query, loading, list } = this.state
    return (
      <div>
        <Input.Search
          style={{ width: 256, marginBottom: 10 }}
          placeholder={i18n('globe.keywords', '请输入关键字')}
          onChange={(e) => {
            this.handleChangeQuery({
              kw: e.target.value,
              pageNo: 1,
              pageSize: 15
            })
          }} />
        <LazyLoadList
          query={query}
          loading={loading}
          onChange={this.handleChangeQuery}
          className={styles.lazyModelWrap}>
          {_.map(list, item => {
            return (
              <div
                key={item.id}
                onClick={() => { this.handleChange(item) }}
                className={classnames({ active: _.some(valueList, v => v.modelId === item.id) })}>
                {item.name}
              </div>
            )
          })}
        </LazyLoadList>
      </div>
    )
  }
}

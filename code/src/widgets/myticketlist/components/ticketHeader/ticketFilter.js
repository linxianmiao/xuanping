import React, { Component } from 'react'
import { inject } from '@uyun/core'
import FilterList from './filterList'
import styles from '../../ticketlist.module.less'
import { TicketlistStore } from '../../ticketlist.store'
import { toJS } from 'mobx'

export default class TicketFilter extends Component {
  @inject('i18n') i18n

  @inject(TicketlistStore) store

  constructor(props) {
    super(props)
    this.filters = React.createRef()
  }

  handleFilter = () => {
    const values = this.filters.current.props.form.getFieldsValue()
    const { query, newQuery } = this.store

    const { inputValue = '' } = this.props
    values.wd = inputValue
    this.store.setValue(
      _.assign({}, query, newQuery, values, { pageNum: 1, pageSize: query.pageSize }),
      'query'
    )
  }

  handleReset = () => {
    const { query, querySelectedList, currentDept } = this.store
    const { filterType } = query || {}
    let originalQuery = {
      processId: undefined,
      modelId: undefined,
      wd: undefined,
      status: undefined,
      create_time: undefined,
      update_time: undefined,
      filterOrg: undefined,
      ticketNum: undefined,
      ticketName: undefined,
      modelAndTacheId: undefined
    }
    if (filterType === 'all') {
      originalQuery = _.assign({}, originalQuery, {
        source: undefined,
        executor: undefined,
        creator: undefined,
        priority: undefined,
        overdue: undefined,
        executionGroup: undefined
      })
      const querySelected = _.cloneDeep(toJS(querySelectedList))
      _.forEach(querySelected, (item) => {
        const disabled = item.disabled || false
        if (item.code === 'participantsDepartIds') {
          originalQuery[item.code] = toJS(currentDept) || []
        } else if (disabled) {
          originalQuery[item.code] = item.value
        } else {
          // if (!item.hide) {
          item.value = undefined
          originalQuery[item.code] = undefined
          // }
        }
      })
      this.store.setSelectedList(querySelected, 'QUERY')
    }

    if (_.includes(['mytodo'], filterType)) {
      originalQuery.status = ['1', '2', '10']
    }

    this.store.setValue(_.assign({}, query, originalQuery), 'query')

    this.props?.handleInputClear()

    this.filters.current.props.form.resetFields()
  }

  render() {
    return (
      <div className={styles.ticketFilterWrap} id="ticket-filter-wrap">
        <FilterList
          wrappedComponentRef={this.filters}
          handleFilter={this.handleFilter}
          handleReset={this.handleReset}
        />
        {/* <Row> */}
        {/* <Col span={4}>
          <Button size="small" type="primary" onClick={this.handleFilter}>
            {this.i18n('globe.search', '查询')}
          </Button>
          <Button size="small" onClick={this.handleReset}>
            {this.i18n('globe.reset', '重置')}
          </Button>
        </Col> */}
        {/* </Row> */}
        {/* <div className={styles.filterBtn}>
          <Button size="small" type="primary" onClick={this.handleFilter}>{this.i18n('globe.search', '查询')}</Button>
          <Button size="small"onClick={this.handleReset}>{this.i18n('globe.reset', '重置')}</Button>
        </div> */}
      </div>
    )
  }
}

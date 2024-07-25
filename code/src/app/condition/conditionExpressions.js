import React, { Component } from 'react'
import { Select } from '@uyun/components'
import PropTypes from 'prop-types'
import ConditionValue from './conditionValue'
const Option = Select.Option

class ConditionExpressions extends Component {
  static contextTypes = {
    types: PropTypes.array
  }

  onSelect = code => {
    const { item, index } = this.props
    const types = this.context.types
    const filter = _.find(types, o => o.code === code) || {}
    item.id = filter.id
    item.key = filter.code
    item.value = null
    item.logics = filter.logics
    item.type = filter.type
    this.props.onChange(item, index)
  }

  onExpressions = value => {
    const { item, index } = this.props
    item.comparison = value
    item.value = undefined
    this.props.onChange(item, index)
  }

  onValue = value => {
    const { item, index } = this.props
    item.value = value
    this.props.onChange(item, index)
  }

  render () {
    const { item, index } = this.props
    const types = this.context.types
    const filter = _.find(types, (child) => { return child.code === item.key }) || {}
    const logics = filter ? filter.logics : []
    return (
      <div className="condition-expressions-wrap">
        <div className="condition-expressions-item clearfix">
          <div className="condition-select">
            <Select
              style={{ width: '100%' }}
              value={item.key}
              showSearch
              optionFilterProp="children"
              onChange={this.onSelect}>
              {_.map(types, (child, i) => {
                return <Option value={child.code} key={i}>{child.name}</Option>
              })}
            </Select>
          </div>
          <div className="expressions-select">
            <Select value={item.comparison}
              style={{ width: '100%' }}
              onChange={value => { this.onExpressions(value, index) }}>
              {_.map(logics, (child, i) => {
                return <Option value={child.value} key={i}>{child.name}</Option>
              })}
            </Select>
          </div>
          <div className="value-select">
            <ConditionValue
              comparison={item.comparison}
              code={item.key}
              id={item.id}
              type={item.type}
              value={item.value}
              modelId={this.props.modelId}
              onChange={this.onValue} />
          </div>

        </div>
        <div className="condition-expressions-delete">
          <i className="iconfont icon-shanchu condition-shanchu" onClick={this.props.onRemove} />
        </div>
      </div>

    )
  }
}

export default ConditionExpressions

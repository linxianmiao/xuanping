/**
 * 触发条件组件
 * @param filter        boolean   是否需要过滤activity和status
 * @param defaulteData  Array     组件数据
 * @param onChange      function  值改变回调函数
 */

import React, { Component } from 'react'
import ConditionWrap from './conditionWrap'
import PropTypes from 'prop-types'
import './style/index.less'

class Index extends Component {
  getChildContext () {
    return {
      types: this.state.types
    }
  }

    state = {
      types: []
    }

    // 删除嵌套的回调
    onChange = (value, index) => {
      const defaultData = _.cloneDeep(this.props.defaultData)
      defaultData[index] = value
      this.onParams(defaultData)
    }

    // 嵌套内改变的回调
    onItemChange = (item, index) => {
      const defaultData = _.cloneDeep(this.props.defaultData)
      defaultData[index] = item
      this.onParams(defaultData)
    }

    // 获取SLA策略嵌套条件字段
    getConditionTypes = modelId => {
      let types = []
      axios.get(API.getConditionTypesWithoutModel, { params: { modelId } }).then(res => {
        if (this.props.filter) {
          types = _.filter(res, o => { return (o.code !== 'activity' && o.code !== 'status') })
        } else {
          types = res
        }
        this.setState({ types: types })
      })
    }

    // 嵌套
    onNesting = (index, level) => {
      const { defaultData } = this.props
      if (level === 0) {
        defaultData[0].nestingConditions.push({
          when: 'all',
          conditionExpressions: [],
          nestingConditions: []
        })
      }
      if (level === 1) {
        defaultData[0].nestingConditions[index].nestingConditions.push({
          when: 'all',
          conditionExpressions: [],
          nestingConditions: []
        })
      }
      this.onParams(defaultData)
    }

    // 添加条件
    onAddItem = (level, index, parentIndex) => {
      const type = this.state.types[0]
      const { defaultData } = this.props
      const condition = {
        key: type.code,
        id: type.id,
        comparison: type.logics[0].value,
        logics: type.logics,
        value: null,
        type: type.type
      }
      if (level === 0) {
        defaultData[0].conditionExpressions.push(condition)
      }
      if (level === 1) {
        defaultData[parentIndex].nestingConditions[index].conditionExpressions.push(condition)
      }
      if (level === 2) {
        defaultData[0].nestingConditions[parentIndex].nestingConditions[index].conditionExpressions.push(condition)
      }
      this.onParams(defaultData)
    }

    // 统一处理数据变化
    onParams = data => {
      this.props.onChange && this.props.onChange(data)
    }

    componentWillMount () {
      this.getConditionTypes(this.props.modelId)
    }

    render () {
      const { defaultData, filter, modelId } = this.props
      return (
        <div className="trigger-condition">
          {_.map(defaultData, (item, i) => {
            return (
              <ConditionWrap
                key={i}
                index={i}
                level={0}
                item={item}
                filter={filter}
                modelId={modelId}
                onChange={this.onChange}
                onNesting={this.onNesting}
                onAddItem={this.onAddItem}
                onItemChange={this.onItemChange} />
            )
          })}
        </div>
      )
    }
}

Index.childContextTypes = {
  types: PropTypes.array
}

export default Index

import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Select, Button } from '@uyun/components'
import PropTypes from 'prop-types'
import ConditionExpressions from './conditionExpressions'
import ConditionWrap from './conditionWrap'
const Option = Select.Option

class ConditionItem extends Component {
  static contextTypes = {
    types: PropTypes.array
  }

    // 删除嵌套的递归传值
    onChange = (data, i, type) => {
      const { index, item } = this.props
      item[type][i] = data
      this.props.onChange(item, index)
    }

    // when字段改变回调
    onWhen = (value, index) => {
      const data = _.cloneDeep(this.props.item)
      data.when = value
      this.props.onItemChange(data, index, 'nestingConditions')
    }

    // 条件内容改变
    onEditCondition = (values, i) => {
      const { item, index } = this.props
      item.conditionExpressions[i] = values
      this.props.onItem(item, index)
    }

    // 添加嵌套
    onNesting = (index, level) => {
      this.props.onNesting(index, level)
    }

    // 删除嵌套
    onRemove = (type, index, parentIndex) => {
      const item = _.cloneDeep(this.props.item)
      item[type].splice(index, 1)
      this.props.onChange(item, parentIndex, type)
    }

    // 根据index删除条件
    onRemoveItem = index => {
      const item = _.cloneDeep(this.props.item)
      item.conditionExpressions.splice(index, 1)
      this.props.onItemChange(item, this.props.index)
    }

    // 嵌套的内容改变（when, nestingConditions, conditionExpressions）时的递归回调函数
    onItemChange = (data, index) => {
      const item = _.cloneDeep(this.props.item)
      item.nestingConditions[index] = data
      this.props.onItemChange(item, this.props.index)
    }

    // 根据index改变条件内容
    onItemValue = (value, i) => {
      const item = _.cloneDeep(this.props.item)
      item.conditionExpressions[i] = value
      this.props.onItemChange(item, this.props.index)
    }

    render () {
      const { level, item, index, parentIndex, modelId, filter } = this.props
      const { when, conditionExpressions, nestingConditions } = item
      return (
        <div className={`condition-item condition-item-level-${level}`}>
          <div className="condition-item-arrow" />
          <div className="condition-item-wrap">
            <div className="condition-item-header clearfix">
              <div className="condition-item-header-left">
                <Select
                  value={when}
                  style={{ width: 150 }}
                  onChange={value => { this.onWhen(value, index) }}>
                  <Option value="all">{i18n('sla_all', '全部满足')}</Option>
                  <Option value="any">{i18n('sla_any', '任意满足')}</Option>
                  <Option value="not">{i18n('sla_not', '全不满足')}</Option>
                </Select>
              </div>
              <div className="condition-item-header-right">
                { level < 2 &&
                <Button icon={<PlusOutlined />}
                  onClick={() => { this.onNesting(index, level) }}>{i18n('nesting', '嵌套')}</Button>
                }
                <Button icon={<PlusOutlined />} onClick={() => { this.props.onAddItem(level, index, parentIndex) }}>{i18n('condition', '条件')}</Button>
              </div>
            </div>
            {((!filter && modelId) || filter) &&
            <div className="condition-item-content">
              {_.map(conditionExpressions, (item, i) => {
                return (
                  <ConditionExpressions
                    key={i}
                    index={i}
                    item={item}
                    modelId={modelId}
                    onChange={this.onItemValue}
                    onRemove={() => { this.onRemoveItem(i) }} />
                )
              })}
            </div>}
          </div>
          { level !== 0 && <i onClick={() => { this.props.onRemove('nestingConditions', index, parentIndex) }} className="iconfont icon-shanchu icon-item-shanchu" /> }
          {_.map(nestingConditions, (item, i) => {
            const nextLevel = level + 1
            return (
              <ConditionWrap
                key={i}
                level={nextLevel}
                item={item}
                index={i}
                parentIndex={index}
                onNesting={() => { this.props.onNesting(i, nextLevel) }}
                onAddItem={this.props.onAddItem}
                onRemove={this.onRemove}
                onChange={this.onChange}
                onItemChange={this.onItemChange} />
            )
          })}
        </div>
      );
    }
}

export default ConditionItem

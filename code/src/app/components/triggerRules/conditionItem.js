import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Select, Button, Col } from '@uyun/components'
import ConditionExpressions from './conditionExpressions'
import ConditionWrap from './conditionWrap'
import ConditionView from './conditionView'
const Option = Select.Option

class ConditionItem extends Component {
    // 改变when
    handleChangeWhen = (dataWhen, indexWhen) => {
      const { item, index } = this.props
      const nestingConditions = _.map(item.nestingConditions, (data, idx) => {
        if (idx === indexWhen) return dataWhen
        return data
      })
      this.props.handleChangeWhen(_.assign({}, item, { nestingConditions }), index)
    }

    // 添加嵌套
    handleAddNest = () => {
      const { item } = this.props
      const nestingConditions = item.nestingConditions
      const data = {
        when: 'all',
        conditionExpressions: [],
        nestingConditions: []
      }
      nestingConditions.push(data)
      this.props.handleChangeNest(_.assign({}, item, { nestingConditions }))
    }

    // 删除嵌套
    handleRemoveNest = () => {
      const { index } = this.props
      this.props.handleChangeNest(undefined, index)
    }

    // 改变嵌套 ， 递归调用
    handleChangeNest = (NestData, indexNest) => {
      const { item, index } = this.props
      let nestingConditions = []
      if (NestData) {
        nestingConditions = _.map(item.nestingConditions, (data, idx) => {
          if (idx === indexNest) return NestData
          return data
        })
      } else {
        nestingConditions = _.filter(item.nestingConditions, (data, idx) => idx !== indexNest)
      }
      this.props.handleChangeNest(_.assign({}, item, { nestingConditions }), index)
    }

    // 添加条件
    handleAddCondition = () => {
      const { item, index } = this.props
      const condition = {
        key: 'title',
        comparison: 'EQUALS',
        value: undefined
      }
      const conditionExpressions = [...item.conditionExpressions, condition]
      this.props.handleChangeCondition(_.assign({}, item, { conditionExpressions }), index)
    }

    // 删除条件
    handleRemoveCondition = indexCondition => {
      const { item, index } = this.props
      const conditionExpressions = _.filter(item.conditionExpressions, (data, idx) => idx !== indexCondition)
      this.props.handleChangeCondition(_.assign({}, item, { conditionExpressions }), index)
    }

    // 改变条件，递归调用
    handleChangeCondition = (conditionData, indexCondition) => {
      const { item, index } = this.props
      const nestingConditions = _.map(item.nestingConditions, (data, idx) => {
        if (idx === indexCondition) {
          return conditionData
        }
        return data
      })
      this.props.handleChangeCondition(_.assign({}, item, { nestingConditions }), index)
    }

    renderHeader = (item, when, index) => {
      return (
        <React.Fragment>
          <Select
            value={when}
            style={{ width: 150 }}
            onChange={value => {
              this.props.handleChangeWhen(_.assign({}, item, { when: value }), index)
            }}>
            <Option value="all">{i18n('sla_all', '全部满足')}</Option>
            <Option value="any">{i18n('sla_any', '任意满足')}</Option>
            <Option value="not">{i18n('sla_not', '全不满足')}</Option>
          </Select>
          <span style={{ marginLeft: 8 }} className='hits'>{i18n('condition', '条件')}</span>
        </React.Fragment>
      )
    }

    renderExtra = (level, conditionDisabled) => {
      return (
        <React.Fragment>
          { level < 2 && <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 8 }} onClick={this.handleAddNest}>{i18n('nesting', '嵌套')}</Button> }
          <Button type="primary" icon={<PlusOutlined />} onClick={this.handleAddCondition}>{i18n('condition', '条件')}</Button>
          { level !== 0 && <Col span={1} className="tigger-remove-icon" onClick={this.handleRemoveNest}><i className="iconfont icon-guanbi1" /></Col> }
        </React.Fragment>
      );
    }

    render () {
      const { level, item, index, modelId, filter, triggerRulesStore, isError, isRequired } = this.props
      const { when, conditionExpressions, nestingConditions } = item
      const conditionDisabled = (!filter && modelId) || filter
      const conditionlength = conditionExpressions.length || 0
      return (
        <ConditionView
          level={level}
          header={this.renderHeader(item, when, index)}
          extra={this.renderExtra(level, conditionDisabled)}>
          {_.map(conditionExpressions, (condition, idx) => {
            // key不能使用idx，从上边删除的时候，props发生了改变，index 为2 的变成了 index 为1，这个时候props的key与组件的state不对应了
            return (
              <ConditionExpressions
                key={condition.key + idx}
                item={item}
                index={index}
                isError={isError}
                conditionlength={conditionlength}
                isRequired={isRequired}
                conditionIndex={idx}
                condition={condition}
                modelId={modelId}
                triggerRulesStore={triggerRulesStore}
                onChange={this.props.handleChangeCondition}
                handleRemoveCondition={this.handleRemoveCondition} />
            )
          })}

          { _.map(nestingConditions, (item, i) => {
            const nextLevel = level + 1
            return (
              <ConditionWrap
                key={i}
                index={i}
                item={item}
                isError={isError}
                isRequired={isRequired}
                level={nextLevel}
                modelId={modelId}
                triggerRulesStore={triggerRulesStore}
                handleChangeNest={this.handleChangeNest}
                handleChangeWhen={this.handleChangeWhen}
                handleChangeCondition={this.handleChangeCondition} />
            )
          })}
        </ConditionView>
      )
    }
}
export default ConditionItem

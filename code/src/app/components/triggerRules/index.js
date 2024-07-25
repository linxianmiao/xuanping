/**
 * 触发条件组件
 * @param excludeVariable boolean  是否排除变量
 * @param excludeCodes  array     要屏蔽的key值
 * @param addinitLine   boolean   是否要进行初始化数据
 * @param value         object     组件数据
 * @param onChange      function  值改变回调函数
 * @param modelId       string    模型id，不为空流程阶段为下拉数据，否则为级联数据
 * @param isRequired    boolean   最后一个条件是否可以删除
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConditionWrap from './conditionWrap'
import triggerRulesStore from './stores/indexStore'
import './styles/index.less'

class Index extends Component {
  static defaultProps = {
    value: {
      when: 'all',
      conditionExpressions: [],
      nestingConditions: []
    }
  }

  async componentDidMount() {
    const { modelId, addinitLine, value, excludeCodes, excludeVariable } = this.props
    const sectionConditionList = await triggerRulesStore.getTriggerTypeList(
      modelId,
      excludeCodes,
      excludeVariable
    )
    // 数据为空的话初始化一行数据
    if (addinitLine && _.isEmpty(value.conditionExpressions)) {
      const line = _.find(
        sectionConditionList,
        (sectionCondition) => sectionCondition.code === 'title'
      )
      this.props.onChange({
        when: 'all',
        conditionExpressions: [
          {
            key: line.code,
            comparison: line.logics[0].value,
            value: undefined,
            type: line.type
          }
        ],
        nestingConditions: []
      })
    }
  }

  // WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  componentWillReceiveProps(nextProps) {
    if (this.props.modelId !== nextProps.modelId) {
      const { modelId, excludeCodes, excludeVariable } = nextProps
      triggerRulesStore.getTriggerTypeList(modelId, excludeCodes, excludeVariable)
    }
  }

  render() {
    const { modelId, value, onChange, isError, isRequired } = this.props
    const dataList = [].concat(value)
    return (
      <div className="trigger-rules-wrap">
        {_.map(dataList, (item, index) => {
          return (
            <ConditionWrap
              key={index}
              index={index}
              level={0}
              item={item}
              isRequired={isRequired}
              modelId={modelId}
              isError={isError}
              triggerRulesStore={triggerRulesStore}
              handleChangeNest={onChange}
              handleChangeCondition={onChange}
              handleChangeWhen={onChange}
            />
          )
        })}
      </div>
    )
  }
}
Index.propTypes = {
  modelId: PropTypes.string,
  value: PropTypes.object
}
export default Index

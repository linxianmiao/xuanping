import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import NewCountersign from './newCountersign'
import CountersignRule from './countersignRule'
const RadioGroup = Radio.Group

class NewCountersignWrap extends Component {
  // 修改
  handleCountersignRule = (data) => {
    const handlersRangeVo = this.props.handlersRangeVo || {}
    this.props.handleUserChange(_.assign({}, handlersRangeVo, { handlersRulesVos: data }))
  }

  // 修改直接选择的人员
  handleNewCountersign = (userAndGroupList, useVariable) => {
    const handlersRangeVo = this.props.handlersRangeVo || {}
    this.props.handleUserChange(
      _.assign({}, handlersRangeVo, { directSelectionVo: { userAndGroupList, useVariable } })
    )
  }

  // 修改radio
  onChange = (e) => {
    const handlersRangeVo = this.props.handlersRangeVo || {}
    this.props.handleUserChange(_.assign({}, handlersRangeVo, { scope: e.target.value }))
  }

  render() {
    const handlersRangeVo = this.props.handlersRangeVo || {}
    let { scope = 0, directSelectionVo, handlersRulesVos } = handlersRangeVo
    directSelectionVo = directSelectionVo || {}
    handlersRulesVos = handlersRulesVos || []
    const { useVariable, userAndGroupList } = directSelectionVo

    const { cooperateTenant = {} } = this.props

    return (
      <div>
        <RadioGroup
          style={{ width: '100%' }}
          onChange={this.onChange}
          buttonStyle="solid"
          value={scope}
        >
          <Radio.Button style={{ width: '50%', textAlign: 'center' }} value={0}>
            {i18n('direct-selection', '直接选择')}
          </Radio.Button>
          <Radio.Button style={{ width: '50%', textAlign: 'center' }} value={1}>
            {i18n('select-by-rule', '按规则选择')}
          </Radio.Button>
        </RadioGroup>
        {scope === 0 && (
          <NewCountersign
            isShared={this.props.isShared}
            isShowUserVariable
            values={userAndGroupList}
            useVariable={useVariable}
            cooperateTenant={cooperateTenant}
            handleUserChange={this.handleNewCountersign}
          />
        )}
        {scope === 1 && (
          <CountersignRule
            handlersRulesVos={handlersRulesVos}
            handleUserChange={this.handleCountersignRule}
          />
        )}
      </div>
    )
  }
}
export default NewCountersignWrap

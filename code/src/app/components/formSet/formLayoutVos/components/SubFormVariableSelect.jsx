import React, { useMemo, forwardRef } from 'react'
import { AutoComplete } from '@uyun/components'
const Option = AutoComplete.Option

function SubFormVariableSelect(props) {
  const { subFormVariableList, onAutoCompleteFocus, value, onChange } = props

  const options = useMemo(() => _.map(subFormVariableList, item => <Option key={item.code} value={'${variable.' + item.code + '}'}>{item.name}</Option>), [subFormVariableList])

  return (
    <AutoComplete
      value={value}
      dataSource={options}
      onChange={onChange}
      optionLabelProp="value"
      onFocus={onAutoCompleteFocus}
      placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('ticket-user-variable', '变量')}`}
    />
  )
}

export default forwardRef(SubFormVariableSelect)
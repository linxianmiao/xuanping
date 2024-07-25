import React from 'react'
import { Radio, Input, Checkbox } from '@uyun/components'
import TriggerValueList from '~/components/triggerValueList'
import TimeValidate from './TimeValidate'

const RadioGroup = Radio.Group

const ChangeValue = (props) => {
  // f = 'value' | 'empty'
  const handleChange = (value, f = 'value') => {
    props.onChange(value, f)
  }

  // 字段类型
  const getFieldType = (field) => {
    // 对下拉字段进行特殊处理
    const { type, isSingle } = field
    if (type === 'listSel') {
      return isSingle === '1' ? 'multiSel' : type
    }
    return type
  }

  const getComparison = (field) => {
    const { type, isSingle } = field
    // 单选或下拉单选
    if ((isSingle === '0' && type === 'listSel') || type === 'singleSel') {
      return 'EQUALS'
    }
    return ''
  }

  // 字段的params/cascade/treeVos等选项
  const getFieldParams = (field) => {
    const { type, params, cascade, treeVos } = field
    if (type === 'treeSel') {
      return treeVos
    } else if (type === 'cascader') {
      return cascade
    } else {
      return params
    }
  }

  const { type, value, empty, field } = props

  switch (type) {
    case 'visible':
      return (
        <RadioGroup value={value} onChange={(e) => handleChange(e.target.value, 'value')}>
          <Radio value="1">{i18n('conf.model.linkage.strategy.tip7', '显示')}</Radio>
          <Radio value="0">{i18n('conf.model.linkage.strategy.tip8', '隐藏')}</Radio>
        </RadioGroup>
      )
    case 'checkIn':
      return (
        <RadioGroup value={value} onChange={(e) => handleChange(e.target.value, 'value')}>
          {field.type !== 'btn' && (
            <Radio value="1">{i18n('conf.model.field.required', '必填')}</Radio>
          )}
          <Radio value="0">{i18n('conf.model.field.optional', '选填')}</Radio>
          <Radio value="2">{i18n('conf.model.field.read-only', '只读')}</Radio>
        </RadioGroup>
      )
    case 'changeValue':
      const isEmpty = empty === 1
      return (
        <div style={{ paddingRight: 15 }}>
          <TriggerValueList
            disabled={isEmpty}
            value={isEmpty ? undefined : value}
            comparsionType={getFieldType(field)}
            conditionList={getFieldParams(field)}
            comparison={getComparison(field)}
            selectedField={field}
            handleChange={(value) => handleChange(value, 'value')}
          />
          <Checkbox
            checked={isEmpty}
            onChange={(e) => handleChange(e.target.checked ? 1 : 0, 'empty')}
          >
            {i18n('set.empty', '置空')}
          </Checkbox>
        </div>
      )
    case 'asyncValue':
      return (
        <Input.TextArea
          comparison="EQUALS"
          style={{ width: 300 }}
          autosize={{ minRows: 3 }}
          value={value}
          onChange={(e) => handleChange(e.target.value, 'value')}
        />
      )
    case 'timeValidate':
      return (
        <TimeValidate
          fieldCode={field.code}
          value={value}
          onChange={(value) => handleChange(value, 'value')}
        />
      )
    default:
      return null
  }
}

ChangeValue.defaultProps = {
  field: {},
  type: '',
  value: undefined,
  onChange: () => {}
}

export default ChangeValue

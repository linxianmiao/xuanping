import React from 'react'
import { Checkbox } from '@uyun/components'
import Select from './Select'
import Variable from './Variable'
import styles from './index.module.less'

const CHANGE_OPTIONS = [
  { label: i18n('conf.model.linkage.strategy.tip1', '可见性'), value: 'visible' },
  { label: i18n('conf.model.linkage.strategy.tip2', '基础检验'), value: 'checkIn' },
  { label: i18n('conf.model.linkage.strategy.tip3', '值改变'), value: 'changeValue' },
  { label: i18n('conf.model.linkage.strategy.tip4', '动态值'), value: 'asyncValue' },
  { label: i18n('time.validate', '时间校验'), value: 'timeValidate' }
]

const Changes = (props) => {
  const handleTriggerimmediately = (checked) => {
    const nextValue = { ...props.value }

    nextValue.initialValue = checked
    props.onChange(nextValue)
  }

  // f = 'value' | 'empty'
  const handleVariableValueChange = (value, type, f = 'value') => {
    const nextValue = { ...props.value }
    const { changeContent } = nextValue

    const option = changeContent.find((item) => item.type === type)

    if (option) {
      option[f] = value
      props.onChange(nextValue)
    }
  }

  const handleVariableSelect = (selected) => {
    const nextValue = { ...props.value }
    const { changeContent = [] } = props.value
    const nextChangeContent = []

    // 为了保持顺序，先从CHANGE_OPTIONS中取选中项
    const selectedOptions = CHANGE_OPTIONS.filter((item) => selected.includes(item.value))

    selectedOptions.forEach((option) => {
      const change = changeContent.find((item) => item.type === option.value)

      if (change) {
        nextChangeContent.push(change)
      } else {
        nextChangeContent.push({ type: option.value, value: undefined })
      }
    })

    nextValue.changeContent = nextChangeContent
    props.onChange(nextValue)
  }

  const renderVariable = (changeItem) => {
    const changeOption = CHANGE_OPTIONS.find((option) => option.value === changeItem.type)

    if (!changeOption) {
      return null
    }

    const { field } = props

    return (
      <Variable
        key={field.code}
        field={field}
        data={changeItem}
        label={changeOption.label}
        onChange={(value, f) => handleVariableValueChange(value, changeItem.type, f)}
      />
    )
  }

  const { value, field, linkSource } = props
  const { changeContent = [], initialValue } = value
  const selectedVariables = changeContent.map((item) => item.type)

  return (
    <div className={styles.wrap}>
      <Checkbox
        className={styles.trigger}
        checked={!!initialValue}
        onChange={(e) => handleTriggerimmediately(e.target.checked)}
      >
        {i18n('conf.model.linkage.strategy.tip6', '立即触发')}
      </Checkbox>
      <Select
        fieldType={field.type}
        options={CHANGE_OPTIONS}
        linkSource={linkSource}
        value={selectedVariables}
        onChange={handleVariableSelect}
      />
      {changeContent.length > 0 && (
        <div className={styles.panel}>{changeContent.map(renderVariable)}</div>
      )}
    </div>
  )
}

Changes.defaultProps = {
  field: {}, // 绑定关联策略的字段
  value: {},
  onChange: () => {}
}

export default Changes

import React, { useState, useMemo, useCallback } from 'react'
import { Popover } from '@uyun/components'
import Content from './content'
import Title from './title'
import './index.less'

export default function FilterFields(props) {
  const [value, setValue] = useState(undefined)
  const { children, placement, trigger, handleChange, checkedList, builtinFields, attribute, extendedFields } = props
  const filterName = useCallback(
    (name, value) => {
      if (_.isEmpty(value)) return true
      return name.indexOf(value) !== -1
    },
    []
  )
  const contentObj = useMemo(
    () => ({
      attribute: _.filter(attribute, item => filterName(item.name, value)),
      builtinFields: _.filter(builtinFields, item => filterName(item.name, value)),
      extendedFields: _.filter(extendedFields, item => filterName(item.name, value))
    }),
    [value, builtinFields, extendedFields, attribute]
  )

  return (
    <Popover
      trigger={trigger}
      placement={placement}
      overlayClassName="itsm-component-filter-fields-popover"
      title={
        <Title value={value} setValue={setValue} />
      }
      content={
        <Content
          contentObj={contentObj}
          checkedList={checkedList}
          handleChange={handleChange}
        />
      }>
      {children}
    </Popover>

  )
}

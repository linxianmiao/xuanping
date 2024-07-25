import React from 'react'
import Types from 'prop-types'
import { Popover } from '@uyun/components'
import Content from './Content'
import styles from './index.module.less'

export default function FilterFields(props) {
  const { children, sortable, fixedFields, builtinFields, extendedFields, onChange, checkedColumnCodes, loading, setCheckedCodes, getPopupContainer } = props
  const content = (
    <Content
      fixedFields={fixedFields}
      builtinFields={builtinFields}
      extendedFields={extendedFields}
      checkedColumnCodes={checkedColumnCodes}
      onChange={onChange}
      sortable={sortable}
      loading={loading}
      setCheckedCodes={setCheckedCodes}
    />
  )
  return (
    <Popover
      content={content}
      placement="bottom"
      trigger="click"
      overlayClassName={styles.overlayWrapper}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Popover>
  )
}

FilterFields.propTypes = {
  children: Types.element.isRequired,
  sortable: Types.bool,
  fixedFields: Types.array,
  builtinFields: Types.array,
  extendedFields: Types.array,
  checkedColumnCodes: Types.array,
  onChange: Types.func,
  loading: Types.bool,
  setCheckedCodes: Types.func,
  getPopupContainer: Types.func
}

FilterFields.defaultProps = {
  // 若为false，则可用于添加筛选项
  sortable: false,
  fixedFields: [],
  builtinFields: [],
  extendedFields: [],
  checkedColumnCodes: [],
  onChange: () => { },
  loading: false,
  setCheckedCodes: () => { },
  getPopupContainer: () => document.body
}

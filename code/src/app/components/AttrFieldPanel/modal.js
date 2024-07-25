import React, { useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { Modal } from '@uyun/components'

import Panel from './panel'
import { disabledType, initAttrList, tabPane } from './constants'

const AttrFieldPanelModal = (props) => {
  const {
    children,
    title,
    selected,
    attrList,
    sortable,
    disabledType,
    tabPane,
    modelIds,
    onChange,
    lockCondition = [],
    forbiddenFields
  } = props
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState(selected)
  const changePanel = useRef((value) => setValue(value))
  useMemo(() => setValue(selected), [selected])
  return (
    <>
      <span onClick={() => setVisible(true)}>{children}</span>
      <Modal
        visible={visible}
        title={title}
        destroyOnClose
        width={800}
        bodyStyle={{ height: 400, overflow: 'hidden' }}
        onCancel={() => {
          setVisible(false)
          setValue(selected)
        }}
        onOk={() => {
          onChange(value)
          setVisible(false)
          setValue(value.length === 0 ? value : [])
        }}
      >
        <Panel
          value={value}
          onChange={changePanel.current}
          attrList={attrList}
          sortable={sortable}
          modelIds={modelIds}
          disabledType={disabledType}
          tabPane={tabPane}
          lockCondition={lockCondition}
          forbiddenFields={forbiddenFields}
        />
      </Modal>
    </>
  )
}

AttrFieldPanelModal.propTypes = {
  children: PropTypes.element,
  title: PropTypes.string,
  selected: PropTypes.array,
  attrList: PropTypes.array,
  sortable: PropTypes.bool,
  disabledCode: PropTypes.array,
  tabPane: PropTypes.array,
  modelIds: PropTypes.array,
  onChange: PropTypes.func,
  lockCondition: PropTypes.array
}

AttrFieldPanelModal.defaultProps = {
  children: '',
  title: '',
  selected: [], // 选中的字段或属性
  attrList: initAttrList, // 通用属性的默认选项
  sortable: true, // 是否要排序
  disabledType: disabledType, // 需要禁用的类型
  tabPane: tabPane, // 默认两个面板都显示
  modelIds: [], // 获取模型的私有字段
  onChange: () => {},
  lockCondition: []
}

export default AttrFieldPanelModal

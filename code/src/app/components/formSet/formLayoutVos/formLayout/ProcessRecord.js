import React, { useState, lazy, Suspense } from 'react'
import { Collapse, Modal, Title } from '@uyun/components'
import Log from '~/ticket/log/index.js'

const ProcessRecord = (props) => {
  const [activeKey, setActiveKey] = useState('1')

  const handleDel = (e) => {
    e.stopPropagation()
    const { layoutIndex, parentType } = props
    Modal.confirm({
      title: i18n('model.field.edit.right.del.iframe.tip', '确定要删除该控件？'),
      onOk: () => {
        props.handleSideShow(null, 'side')
        props.handleDelLayout(layoutIndex, undefined, undefined, parentType)
      }
    })
  }

  const handleSideShow = (e) => {
    e.stopPropagation()
    const { layoutIndex, tabsIndex, fieldIndex } = props
    props.handleSideShow({
      layoutIndex: layoutIndex,
      tabsIndex,
      fieldIndex,
      parentType: 'layout'
    })
  }

  const getExtra = () => {
    return props.disabled ? null : <i onClick={handleDel} className="iconfont icon-shanchu" />
  }

  return (
    <Collapse
      activeKey={activeKey}
      onChange={() => {
        const activeKey2 = activeKey === '1' ? '0' : '1'
        setActiveKey(activeKey2)
      }}
      className="no-border-collapse"
    >
      <Collapse.Card
        header={<span onClick={handleSideShow}>{props.formLayout.name}</span>}
        extra={getExtra()}
        key="1"
      >
        <Log source="formset" />
      </Collapse.Card>
    </Collapse>
  )
}

export default ProcessRecord

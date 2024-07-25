import React, { useState, lazy, Suspense } from 'react'
import { Collapse, Modal } from '@uyun/components'

import './RelateAutoJob.less'

const AutoPlanEdit = lazy(() =>
  import(/* webpackChunkName: "automation-plan-edit" */ '~/components/automation-plan-edit')
)

const RelateAutoJob = (props) => {
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
    >
      <Collapse.Card
        header={<span onClick={handleSideShow}>{props.formLayout.name}</span>}
        extra={getExtra()}
        key="1"
      >
        <Suspense fallback={null}>
          <AutoPlanEdit
            product="itsm"
            hideField={[
              'name',
              'execAuth',
              'execAccount',
              'isSendAlert',
              'noWaitWhenExecError',
              'timeout',
              'verifyCode',
              'optScene',
              'accreditUsers'
            ]}
          />
        </Suspense>
      </Collapse.Card>
    </Collapse>
  )
}

export default RelateAutoJob

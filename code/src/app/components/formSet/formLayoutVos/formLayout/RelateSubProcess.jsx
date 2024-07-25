import React, { useState, useEffect } from 'react'
import { Table, Collapse, Modal, Button, Title } from '@uyun/components'
import { toJS } from 'mobx'
import { PlusOutlined } from '@uyun/icons'

function RelateSubProcess(props) {
  const [activeKey, setActiveKey] = useState('1')
  const [customColumns, setCustomColumns] = useState([])
  const {
    name,
    isRequired,
    prefixProcessTask,
    styleAttribute,
    commonFieldColumnList,
    commonColumnList
  } = props.formLayout
  const customName = prefixProcessTask || i18n('ticket.list.SubProcess', '子流程')

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
  const getExtra = () => {
    return props.disabled ? null : <i onClick={handleDel} className="iconfont icon-shanchu" />
  }

  useEffect(() => {
    const commonColumns = _.map(commonColumnList, (d) => ({
      title: d.fieldName,
      dataIndex: d.fieldCode
    }))
    setCustomColumns(commonColumns)
  }, [commonColumnList])
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
        key="1"
        header={
          <span onClick={handleSideShow}>
            {isRequired === 1 ? <span className="required-item-icon">*</span> : null}
            {name}
          </span>
        }
        extra={getExtra()}
      >
        <Button className="task-add-btn" icon={<PlusOutlined />}>
          {i18n('task-combination', '任务组')}
        </Button>
        <Button icon={<PlusOutlined />}>{i18n('conf.model.proces.task', '任务')}</Button>
        <Table columns={customColumns} dataSource={[]} pagination={false} />
      </Collapse.Card>
    </Collapse>
  )
}

export default RelateSubProcess

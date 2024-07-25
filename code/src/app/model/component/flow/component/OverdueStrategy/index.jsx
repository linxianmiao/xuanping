import React, { useState, useRef } from 'react'
import { PlusOutlined } from '@uyun/icons'
import { Modal, Form as UForm } from '@uyun/components'
import Form from './Form'
import styles from './index.module.less'

const FormItem = UForm.Item

const validator = (monitors, value) => {
  return (
    monitors &&
    monitors.some((monitor) => {
      if (!monitor.useTimingMonitor) {
        return false
      }
      return !value || value.findIndex((item) => item.olaId === monitor.id) < 0
    })
  )
}

const OverdueStrategy = ({
  isSubmit = false,
  links = [],
  olaMonitors = [],
  value = [],
  onChange = () => {}
}) => {
  const [visible, setVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  // 当前正在编辑的index
  const [currentIndex, setCurrentIndex] = useState()

  const formRef = useRef()

  const handleOk = () => {
    formRef.current.onSubmit((strategy) => {
      const nextValue = [...value]
      nextValue[currentIndex] = strategy
      onChange(nextValue)
      setVisible(false)
    })
  }

  const handleDelete = (index, e) => {
    e.stopPropagation()

    const nextValue = [...value]
    nextValue.splice(index, 1)
    onChange(nextValue)
  }

  const isError = validator(olaMonitors, value) && isSubmit

  return (
    <div>
      {value.map((item, index) => (
        <div
          key={item.id}
          className={styles.editBtn}
          onClick={() => {
            setModalTitle(item.name)
            setCurrentIndex(index)
            setVisible(true)
          }}
        >
          {item.name}
          <i className="iconfont icon-cha" onClick={(e) => handleDelete(index, e)} />
        </div>
      ))}

      <FormItem
        validateStatus={isError ? 'error' : 'success'}
        help={isError ? '请完善逾期策略' : ''}
      >
        <div
          className={styles.addBtn}
          onClick={() => {
            setModalTitle('新建逾期策略')
            setCurrentIndex(value.length)
            setVisible(true)
          }}
        >
          <PlusOutlined />
          &nbsp;{i18n('add_noti_rules', '添加策略')}
        </div>
      </FormItem>

      <Modal
        title={modalTitle}
        width={777}
        visible={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={handleOk}
      >
        <Form
          wrappedComponentRef={formRef}
          links={links}
          olaMonitors={olaMonitors}
          value={value[currentIndex]}
        />
      </Modal>
    </div>
  )
}

export default OverdueStrategy

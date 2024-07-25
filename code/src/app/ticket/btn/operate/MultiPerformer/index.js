import React from 'react'
import { Modal } from '@uyun/components'
import Form from './form'

const MultiPerformerModal = props => {
  const { onOk, multiPerformerLoading, btnInfo, ...restProps } = props
  const { messageName, messageStatus } = btnInfo || {}
  const formRef = React.createRef()

  const handleOk = () => {
    if (formRef && formRef.current) {
      formRef.current.validateFields((errors, values) => {
        if (!errors) {
          values.addPerformers = values.addPerformers.map(item => item.id)
          onOk(values, formRef.current)
        }
      })
    }
  }

  return (
    <Modal {...restProps} onOk={handleOk} confirmLoading={multiPerformerLoading} className="multi-performer">
      <Form ref={formRef} messageName={messageName} messageStatus={messageStatus} />
    </Modal>
  )
}

export default MultiPerformerModal

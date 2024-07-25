import React from 'react'
import { Modal } from '@uyun/components'
import Form from './Form'

const CarbonCopyModal = props => {
  const { onOk, btnInfo, ...restProps } = props
  const { modalTitle, messageName, messageStatus } = btnInfo || {}
  const formRef = React.createRef()

  const handleOk = () => {
    if (formRef && formRef.current) {
      formRef.current.validateFields((errors, values) => {
        if (!errors) {
          onOk(values)
        }
      })
    }
  }

  return (
    <Modal
      {...restProps}
      title={modalTitle || i18n('carbon.copy')}
      onOk={handleOk}
    >
      <Form ref={formRef} messageName={messageName} messageStatus={messageStatus}/>
    </Modal>
  )
}

export default CarbonCopyModal

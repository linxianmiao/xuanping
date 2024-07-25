import React from 'react'
import { Form } from '@uyun/components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const TicketAction = ({
  trigger = {}
}) => {
  const getText = () => {
    switch (trigger.type) {
      case 'closeTicket':
        return '关闭工单'
      case 'rollbackTicket':
        return '自动回退到发起节点'
      case 'approveTicket':
        return '自动审批到下一节点'
      default:
        return ''
    }
  }

  return (
    <FormItem {...formItemLayout} label="执行">
      <p style={{ lineHeight: '32px' }}>{getText()}</p>
    </FormItem>
  )
}

export default TicketAction

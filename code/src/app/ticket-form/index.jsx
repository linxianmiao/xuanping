/**
 * 这是提供给其他产品的工单表单模块
 */
import React from 'react'
import { Provider } from 'mobx-react'
import Form from '~/ticket/forms'
import stores from '~/stores'

function TicketForm(props) {
  const { formRef, ...restProps } = props
  return (
    <Provider {...stores}>
      <Form ref={formRef} {...restProps} />
    </Provider>
  )
}

export default TicketForm

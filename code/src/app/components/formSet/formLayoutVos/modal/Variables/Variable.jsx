import React from 'react'
import { Form } from '@uyun/components'
import Value from './Value'

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const Variable = props => {
  const { field, data, label, onChange } = props
  const { type, value, empty } = data

  return (
    <Form.Item
      {...formItemLayout}
      key={type}
      style={{ marginBottom: 0 }}
      label={label}
    >
      <Value
        field={field}
        type={type}
        value={value}
        empty={empty}
        onChange={onChange}
      />
    </Form.Item>
  )
}

Variable.defaultProps = {
  field: {},
  label: '',
  data: {},
  onChange: () => {}
}

export default Variable

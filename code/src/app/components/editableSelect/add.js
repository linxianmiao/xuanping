import React, { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@uyun/icons'
import { Input, Button, message } from '@uyun/components'

const Add = (props) => {
  const { value, loading, onOk, onCancel } = props
  const [name, setName] = useState(value)
  const [code, setCode] = useState(undefined)

  const handleOk = () => {
    if (!name || !code) {
      message.error(i18n('name.or.code.empty.error'))
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(code)) {
      message.error(i18n('field_create_code_error1'))
      return
    }
    onOk(name, code)
  }

  return (
    <div className="cs-option-edit" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
      <div className="cs-option-edit-input-wrap cs-option-add-input-wrap">
        <Input
          size="small"
          maxLength={32}
          placeholder={i18n('ticket.forms.pinputName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          size="small"
          placeholder={i18n('model.group.code.placeholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <Button size="small" loading={loading} onClick={handleOk}>
        <CheckOutlined />
      </Button>
      <Button size="small" loading={loading} onClick={() => onCancel()}>
        <CloseOutlined />
      </Button>
    </div>
  )
}

export default Add
